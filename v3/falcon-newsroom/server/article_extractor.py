"""Hardened article extraction helpers for Falcon Newsroom.

The network boundary in this module is intentionally independent from Flask,
MongoDB, authentication, and rate limiting.  Callers are expected to authorize
the request before invoking :func:`extract_article`.

Public entry points:

* ``canonicalize_article_url`` validates URL syntax and returns a stable URL.
* ``validate_article_url`` additionally enforces the publication host and DNS.
* ``fetch_article_html`` performs a bounded, manually redirected HTML request.
* ``parse_article_html`` extracts bounded SNO/WordPress article metadata.
* ``extract_article`` combines the above and optionally asks Gemini for names.

Only safe, user-facing error messages leave this module.  Network and provider
exceptions are deliberately not interpolated into errors or result metadata.
"""

from __future__ import annotations

import codecs
import html as html_module
import ipaddress
import json
import os
import queue
import re
import socket
import ssl
import threading
import time
from dataclasses import dataclass
from typing import Any, Callable, Iterable, Mapping, Sequence
from urllib.parse import unquote, urljoin, urlsplit, urlunsplit

import requests
import urllib3
from bs4 import BeautifulSoup


DEFAULT_TOTAL_TIMEOUT_SECONDS = 12.0
DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024
DEFAULT_MAX_REDIRECTS = 3
MAX_HTML_PARSE_CHARS = DEFAULT_MAX_RESPONSE_BYTES
MAX_TITLE_CHARS = 300
MAX_AUTHOR_CHARS = 100
MAX_AUTHORS = 20
MAX_TAG_CHARS = 80
MAX_TAGS = 30
MAX_DATE_CHARS = 120
MAX_BODY_CHARS = 60_000
MAX_PARAGRAPHS = 500
MAX_MODEL_RESPONSE_CHARS = 50_000
MAX_INTERVIEWEES = 50
MAX_INTERVIEWEE_NAME_CHARS = 100
GEMINI_TIMEOUT_SECONDS = 12
GEMINI_TIMEOUT_MILLISECONDS = GEMINI_TIMEOUT_SECONDS * 1_000
GEMINI_MAX_OUTPUT_TOKENS = 512
DNS_TIMEOUT_SECONDS = 4.0
MAX_DNS_RECORDS = 32
MAX_RESOLVED_IPS = 4

HTML_CONTENT_TYPES = frozenset({"text/html", "application/xhtml+xml"})
REDIRECT_STATUSES = frozenset({301, 302, 303, 307, 308})
ALLOWED_PORTS = frozenset({80, 443})
USER_AGENT = "FalconNewsroomArticleExtractor/3.0"

_HOST_LABEL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
_CHARSET_RE = re.compile(r"(?:^|;)\s*charset\s*=\s*[\"']?([^;\"'\s]+)", re.IGNORECASE)
_MONTH_DATE_RE = re.compile(
    r"\b(?:January|February|March|April|May|June|July|August|September|"
    r"October|November|December)\s+\d{1,2},\s+\d{4}\b",
    re.IGNORECASE,
)
_AUTHOR_ROLE_RE = re.compile(
    r"\s*,?\s*(?:staff writers?|staff|writer|reporter|contributor|"
    r"freelance writer|editor(?:-in-chief)?|managing editor|news editor|"
    r"sports editor|opinion editor|beat leader(?:\s*;\s*writer)?|"
    r"photographer|digital designer)\s*$",
    re.IGNORECASE,
)
_HONORIFIC_RE = re.compile(
    r"^(?:(?:mr|mrs|ms|miss|mx|dr|prof|coach|principal|teacher)\.?\s+)+",
    re.IGNORECASE,
)
_NOISY_TAGS = frozenset({"", "home", "more", "story archive"})


class ArticleExtractionError(ValueError):
    """A safe error that can be returned to an API client."""

    def __init__(self, code: str, message: str):
        self.code = code
        self.public_message = message
        super().__init__(message)

    def to_dict(self) -> dict[str, str]:
        return {"code": self.code, "error": self.public_message}


@dataclass(frozen=True)
class ValidatedArticleURL:
    """A canonical URL and the public addresses approved for its current hop."""

    url: str
    host: str
    port: int
    resolved_ips: tuple[str, ...]


@dataclass(frozen=True)
class FetchedArticle:
    """Bounded HTML fetched from a validated publication URL."""

    url: str
    html: str
    content_type: str
    byte_length: int
    redirects: tuple[str, ...] = ()


Resolver = Callable[..., Sequence[Any]]
Clock = Callable[[], float]
GeminiGenerator = Callable[[str, str, str], str]


def _safe_error(code: str, message: str) -> ArticleExtractionError:
    return ArticleExtractionError(code, message)


def _has_raw_unsafe_characters(value: str) -> bool:
    return "\\" in value or any(ord(char) < 32 or ord(char) == 127 or char.isspace() for char in value)


def _has_encoded_unsafe_characters(value: str) -> bool:
    try:
        decoded = unquote(value)
    except Exception:
        return True
    return "\\" in decoded or any(ord(char) < 32 or ord(char) == 127 for char in decoded)


def _normalize_host(host: str) -> str:
    raw = (host or "").strip().rstrip(".").lower()
    if not raw:
        raise _safe_error("invalid_host", "The article URL must include a valid hostname.")
    if "%" in raw:
        # Scoped IPv6 literals are meaningful only on the local host and must
        # never cross this network boundary.
        raise _safe_error("invalid_host", "The article URL must include a valid hostname.")
    try:
        parsed_ip = ipaddress.ip_address(raw)
        return parsed_ip.compressed
    except ValueError:
        pass
    try:
        ascii_host = raw.encode("idna").decode("ascii").lower()
    except (UnicodeError, ValueError):
        raise _safe_error("invalid_host", "The article URL must include a valid hostname.") from None
    if len(ascii_host) > 253:
        raise _safe_error("invalid_host", "The article URL hostname is too long.")
    labels = ascii_host.split(".")
    if len(labels) < 2 or any(not _HOST_LABEL_RE.fullmatch(label) for label in labels):
        raise _safe_error("invalid_host", "The article URL must include a valid hostname.")
    return ascii_host


def normalize_publication_host(publication_host: str) -> str:
    """Return the normalized host from a workspace domain or publication URL."""

    raw_input = str(publication_host or "")
    if _has_raw_unsafe_characters(raw_input):
        raise _safe_error("invalid_publication_host", "The workspace publication host is invalid.")
    raw = raw_input.strip()
    if not raw or _has_encoded_unsafe_characters(raw):
        raise _safe_error("invalid_publication_host", "The workspace publication host is invalid.")
    try:
        parsed = urlsplit(raw if "://" in raw else f"//{raw}")
        if parsed.username is not None or parsed.password is not None:
            raise ValueError
        if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
            raise ValueError
        if parsed.port is not None:
            raise ValueError
        if "://" in raw and parsed.scheme.lower() not in {"http", "https"}:
            raise ValueError
        return _normalize_host(parsed.hostname or "")
    except ArticleExtractionError as exc:
        raise _safe_error("invalid_publication_host", "The workspace publication host is invalid.") from None
    except (TypeError, ValueError):
        raise _safe_error("invalid_publication_host", "The workspace publication host is invalid.") from None


def _format_netloc(host: str, port: int | None, scheme: str) -> str:
    host_text = f"[{host}]" if ":" in host else host
    default_port = 443 if scheme == "https" else 80
    return host_text if port is None or port == default_port else f"{host_text}:{port}"


def canonicalize_article_url(url: str) -> str:
    """Validate URL syntax and return a fragment-free canonical URL.

    This function does not perform DNS or publication-host validation.  Use
    :func:`validate_article_url` before making any network request.
    """

    raw_input = str(url or "")
    if _has_raw_unsafe_characters(raw_input):
        raise _safe_error("unsafe_url", "The article URL contains unsupported characters.")
    raw = raw_input.strip()
    if not raw:
        raise _safe_error("missing_url", "Enter an article URL.")
    if len(raw) > 2_048:
        raise _safe_error("url_too_long", "The article URL is too long.")
    if _has_encoded_unsafe_characters(raw):
        raise _safe_error("unsafe_url", "The article URL contains unsupported characters.")

    try:
        parsed = urlsplit(raw)
        scheme = parsed.scheme.lower()
        if scheme not in {"http", "https"}:
            raise _safe_error("invalid_scheme", "Article URLs must use http or https.")
        if parsed.username is not None or parsed.password is not None:
            raise _safe_error("userinfo_not_allowed", "Article URLs cannot include user credentials.")
        host = _normalize_host(parsed.hostname or "")
        port = parsed.port
    except ArticleExtractionError:
        raise
    except (TypeError, ValueError):
        raise _safe_error("invalid_url", "Enter a valid article URL.") from None

    if port is not None and port not in ALLOWED_PORTS:
        raise _safe_error("invalid_port", "Article URLs may only use ports 80 or 443.")

    path = parsed.path or "/"
    canonical = urlunsplit(
        (
            scheme,
            _format_netloc(host, port, scheme),
            path,
            parsed.query,
            "",
        )
    )
    return canonical


def is_publication_host(host: str, publication_host: str) -> bool:
    """Return whether ``host`` is the publication host or one of its subdomains."""

    normalized_host = _normalize_host(host)
    normalized_publication = normalize_publication_host(publication_host)
    try:
        ipaddress.ip_address(normalized_publication)
        return normalized_host == normalized_publication
    except ValueError:
        pass
    return normalized_host == normalized_publication or normalized_host.endswith(f".{normalized_publication}")


def _normalize_ip(value: Any) -> ipaddress.IPv4Address | ipaddress.IPv6Address:
    ip = ipaddress.ip_address(str(value).split("%", 1)[0])
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
        return ip.ipv4_mapped
    return ip


def _is_globally_routable(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return bool(
        ip.is_global
        and not ip.is_private
        and not ip.is_loopback
        and not ip.is_link_local
        and not ip.is_multicast
        and not ip.is_reserved
        and not ip.is_unspecified
    )


def _resolve_public_ips(
    host: str,
    port: int,
    resolver: Resolver,
    timeout: float = DNS_TIMEOUT_SECONDS,
) -> tuple[str, ...]:
    result_queue: queue.Queue = queue.Queue(maxsize=1)

    def run_resolver():
        try:
            result_queue.put((True, resolver(host, port, type=socket.SOCK_STREAM)), block=False)
        except Exception as exc:
            try:
                result_queue.put((False, exc), block=False)
            except queue.Full:
                pass

    threading.Thread(target=run_resolver, name="falcon-extractor-dns", daemon=True).start()
    try:
        succeeded, result = result_queue.get(timeout=max(0.1, min(float(timeout), DNS_TIMEOUT_SECONDS)))
    except queue.Empty:
        raise _safe_error("dns_failed", "The publication hostname could not be resolved.") from None
    if not succeeded:
        raise _safe_error("dns_failed", "The publication hostname could not be resolved.") from None
    records = list(result or ())
    if len(records) > MAX_DNS_RECORDS:
        raise _safe_error("dns_failed", "The publication hostname returned too many addresses.")

    addresses: list[str] = []
    seen: set[str] = set()
    for record in records or ():
        try:
            if isinstance(record, str):
                raw_ip = record
            else:
                sockaddr = record[4]
                raw_ip = sockaddr[0]
            ip = _normalize_ip(raw_ip)
        except (IndexError, TypeError, ValueError):
            continue
        canonical = ip.compressed
        if canonical not in seen:
            seen.add(canonical)
            addresses.append(canonical)

    if not addresses:
        raise _safe_error("dns_failed", "The publication hostname could not be resolved.")
    if any(not _is_globally_routable(_normalize_ip(address)) for address in addresses):
        raise _safe_error("blocked_address", "The article URL resolves to a non-public network address.")
    return tuple(sorted(addresses)[:MAX_RESOLVED_IPS])


def validate_article_url(
    url: str,
    publication_host: str,
    *,
    resolver: Resolver = socket.getaddrinfo,
    resolver_timeout: float = DNS_TIMEOUT_SECONDS,
) -> ValidatedArticleURL:
    """Canonicalize and validate one URL hop against host and DNS policy."""

    canonical = canonicalize_article_url(url)
    parsed = urlsplit(canonical)
    host = _normalize_host(parsed.hostname or "")
    if not is_publication_host(host, publication_host):
        raise _safe_error(
            "publication_host_mismatch",
            "The article URL must use the workspace publication domain.",
        )
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    resolved_ips = _resolve_public_ips(host, port, resolver, timeout=resolver_timeout)
    return ValidatedArticleURL(canonical, host, port, resolved_ips)


def _header(headers: Mapping[str, Any] | None, name: str) -> str:
    if not headers:
        return ""
    target = name.lower()
    for key, value in headers.items():
        if str(key).lower() == target:
            return str(value or "").strip()
    return ""


def _dig_attribute(root: Any, path: Iterable[str]) -> Any:
    current = root
    for name in path:
        if current is None:
            return None
        try:
            current = getattr(current, name)
        except Exception:
            return None
    return current


def _response_peer_ip(response: Any) -> str:
    """Best-effort peer address lookup across requests/urllib3 versions."""

    candidates = [
        _dig_attribute(response, ("peer_ip",)),
        _dig_attribute(response, ("raw", "peer_ip")),
        _dig_attribute(response, ("raw", "_connection", "sock")),
        _dig_attribute(response, ("raw", "connection", "sock")),
        _dig_attribute(response, ("raw", "_fp", "fp", "raw", "_sock")),
    ]
    for candidate in candidates:
        if not candidate:
            continue
        if hasattr(candidate, "getpeername"):
            try:
                candidate = candidate.getpeername()[0]
            except Exception:
                continue
        try:
            return _normalize_ip(candidate).compressed
        except (TypeError, ValueError):
            continue
    return ""


def _validate_peer_ip(response: Any, approved_ips: tuple[str, ...]) -> None:
    peer = _response_peer_ip(response)
    if not peer:
        raise _safe_error(
            "peer_address_unavailable",
            "The article server address could not be verified.",
        )
    try:
        peer_ip = _normalize_ip(peer)
        approved = {_normalize_ip(address) for address in approved_ips}
    except ValueError:
        raise _safe_error("peer_address_mismatch", "The article server address could not be verified.") from None
    if not _is_globally_routable(peer_ip) or peer_ip not in approved:
        raise _safe_error("peer_address_mismatch", "The article server address changed during the request.")


def _remaining_timeout(deadline: float, clock: Clock) -> float:
    remaining = deadline - clock()
    if remaining <= 0:
        raise _safe_error("fetch_timeout", "The article request timed out.")
    return remaining


def _decode_html(body: bytes, content_type: str) -> str:
    encoding = "utf-8"
    match = _CHARSET_RE.search(content_type)
    if match:
        candidate = match.group(1).strip()
        try:
            codecs.lookup(candidate)
            encoding = candidate
        except LookupError:
            encoding = "utf-8"
    return body.decode(encoding, errors="replace")


def _pinned_http_get(
    validated: ValidatedArticleURL,
    headers: Mapping[str, str],
    deadline: float,
    clock: Clock,
) -> tuple[Any, Any]:
    """Connect directly to a DNS-vetted IP while preserving HTTP Host and TLS SNI."""

    parsed = urlsplit(validated.url)
    request_target = urlunsplit(("", "", parsed.path or "/", parsed.query, ""))
    pinned_headers = {**headers, "Host": _format_netloc(validated.host, parsed.port, parsed.scheme)}
    last_was_timeout = False
    for address in validated.resolved_ips:
        pool = None
        try:
            remaining = _remaining_timeout(deadline, clock)
            timeout = (min(4.0, remaining), remaining)
            if parsed.scheme == "https":
                pool = urllib3.HTTPSConnectionPool(
                    address,
                    port=validated.port,
                    maxsize=1,
                    block=True,
                    assert_hostname=validated.host,
                    server_hostname=validated.host,
                    ssl_context=ssl.create_default_context(),
                )
            else:
                pool = urllib3.HTTPConnectionPool(
                    address,
                    port=validated.port,
                    maxsize=1,
                    block=True,
                )
            response = pool.urlopen(
                "GET",
                request_target,
                headers=pinned_headers,
                redirect=False,
                preload_content=False,
                retries=False,
                timeout=urllib3.Timeout(connect=timeout[0], read=timeout[1]),
            )
            return response, pool
        except urllib3.exceptions.TimeoutError:
            last_was_timeout = True
        except Exception:
            last_was_timeout = False
        if pool is not None:
            try:
                pool.close()
            except Exception:
                pass
    if last_was_timeout:
        raise _safe_error("fetch_timeout", "The article request timed out.")
    raise _safe_error("fetch_failed", "The article page could not be fetched.")


def _response_status(response: Any) -> int:
    return int(getattr(response, "status_code", getattr(response, "status", 0)) or 0)


def _response_chunks(response: Any) -> Iterable[bytes]:
    if hasattr(response, "iter_content"):
        return response.iter_content(chunk_size=65_536, decode_unicode=False)
    if hasattr(response, "stream"):
        return response.stream(65_536, decode_content=True)
    raise _safe_error("fetch_failed", "The article page could not be fetched.")


def fetch_article_html(
    url: str,
    publication_host: str,
    *,
    session: requests.Session | None = None,
    resolver: Resolver = socket.getaddrinfo,
    total_timeout: float = DEFAULT_TOTAL_TIMEOUT_SECONDS,
    max_bytes: int = DEFAULT_MAX_RESPONSE_BYTES,
    max_redirects: int = DEFAULT_MAX_REDIRECTS,
    clock: Clock = time.monotonic,
) -> FetchedArticle:
    """Fetch bounded article HTML with manual redirects and SSRF revalidation."""

    if total_timeout <= 0 or total_timeout > 60:
        raise _safe_error("invalid_fetch_policy", "The article fetch timeout is invalid.")
    if max_bytes <= 0 or max_bytes > 10 * 1024 * 1024:
        raise _safe_error("invalid_fetch_policy", "The article response-size limit is invalid.")
    if max_redirects < 0 or max_redirects > 10:
        raise _safe_error("invalid_fetch_policy", "The article redirect limit is invalid.")

    client = session
    if client is not None:
        try:
            client.trust_env = False
        except Exception:
            pass

    deadline = clock() + float(total_timeout)
    current = canonicalize_article_url(url)
    redirects: list[str] = []

    try:
        while True:
            remaining = _remaining_timeout(deadline, clock)
            validated = validate_article_url(
                current,
                publication_host,
                resolver=resolver,
                resolver_timeout=min(DNS_TIMEOUT_SECONDS, remaining),
            )
            remaining = _remaining_timeout(deadline, clock)
            timeout = (min(4.0, remaining), remaining)

            request_headers = {
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml;q=0.9",
            }
            pinned_pool = None
            try:
                if client is None:
                    response, pinned_pool = _pinned_http_get(validated, request_headers, deadline, clock)
                else:
                    response = client.get(
                        validated.url,
                        headers=request_headers,
                        allow_redirects=False,
                        stream=True,
                        timeout=timeout,
                    )
            except requests.Timeout:
                raise _safe_error("fetch_timeout", "The article request timed out.") from None
            except ArticleExtractionError:
                raise
            except Exception:
                raise _safe_error("fetch_failed", "The article page could not be fetched.") from None

            try:
                _remaining_timeout(deadline, clock)
                if client is not None:
                    _validate_peer_ip(response, validated.resolved_ips)
                status = _response_status(response)

                if status in REDIRECT_STATUSES:
                    if len(redirects) >= max_redirects:
                        raise _safe_error("too_many_redirects", "The article URL redirected too many times.")
                    location = _header(getattr(response, "headers", {}), "Location")
                    if not location:
                        raise _safe_error("invalid_redirect", "The article server returned an invalid redirect.")
                    if _has_raw_unsafe_characters(location) or _has_encoded_unsafe_characters(location):
                        raise _safe_error("invalid_redirect", "The article server returned an invalid redirect.")
                    next_url = canonicalize_article_url(urljoin(validated.url, location))
                    next_scheme = urlsplit(next_url).scheme
                    if urlsplit(validated.url).scheme == "https" and next_scheme != "https":
                        raise _safe_error(
                            "https_downgrade",
                            "The article URL attempted to downgrade a secure connection.",
                        )
                    if not is_publication_host(urlsplit(next_url).hostname or "", publication_host):
                        raise _safe_error(
                            "publication_host_mismatch",
                            "The article URL must use the workspace publication domain.",
                        )
                    redirects.append(next_url)
                    current = next_url
                    continue

                if status < 200 or status >= 300:
                    raise _safe_error("http_error", "The article server returned an unsuccessful response.")

                content_type_header = _header(getattr(response, "headers", {}), "Content-Type")
                mime = content_type_header.split(";", 1)[0].strip().lower()
                if mime not in HTML_CONTENT_TYPES:
                    raise _safe_error("invalid_content_type", "The article URL did not return an HTML page.")

                content_length = _header(getattr(response, "headers", {}), "Content-Length")
                if content_length:
                    try:
                        declared_length = int(content_length)
                    except ValueError:
                        declared_length = 0
                    if declared_length > max_bytes:
                        raise _safe_error("response_too_large", "The article page is too large to process.")

                body = bytearray()
                try:
                    chunks = _response_chunks(response)
                    for chunk in chunks:
                        _remaining_timeout(deadline, clock)
                        if not chunk:
                            continue
                        if isinstance(chunk, str):
                            chunk = chunk.encode("utf-8")
                        if len(body) + len(chunk) > max_bytes:
                            raise _safe_error("response_too_large", "The article page is too large to process.")
                        body.extend(chunk)
                except ArticleExtractionError:
                    raise
                except requests.Timeout:
                    raise _safe_error("fetch_timeout", "The article request timed out.") from None
                except urllib3.exceptions.TimeoutError:
                    raise _safe_error("fetch_timeout", "The article request timed out.") from None
                except Exception:
                    raise _safe_error("fetch_failed", "The article page could not be fetched.") from None

                return FetchedArticle(
                    url=validated.url,
                    html=_decode_html(bytes(body), content_type_header),
                    content_type=mime,
                    byte_length=len(body),
                    redirects=tuple(redirects),
                )
            finally:
                try:
                    response.close()
                except Exception:
                    pass
                if pinned_pool is not None:
                    try:
                        pinned_pool.close()
                    except Exception:
                        pass
    finally:
        if client is not None and session is None:
            try:
                client.close()
            except Exception:
                pass


def clean_text(value: Any, max_chars: int | None = None) -> str:
    if value is None:
        return ""
    normalized = (
        html_module.unescape(str(value))
        .replace("\xa0", " ")
        .replace("\u200b", "")
        .replace("\u200c", "")
        .replace("\u200d", "")
    )
    output = " ".join(normalized.split()).strip()
    if max_chars is not None and len(output) > max_chars:
        output = output[:max_chars].rstrip()
    return output


def _json_ld_items(soup: BeautifulSoup) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    queue: list[Any] = []
    for script in soup.select('script[type="application/ld+json"]')[:50]:
        raw = script.string or script.get_text()
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except (TypeError, ValueError, json.JSONDecodeError):
            continue
        queue.extend(data if isinstance(data, list) else [data])

    while queue and len(found) < 128:
        item = queue.pop(0)
        if not isinstance(item, dict):
            continue
        found.append(item)
        graph = item.get("@graph")
        if isinstance(graph, list):
            queue.extend(graph[:128])
    return found


def _article_json_ld(items: list[dict[str, Any]]) -> dict[str, Any]:
    for item in items:
        raw_types = item.get("@type")
        types = raw_types if isinstance(raw_types, list) else [raw_types]
        normalized = {clean_text(value).lower() for value in types}
        if normalized.intersection({"newsarticle", "article", "blogposting", "reportagenewsarticle"}):
            return item
    return {}


def _meta_values(soup: BeautifulSoup, *keys: str) -> list[str]:
    wanted = {key.lower() for key in keys}
    values: list[str] = []
    for meta in soup.find_all("meta", limit=300):
        key = clean_text(meta.get("property") or meta.get("name") or meta.get("itemprop")).lower()
        if key in wanted:
            value = clean_text(meta.get("content"))
            if value:
                values.append(value)
    return values


def _first_element_text(soup: BeautifulSoup, selectors: Iterable[str], max_chars: int) -> str:
    for selector in selectors:
        element = soup.select_one(selector)
        text = clean_text(element.get_text(" ")) if element else ""
        if text:
            return clean_text(text, max_chars)
    return ""


def _clean_author_name(value: Any) -> str:
    name = clean_text(value, MAX_AUTHOR_CHARS + 50)
    name = re.sub(r"^\s*(?:by|written by)\s+", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\s*\|\s*.*$", "", name)
    name = _MONTH_DATE_RE.sub("", name)
    name = re.sub(r"\s+Leave a Comment\s*$", "", name, flags=re.IGNORECASE)
    name = clean_text(_AUTHOR_ROLE_RE.sub("", name), MAX_AUTHOR_CHARS)
    name = name.strip(" ,;|-/")
    if not name or len(name) > MAX_AUTHOR_CHARS or not any(char.isalpha() for char in name):
        return ""
    return name


def _split_authors(value: Any) -> list[str]:
    raw = clean_text(value)
    raw = re.sub(r"^\s*(?:by|written by)\s+", "", raw, flags=re.IGNORECASE)
    return [
        name
        for part in re.split(r"\s+(?:and|&)\s+|,\s*(?=[A-ZÀ-ÖØ-Þ])", raw)
        if (name := _clean_author_name(part))
    ]


def _append_unique(
    output: list[str],
    seen: set[str],
    values: Iterable[Any],
    *,
    cleaner: Callable[[Any], str],
    limit: int,
) -> None:
    for value in values:
        cleaned = cleaner(value)
        key = cleaned.casefold()
        if not cleaned or key in seen:
            continue
        seen.add(key)
        output.append(cleaned)
        if len(output) >= limit:
            return


def _parse_title(soup: BeautifulSoup, article_ld: Mapping[str, Any]) -> str:
    title = _first_element_text(
        soup,
        (
            "h1.sno-story-headline",
            ".sno-story-headline",
            "h1.entry-title",
            ".entry-title",
            ".storyheadline",
            "article h1",
            "main h1",
        ),
        MAX_TITLE_CHARS,
    )
    if title:
        return title
    headline = clean_text(article_ld.get("headline") or article_ld.get("name"), MAX_TITLE_CHARS)
    if headline:
        return headline
    meta_titles = _meta_values(soup, "og:title", "twitter:title")
    if meta_titles:
        return clean_text(meta_titles[0], MAX_TITLE_CHARS)
    return clean_text(soup.title.get_text(" ") if soup.title else "", MAX_TITLE_CHARS)


def _parse_authors(soup: BeautifulSoup, article_ld: Mapping[str, Any]) -> list[str]:
    output: list[str] = []
    seen: set[str] = set()
    for selector in (
        ".sno-story-byline a[href]",
        ".storymeta a[href*='/staff_name/']",
        ".storymeta a[href*='/author/']",
        ".byline a[href]",
        ".story-byline a[href]",
        ".staffname a[href]",
        ".author.vcard",
        "a[rel='author']",
        "[itemprop='author'] [itemprop='name']",
    ):
        _append_unique(
            output,
            seen,
            (element.get_text(" ") for element in soup.select(selector)),
            cleaner=_clean_author_name,
            limit=MAX_AUTHORS,
        )
        if output:
            break

    if not output:
        raw_authors = article_ld.get("author")
        if isinstance(raw_authors, (str, dict)):
            raw_authors = [raw_authors]
        if isinstance(raw_authors, list):
            _append_unique(
                output,
                seen,
                (
                    item.get("name") if isinstance(item, dict) else item
                    for item in raw_authors
                ),
                cleaner=_clean_author_name,
                limit=MAX_AUTHORS,
            )

    if not output:
        for selector in (".sno-story-byline", ".storymeta", ".byline", ".story-byline", ".post-byline"):
            for element in soup.select(selector):
                _append_unique(
                    output,
                    seen,
                    _split_authors(element.get_text(" ")),
                    cleaner=_clean_author_name,
                    limit=MAX_AUTHORS,
                )
    if not output:
        for value in _meta_values(soup, "author", "article:author"):
            _append_unique(
                output,
                seen,
                _split_authors(value),
                cleaner=_clean_author_name,
                limit=MAX_AUTHORS,
            )
    return output[:MAX_AUTHORS]


def _clean_tag(value: Any) -> str:
    tag = clean_text(value, MAX_TAG_CHARS)
    if not tag or tag.casefold() in _NOISY_TAGS or tag.casefold().startswith("more in "):
        return ""
    if re.fullmatch(r"(?:19|20)\d{2}", tag):
        return ""
    return tag


def _tag_values(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return re.split(r"[,;|]", value)
    return [value] if value is not None else []


def _parse_tags(soup: BeautifulSoup, article_ld: Mapping[str, Any], authors: list[str]) -> list[str]:
    output: list[str] = []
    seen = {author.casefold() for author in authors}
    for selector in (
        "ul.sno-story-cat-block-list a",
        "a[rel='category tag']",
        ".cat-links a",
        ".post-categories a",
        ".tags-links a",
    ):
        _append_unique(
            output,
            seen,
            (element.get_text(" ") for element in soup.select(selector)),
            cleaner=_clean_tag,
            limit=MAX_TAGS,
        )
    for value in _meta_values(soup, "article:tag", "keywords", "news_keywords"):
        _append_unique(output, seen, _tag_values(value), cleaner=_clean_tag, limit=MAX_TAGS)
    for key in ("keywords", "articleSection"):
        _append_unique(
            output,
            seen,
            _tag_values(article_ld.get(key)),
            cleaner=_clean_tag,
            limit=MAX_TAGS,
        )
    return output[:MAX_TAGS]


def _clean_date(value: Any) -> str:
    raw = clean_text(value, MAX_DATE_CHARS)
    if not raw:
        return ""
    match = _MONTH_DATE_RE.search(raw)
    return clean_text(match.group(0) if match else raw, MAX_DATE_CHARS)


def _parse_date(soup: BeautifulSoup, article_ld: Mapping[str, Any]) -> str:
    candidates: list[Any] = []
    for selector in (
        ".sno-story-date .time-wrapper",
        ".sno-story-date",
        ".storydate",
        "time[datetime]",
        "time",
    ):
        for element in soup.select(selector)[:20]:
            candidates.append(element.get("datetime") or element.get_text(" "))
    candidates.extend(
        _meta_values(
            soup,
            "article:published_time",
            "date",
            "datepublished",
            "pubdate",
        )
    )
    candidates.extend(article_ld.get(key) for key in ("datePublished", "dateCreated", "dateModified"))
    for candidate in candidates:
        value = _clean_date(candidate)
        if value:
            return value
    return ""


def _parse_body(soup: BeautifulSoup) -> str:
    for tag in soup.select("script, style, template, noscript, nav, footer, aside, form"):
        tag.decompose()

    container = None
    for selector in (
        ".sno-story-body-content",
        "[itemprop='articleBody']",
        ".entry-content",
        ".storycontent",
        ".post-content",
        "article",
        "main",
    ):
        candidate = soup.select_one(selector)
        if candidate:
            container = candidate
            break
    container = container or soup.body or soup

    paragraphs: list[str] = []
    seen: set[str] = set()
    for element in container.find_all(["p", "blockquote", "li"], limit=MAX_PARAGRAPHS):
        text = clean_text(element.get_text(" "))
        key = text.casefold()
        if not text or key in seen:
            continue
        seen.add(key)
        paragraphs.append(text)
    if not paragraphs:
        fallback = clean_text(container.get_text(" "))
        paragraphs = [fallback] if fallback else []

    output = ""
    for paragraph in paragraphs:
        separator = "\n\n" if output else ""
        available = MAX_BODY_CHARS - len(output) - len(separator)
        if available <= 0:
            break
        output += separator + paragraph[:available]
    return output.rstrip()


def parse_article_html(html: str | bytes, *, url: str = "") -> dict[str, Any]:
    """Extract bounded metadata and body text from SNO/WordPress HTML."""

    if isinstance(html, bytes):
        source = html.decode("utf-8", errors="replace")
    else:
        source = str(html or "")
    source = source[:MAX_HTML_PARSE_CHARS]

    try:
        soup = BeautifulSoup(source, "html.parser")
    except Exception:
        raise _safe_error("invalid_html", "The article HTML could not be parsed.") from None

    json_ld = _article_json_ld(_json_ld_items(soup))
    title = _parse_title(soup, json_ld)
    authors = _parse_authors(soup, json_ld)
    tags = _parse_tags(soup, json_ld, authors)
    date_published = _parse_date(soup, json_ld)
    body = _parse_body(soup)
    return {
        "url": clean_text(url, 2_048),
        "title": title,
        "authors": authors,
        "tags": tags,
        "datePublished": date_published,
        "body": body,
    }


def _gemini_models() -> list[str]:
    configured = clean_text(os.getenv("GEMINI_MODELS") or os.getenv("GEMINI_MODEL"))
    candidates = configured.split(",") if configured else ["gemini-2.5-flash", "gemini-1.5-flash"]
    output: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        model = clean_text(candidate, 100)
        if model and model not in seen:
            seen.add(model)
            output.append(model)
    return output or ["gemini-2.5-flash"]


def _interviewee_prompt(body: str) -> str:
    article = clean_text(body, MAX_BODY_CHARS)
    return (
        "Identify every named person directly quoted or clearly interviewed in this school "
        "newspaper article. Exclude authors, editors, photographers, commenters, "
        "organizations, schools, teams, unnamed people, and people merely mentioned. "
        "Return only a JSON array of full-name strings. Return [] when there are none.\n\n"
        f"Article:\n{article}"
    )


def _modern_gemini_generate(prompt: str, api_key: str, model: str) -> str:
    # Provider imports stay optional and lazy so metadata extraction never
    # depends on a Gemini package being installed.
    from google import genai

    client = genai.Client(
        api_key=api_key,
        http_options={"timeout": GEMINI_TIMEOUT_MILLISECONDS},
    )
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "temperature": 0,
            "response_mime_type": "application/json",
            "max_output_tokens": GEMINI_MAX_OUTPUT_TOKENS,
        },
    )
    return str(getattr(response, "text", "") or "")


def _legacy_gemini_generate(prompt: str, api_key: str, model: str) -> str:
    import google.generativeai as legacy_genai

    legacy_genai.configure(api_key=api_key)
    response = legacy_genai.GenerativeModel(model).generate_content(
        prompt,
        generation_config={
            "temperature": 0,
            "response_mime_type": "application/json",
            "max_output_tokens": GEMINI_MAX_OUTPUT_TOKENS,
        },
        request_options={"timeout": GEMINI_TIMEOUT_SECONDS},
    )
    return str(getattr(response, "text", "") or "")


def _model_name_items(raw: str) -> list[Any]:
    text = clean_text(raw, MAX_MODEL_RESPONSE_CHARS)
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text).strip()
    try:
        data = json.loads(text)
    except (TypeError, ValueError, json.JSONDecodeError):
        match = re.search(r"\[[\s\S]*\]", text)
        if not match:
            raise ValueError
        data = json.loads(match.group(0))
    if isinstance(data, dict):
        data = data.get("people") or data.get("interviewees")
    if not isinstance(data, list):
        raise ValueError
    return data[:MAX_INTERVIEWEES]


def _clean_interviewee_name(value: Any) -> str:
    if isinstance(value, dict):
        value = (
            value.get("name")
            or value.get("fullName")
            or value.get("full_name")
            or " ".join(
                part
                for part in (
                    clean_text(value.get("firstName") or value.get("first_name")),
                    clean_text(value.get("lastName") or value.get("last_name")),
                )
                if part
            )
        )
    name = clean_text(value, MAX_INTERVIEWEE_NAME_CHARS + 20)
    name = clean_text(_HONORIFIC_RE.sub("", name), MAX_INTERVIEWEE_NAME_CHARS)
    if not name or not any(character.isalpha() for character in name):
        return ""
    if len(name.split()) > 8:
        return ""
    if any(
        not character.isalpha() and character not in {" ", "-", "'", "’", "."}
        for character in name
    ):
        return ""
    return name.strip(" ,;:-")


def _people_from_names(names: Iterable[Any]) -> list[dict[str, str]]:
    people: list[dict[str, str]] = []
    seen: set[str] = set()
    for value in names:
        name = _clean_interviewee_name(value)
        key = name.casefold()
        if not name or key in seen:
            continue
        seen.add(key)
        parts = name.split()
        people.append(
            {
                "name": name,
                "firstName": parts[0],
                "lastName": " ".join(parts[1:]),
                "grade": "",
                "house": "",
                "match": "unverified",
            }
        )
        if len(people) >= MAX_INTERVIEWEES:
            break
    return people


def extract_interviewees(
    article_body: str,
    api_key: str | None,
    *,
    generator: GeminiGenerator | None = None,
) -> tuple[list[dict[str, str]], dict[str, Any], list[dict[str, str]]]:
    """Optionally extract interviewees without making metadata success depend on AI."""

    warning = {
        "code": "manual_interviewee_review_required",
        "message": "Interviewees could not be extracted automatically. Add or review them manually.",
    }
    if not clean_text(api_key):
        return [], {"attempted": False, "status": "not_configured", "model": ""}, [warning]
    if not clean_text(article_body):
        return [], {"attempted": False, "status": "no_article_body", "model": ""}, [warning]

    prompt = _interviewee_prompt(article_body)
    # Keep the entire optional AI phase bounded to one provider attempt. The
    # legacy client is retained as a directly testable compatibility helper,
    # but serial provider/model fallbacks can multiply a 12-second timeout into
    # a minute-long request and leave the classroom UI needlessly blocked.
    generators = [generator] if generator else [_modern_gemini_generate]
    for model in _gemini_models()[:1]:
        for current_generator in generators:
            try:
                raw = current_generator(prompt, str(api_key), model)
                people = _people_from_names(_model_name_items(raw))
                status = "complete" if people else "no_people_found"
                warnings = [] if people else [warning]
                return people, {"attempted": True, "status": status, "model": model}, warnings
            except Exception:
                continue
    return [], {"attempted": True, "status": "unavailable", "model": ""}, [warning]


def extract_article(
    url: str,
    publication_host: str,
    *,
    gemini_api_key: str | None = None,
    gemini_generator: GeminiGenerator | None = None,
    session: requests.Session | None = None,
    resolver: Resolver = socket.getaddrinfo,
    total_timeout: float = DEFAULT_TOTAL_TIMEOUT_SECONDS,
    max_bytes: int = DEFAULT_MAX_RESPONSE_BYTES,
) -> dict[str, Any]:
    """Fetch metadata and optionally interviewees in a route-friendly shape."""

    fetched = fetch_article_html(
        url,
        publication_host,
        session=session,
        resolver=resolver,
        total_timeout=total_timeout,
        max_bytes=max_bytes,
    )
    article = parse_article_html(fetched.html, url=fetched.url)
    people, interviewee_extraction, warnings = extract_interviewees(
        article["body"],
        gemini_api_key,
        generator=gemini_generator,
    )
    return {
        "ok": True,
        "article_url": fetched.url,
        "article": article,
        "people": people,
        "warnings": warnings,
        "intervieweeExtraction": interviewee_extraction,
        "fetch": {
            "contentType": fetched.content_type,
            "byteLength": fetched.byte_length,
            "redirectCount": len(fetched.redirects),
        },
    }


__all__ = [
    "ArticleExtractionError",
    "FetchedArticle",
    "ValidatedArticleURL",
    "canonicalize_article_url",
    "extract_article",
    "extract_interviewees",
    "fetch_article_html",
    "is_publication_host",
    "normalize_publication_host",
    "parse_article_html",
    "validate_article_url",
]

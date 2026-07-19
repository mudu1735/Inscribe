from __future__ import annotations

import os
import socket
import sys
import types
import unittest
from unittest.mock import Mock, patch

import requests

from server import article_extractor as extractor_module
from server.article_extractor import (
    MAX_AUTHORS,
    MAX_BODY_CHARS,
    MAX_TAGS,
    MAX_TITLE_CHARS,
    ArticleExtractionError,
    FetchedArticle,
    canonicalize_article_url,
    extract_article,
    extract_interviewees,
    fetch_article_html,
    is_publication_host,
    normalize_publication_host,
    parse_article_html,
    validate_article_url,
)


PUBLIC_A = "93.184.216.34"
PUBLIC_B = "8.8.8.8"


def resolver_for(mapping):
    calls = []

    def resolver(host, port, *, type=socket.SOCK_STREAM):
        calls.append((host, port, type))
        value = mapping.get(host)
        if isinstance(value, BaseException):
            raise value
        if value is None:
            value = [PUBLIC_A]
        if isinstance(value, str):
            value = [value]
        records = []
        for address in value:
            family = socket.AF_INET6 if ":" in address else socket.AF_INET
            sockaddr = (address, port, 0, 0) if family == socket.AF_INET6 else (address, port)
            records.append((family, socket.SOCK_STREAM, 6, "", sockaddr))
        return records

    resolver.calls = calls
    return resolver


class FakeResponse:
    def __init__(
        self,
        status=200,
        *,
        headers=None,
        body=b"<html><body><p>Article</p></body></html>",
        chunks=None,
        peer_ip=PUBLIC_A,
    ):
        self.status_code = status
        self.headers = headers if headers is not None else {"Content-Type": "text/html; charset=utf-8"}
        self._chunks = list(chunks) if chunks is not None else [body]
        self.peer_ip = peer_ip
        self.closed = False

    def iter_content(self, chunk_size=1, decode_unicode=False):
        yield from self._chunks

    def close(self):
        self.closed = True


class FakeSession:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []
        self.trust_env = True
        self.closed = False

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        if not self.responses:
            raise AssertionError("Unexpected HTTP request")
        response = self.responses.pop(0)
        if isinstance(response, BaseException):
            raise response
        return response

    def close(self):
        self.closed = True


class UrlValidationTests(unittest.TestCase):
    def test_canonicalization_normalizes_host_port_path_and_fragment(self):
        self.assertEqual(
            canonicalize_article_url("HTTPS://News.Example.COM:443/story?id=7#comments"),
            "https://news.example.com/story?id=7",
        )
        self.assertEqual(canonicalize_article_url("http://example.com"), "http://example.com/")
        self.assertEqual(
            canonicalize_article_url("https://example.com:80/story"),
            "https://example.com:80/story",
        )

    def test_canonicalization_rejects_unsafe_urls(self):
        invalid = [
            "",
            " ftp://example.com/story",
            "ftp://example.com/story",
            "https://user:pass@example.com/story",
            "https://example.com:8443/story",
            "https://example.com\\@evil.test/story",
            "https://example.com/%5c%5cevil",
            "https://example.com/%0d%0aInjected",
            "https://example.com/story\n",
            "https://exa mple.com/story",
            "https://example.com.evil.test/\x00",
        ]
        for value in invalid:
            with self.subTest(value=repr(value)):
                with self.assertRaises(ArticleExtractionError):
                    canonicalize_article_url(value)

    def test_publication_host_is_exact_or_subdomain_only(self):
        self.assertTrue(is_publication_host("example.com", "https://example.com/"))
        self.assertTrue(is_publication_host("news.example.com", "example.com"))
        self.assertFalse(is_publication_host("example.com.evil.test", "example.com"))
        self.assertFalse(is_publication_host("evil-example.com", "example.com"))
        self.assertFalse(is_publication_host("example.co", "example.com"))
        self.assertTrue(is_publication_host("8.8.8.8", "8.8.8.8"))
        self.assertFalse(is_publication_host("sub.8.8.8.8", "8.8.8.8"))

    def test_publication_host_rejects_paths_credentials_and_ports(self):
        invalid = [
            "https://example.com/news",
            "https://user@example.com/",
            "example.com:8443",
            "javascript://example.com",
            "example.com\n",
        ]
        for value in invalid:
            with self.subTest(value=value):
                with self.assertRaises(ArticleExtractionError):
                    normalize_publication_host(value)

    def test_validate_allows_exact_host_and_subdomain(self):
        resolver = resolver_for({"example.com": PUBLIC_A, "news.example.com": PUBLIC_B})
        exact = validate_article_url("https://example.com/a", "example.com", resolver=resolver)
        child = validate_article_url("https://news.example.com/b", "example.com", resolver=resolver)
        self.assertEqual(exact.resolved_ips, (PUBLIC_A,))
        self.assertEqual(child.resolved_ips, (PUBLIC_B,))
        self.assertEqual([call[0] for call in resolver.calls], ["example.com", "news.example.com"])

    def test_validate_blocks_suffix_tricks_before_dns(self):
        resolver = resolver_for({})
        bad_urls = [
            "https://example.com.evil.test/story",
            "https://evil-example.com/story",
            "https://example.com@evil.test/story",
            "https://example.com%2eevil.test/story",
        ]
        for value in bad_urls:
            with self.subTest(value=value):
                with self.assertRaises(ArticleExtractionError):
                    validate_article_url(value, "example.com", resolver=resolver)
        self.assertEqual(resolver.calls, [])

    def test_validate_blocks_every_non_global_dns_address(self):
        private_addresses = [
            "127.0.0.1",
            "10.0.0.5",
            "169.254.169.254",
            "0.0.0.0",
            "224.0.0.1",
            "240.0.0.1",
            "::1",
            "fc00::1",
            "ff02::1",
        ]
        for address in private_addresses:
            with self.subTest(address=address):
                with self.assertRaises(ArticleExtractionError) as raised:
                    validate_article_url(
                        "https://example.com/story",
                        "example.com",
                        resolver=resolver_for({"example.com": address}),
                    )
                self.assertEqual(raised.exception.code, "blocked_address")

        with self.assertRaises(ArticleExtractionError) as mixed:
            validate_article_url(
                "https://example.com/story",
                "example.com",
                resolver=resolver_for({"example.com": [PUBLIC_A, "10.0.0.1"]}),
            )
        self.assertEqual(mixed.exception.code, "blocked_address")

    def test_dns_errors_are_redacted(self):
        resolver = resolver_for({"example.com": RuntimeError("SECRET_DNS_TOKEN")})
        with self.assertRaises(ArticleExtractionError) as raised:
            validate_article_url("https://example.com/story", "example.com", resolver=resolver)
        self.assertEqual(raised.exception.code, "dns_failed")
        self.assertNotIn("SECRET", str(raised.exception))


class FetchTests(unittest.TestCase):
    def test_owned_transport_pins_the_vetted_ip_and_preserves_tls_identity(self):
        calls = {}

        class PinnedResponse:
            status = 200
            headers = {"Content-Type": "text/html; charset=utf-8"}

            @staticmethod
            def stream(_amount, decode_content=False):
                self.assertTrue(decode_content)
                yield b"<h1>Pinned</h1>"

            @staticmethod
            def close():
                calls["responseClosed"] = True

        class PinnedPool:
            def __init__(self, host, **kwargs):
                calls["host"] = host
                calls["pool"] = kwargs

            def urlopen(self, method, target, **kwargs):
                calls["request"] = (method, target, kwargs)
                return PinnedResponse()

            def close(self):
                calls["poolClosed"] = True

        with patch.object(extractor_module.urllib3, "HTTPSConnectionPool", PinnedPool):
            fetched = fetch_article_html(
                "https://example.com/story?id=7",
                "example.com",
                resolver=resolver_for({"example.com": PUBLIC_A}),
            )

        self.assertEqual(fetched.html, "<h1>Pinned</h1>")
        self.assertEqual(calls["host"], PUBLIC_A)
        self.assertEqual(calls["pool"]["server_hostname"], "example.com")
        self.assertEqual(calls["pool"]["assert_hostname"], "example.com")
        self.assertEqual(calls["request"][0:2], ("GET", "/story?id=7"))
        self.assertEqual(calls["request"][2]["headers"]["Host"], "example.com")
        self.assertTrue(calls["responseClosed"])
        self.assertTrue(calls["poolClosed"])

    def test_fetch_uses_manual_redirects_revalidates_and_disables_environment(self):
        first = FakeResponse(
            302,
            headers={"Location": "//cdn.example.com/final"},
            body=b"",
            peer_ip=PUBLIC_A,
        )
        final = FakeResponse(
            headers={"Content-Type": "text/html; charset=utf-8"},
            body=b"<h1>Done</h1>",
            peer_ip=PUBLIC_B,
        )
        session = FakeSession([first, final])
        resolver = resolver_for({"example.com": PUBLIC_A, "cdn.example.com": PUBLIC_B})

        fetched = fetch_article_html(
            "https://example.com/start#fragment",
            "example.com",
            session=session,
            resolver=resolver,
        )

        self.assertEqual(fetched.url, "https://cdn.example.com/final")
        self.assertEqual(fetched.redirects, ("https://cdn.example.com/final",))
        self.assertEqual(fetched.html, "<h1>Done</h1>")
        self.assertFalse(session.trust_env)
        self.assertFalse(session.closed, "Caller-owned sessions must remain open")
        self.assertTrue(first.closed)
        self.assertTrue(final.closed)
        self.assertEqual(len(session.calls), 2)
        self.assertEqual(session.calls[0][0], "https://example.com/start")
        for _, kwargs in session.calls:
            self.assertIs(kwargs["allow_redirects"], False)
            self.assertIs(kwargs["stream"], True)
            self.assertIsInstance(kwargs["timeout"], tuple)
        self.assertEqual([call[0] for call in resolver.calls].count("cdn.example.com"), 1)

    def test_redirect_to_suffix_trick_is_blocked(self):
        session = FakeSession(
            [FakeResponse(302, headers={"Location": "https://example.com.evil.test/story"}, body=b"")]
        )
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/start",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
            )
        self.assertEqual(raised.exception.code, "publication_host_mismatch")
        self.assertEqual(len(session.calls), 1)

    def test_redirect_dns_is_revalidated(self):
        session = FakeSession(
            [FakeResponse(302, headers={"Location": "https://internal.example.com/story"}, body=b"")]
        )
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/start",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A, "internal.example.com": "127.0.0.1"}),
            )
        self.assertEqual(raised.exception.code, "blocked_address")

    def test_https_downgrade_is_blocked_at_any_redirect_hop(self):
        session = FakeSession(
            [
                FakeResponse(302, headers={"Location": "https://example.com/secure"}, body=b""),
                FakeResponse(302, headers={"Location": "http://example.com/plain"}, body=b""),
            ]
        )
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "http://example.com/start",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
            )
        self.assertEqual(raised.exception.code, "https_downgrade")

    def test_redirect_limit_is_enforced(self):
        session = FakeSession(
            [
                FakeResponse(302, headers={"Location": "/one"}, body=b""),
                FakeResponse(302, headers={"Location": "/two"}, body=b""),
            ]
        )
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/start",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
                max_redirects=1,
            )
        self.assertEqual(raised.exception.code, "too_many_redirects")

    def test_non_html_and_missing_mime_are_blocked(self):
        for headers in ({"Content-Type": "image/png"}, {}):
            with self.subTest(headers=headers):
                session = FakeSession([FakeResponse(headers=headers)])
                with self.assertRaises(ArticleExtractionError) as raised:
                    fetch_article_html(
                        "https://example.com/story",
                        "example.com",
                        session=session,
                        resolver=resolver_for({"example.com": PUBLIC_A}),
                    )
                self.assertEqual(raised.exception.code, "invalid_content_type")

    def test_xhtml_mime_and_declared_charset_are_supported(self):
        body = "<p>caf\xe9</p>".encode("latin-1")
        session = FakeSession(
            [
                FakeResponse(
                    headers={"Content-Type": "application/xhtml+xml; charset=latin-1"},
                    body=body,
                )
            ]
        )
        fetched = fetch_article_html(
            "https://example.com/story",
            "example.com",
            session=session,
            resolver=resolver_for({"example.com": PUBLIC_A}),
        )
        self.assertIn("café", fetched.html)

    def test_content_length_and_streamed_size_are_bounded(self):
        declared = FakeSession(
            [
                FakeResponse(
                    headers={"Content-Type": "text/html", "Content-Length": "101"},
                    body=b"x",
                )
            ]
        )
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/story",
                "example.com",
                session=declared,
                resolver=resolver_for({"example.com": PUBLIC_A}),
                max_bytes=100,
            )
        self.assertEqual(raised.exception.code, "response_too_large")

        streamed = FakeSession(
            [FakeResponse(headers={"Content-Type": "text/html"}, chunks=[b"12345678", b"901"])]
        )
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/story",
                "example.com",
                session=streamed,
                resolver=resolver_for({"example.com": PUBLIC_A}),
                max_bytes=10,
            )
        self.assertEqual(raised.exception.code, "response_too_large")

    def test_peer_ip_must_match_vetted_dns_address(self):
        session = FakeSession([FakeResponse(peer_ip=PUBLIC_B)])
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/story",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
            )
        self.assertEqual(raised.exception.code, "peer_address_mismatch")

    def test_peer_ip_verification_fails_closed_when_socket_is_unavailable(self):
        session = FakeSession([FakeResponse(peer_ip="")])
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/story",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
            )
        self.assertEqual(raised.exception.code, "peer_address_unavailable")
        self.assertNotIn("socket", str(raised.exception).lower())

    def test_scoped_ipv6_literal_is_rejected(self):
        with self.assertRaises(ArticleExtractionError) as raised:
            canonicalize_article_url("https://[fe80::1%25Ethernet]/story")
        self.assertEqual(raised.exception.code, "invalid_host")

    def test_timeout_and_network_errors_are_redacted(self):
        errors = [
            (requests.Timeout("SECRET_TIMEOUT_TOKEN"), "fetch_timeout"),
            (requests.ConnectionError("SECRET_CONNECTION_TOKEN"), "fetch_failed"),
            (RuntimeError("SECRET_UNEXPECTED_TOKEN"), "fetch_failed"),
        ]
        for error, code in errors:
            with self.subTest(code=code):
                session = FakeSession([error])
                with self.assertRaises(ArticleExtractionError) as raised:
                    fetch_article_html(
                        "https://example.com/story",
                        "example.com",
                        session=session,
                        resolver=resolver_for({"example.com": PUBLIC_A}),
                    )
                self.assertEqual(raised.exception.code, code)
                self.assertNotIn("SECRET", str(raised.exception))

    def test_total_deadline_is_checked_while_streaming(self):
        ticks = iter([0.0, 0.0, 0.0, 13.0])
        session = FakeSession([FakeResponse(chunks=[b"<html>", b"</html>"])])
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/story",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
                clock=lambda: next(ticks),
            )
        self.assertEqual(raised.exception.code, "fetch_timeout")

    def test_unsuccessful_http_status_is_safe(self):
        session = FakeSession([FakeResponse(503)])
        with self.assertRaises(ArticleExtractionError) as raised:
            fetch_article_html(
                "https://example.com/story",
                "example.com",
                session=session,
                resolver=resolver_for({"example.com": PUBLIC_A}),
            )
        self.assertEqual(raised.exception.code, "http_error")
        self.assertNotIn("503", str(raised.exception))


class MetadataParsingTests(unittest.TestCase):
    def test_parses_sno_metadata_and_visible_body(self):
        source = """
        <html>
          <head>
            <title>Site title</title>
            <script type="application/ld+json">
              {"@type":"NewsArticle","headline":"JSON title","author":{"name":"Fallback Writer"}}
            </script>
          </head>
          <body>
            <nav><p>Navigation noise</p></nav>
            <h1 class="sno-story-headline">Compost Pilot Expands</h1>
            <div class="sno-story-byline">
              By <a href="/staff_name/ada/">Ada Reporter, Staff Writer</a>
              and <a href="/author/grace/">Grace Hopper</a>
            </div>
            <div class="sno-story-date"><span class="time-wrapper">Updated April 2, 2026</span></div>
            <ul class="sno-story-cat-block-list">
              <li><a rel="category tag">Science</a></li>
              <li><a rel="category tag">2026</a></li>
            </ul>
            <div class="sno-story-body-content">
              <p>First paragraph &amp; evidence.</p>
              <p>Second paragraph.</p>
              <p>Second paragraph.</p>
              <script>secret()</script>
            </div>
          </body>
        </html>
        """
        article = parse_article_html(source, url="https://example.com/story")
        self.assertEqual(article["url"], "https://example.com/story")
        self.assertEqual(article["title"], "Compost Pilot Expands")
        self.assertEqual(article["authors"], ["Ada Reporter", "Grace Hopper"])
        self.assertEqual(article["tags"], ["Science"])
        self.assertEqual(article["datePublished"], "April 2, 2026")
        self.assertEqual(article["body"], "First paragraph & evidence.\n\nSecond paragraph.")
        self.assertNotIn("Navigation", article["body"])
        self.assertNotIn("secret", article["body"])

    def test_parses_wordpress_json_ld_and_meta_fallbacks(self):
        source = """
        <html>
          <head>
            <meta property="og:title" content="Open Graph title">
            <meta property="article:published_time" content="2026-05-06T13:00:00Z">
            <meta name="keywords" content="News, Campus; Students">
            <script type="application/ld+json">{not json}</script>
            <script type="application/ld+json">
              {"@graph":[
                {"@type":"WebSite","name":"Falcon"},
                {
                  "@type":["Thing","Article"],
                  "headline":"JSON-LD Headline",
                  "author":[{"name":"Jordan Journalist"}],
                  "keywords":["Campus","Local"],
                  "articleSection":"Features",
                  "datePublished":"2026-05-05"
                }
              ]}
            </script>
          </head>
          <body>
            <div class="entry-content"><p>WordPress body text.</p></div>
          </body>
        </html>
        """
        article = parse_article_html(source)
        self.assertEqual(article["title"], "JSON-LD Headline")
        self.assertEqual(article["authors"], ["Jordan Journalist"])
        self.assertEqual(article["datePublished"], "2026-05-06T13:00:00Z")
        self.assertEqual(article["tags"], ["News", "Campus", "Students", "Local", "Features"])
        self.assertEqual(article["body"], "WordPress body text.")

    def test_metadata_outputs_are_bounded(self):
        authors = "".join(
            f'<a href="/author/{index}">Reporter {index}</a>' for index in range(MAX_AUTHORS + 8)
        )
        tags = "".join(f'<a rel="category tag">Tag {index}</a>' for index in range(MAX_TAGS + 8))
        source = (
            f'<h1 class="entry-title">{"T" * (MAX_TITLE_CHARS + 100)}</h1>'
            f'<div class="byline">{authors}</div>'
            f'<div class="cat-links">{tags}</div>'
            f'<div class="entry-content"><p>{"B" * (MAX_BODY_CHARS + 1000)}</p></div>'
        )
        article = parse_article_html(source)
        self.assertEqual(len(article["title"]), MAX_TITLE_CHARS)
        self.assertEqual(len(article["authors"]), MAX_AUTHORS)
        self.assertEqual(len(article["tags"]), MAX_TAGS)
        self.assertEqual(len(article["body"]), MAX_BODY_CHARS)
        self.assertTrue(all(len(name) <= 100 for name in article["authors"]))
        self.assertTrue(all(len(tag) <= 80 for tag in article["tags"]))

    def test_sparse_or_malformed_html_returns_safe_empty_fields(self):
        article = parse_article_html("<html><script>broken")
        self.assertEqual(article["title"], "")
        self.assertEqual(article["authors"], [])
        self.assertEqual(article["tags"], [])
        self.assertEqual(article["datePublished"], "")
        self.assertEqual(article["body"], "")


class GeminiFallbackTests(unittest.TestCase):
    def test_modern_gemini_has_bounded_timeout_and_output(self):
        generate = Mock(return_value=types.SimpleNamespace(text="[]"))
        client = types.SimpleNamespace(models=types.SimpleNamespace(generate_content=generate))
        client_factory = Mock(return_value=client)
        fake_genai = types.ModuleType("google.genai")
        fake_genai.Client = client_factory
        fake_google = types.ModuleType("google")
        fake_google.__path__ = []
        fake_google.genai = fake_genai

        with patch.dict(sys.modules, {"google": fake_google, "google.genai": fake_genai}):
            output = extractor_module._modern_gemini_generate("prompt", "api-key", "model-name")

        self.assertEqual(output, "[]")
        client_factory.assert_called_once_with(
            api_key="api-key",
            http_options={"timeout": extractor_module.GEMINI_TIMEOUT_MILLISECONDS},
        )
        call = generate.call_args
        self.assertEqual(call.kwargs["config"]["max_output_tokens"], extractor_module.GEMINI_MAX_OUTPUT_TOKENS)
        self.assertEqual(call.kwargs["config"]["temperature"], 0)

    def test_legacy_gemini_has_bounded_timeout_and_output(self):
        generate = Mock(return_value=types.SimpleNamespace(text="[]"))
        model_instance = types.SimpleNamespace(generate_content=generate)
        fake_legacy = types.ModuleType("google.generativeai")
        fake_legacy.configure = Mock()
        fake_legacy.GenerativeModel = Mock(return_value=model_instance)
        fake_google = types.ModuleType("google")
        fake_google.__path__ = []
        fake_google.generativeai = fake_legacy

        with patch.dict(
            sys.modules,
            {"google": fake_google, "google.generativeai": fake_legacy},
        ):
            output = extractor_module._legacy_gemini_generate("prompt", "api-key", "model-name")

        self.assertEqual(output, "[]")
        fake_legacy.configure.assert_called_once_with(api_key="api-key")
        fake_legacy.GenerativeModel.assert_called_once_with("model-name")
        call = generate.call_args
        self.assertEqual(
            call.kwargs["generation_config"]["max_output_tokens"],
            extractor_module.GEMINI_MAX_OUTPUT_TOKENS,
        )
        self.assertEqual(
            call.kwargs["request_options"],
            {"timeout": extractor_module.GEMINI_TIMEOUT_SECONDS},
        )

    def test_missing_gemini_configuration_preserves_manual_workflow(self):
        people, metadata, warnings = extract_interviewees("A useful article body.", None)
        self.assertEqual(people, [])
        self.assertEqual(metadata["status"], "not_configured")
        self.assertFalse(metadata["attempted"])
        self.assertEqual(warnings[0]["code"], "manual_interviewee_review_required")

    def test_successful_model_output_is_sanitized_and_deduplicated(self):
        def generator(prompt, api_key, model):
            self.assertNotIn(api_key, prompt)
            self.assertIn("directly quoted", prompt)
            self.assertEqual(model, "test-model")
            return """```json
            ["Dr. Ada Lovelace", {"firstName":"Grace","lastName":"Hopper"}, "ada lovelace", "<script>alert</script>"]
            ```"""

        with patch.dict(os.environ, {"GEMINI_MODELS": "test-model"}):
            people, metadata, warnings = extract_interviewees(
                "Ada said hello. Grace replied.",
                "SECRET_API_KEY",
                generator=generator,
            )
        self.assertEqual([person["name"] for person in people], ["Ada Lovelace", "Grace Hopper"])
        self.assertEqual(people[0]["firstName"], "Ada")
        self.assertEqual(people[0]["lastName"], "Lovelace")
        self.assertEqual(metadata, {"attempted": True, "status": "complete", "model": "test-model"})
        self.assertEqual(warnings, [])

    def test_provider_failures_are_redacted_and_metadata_survives(self):
        def generator(_prompt, _api_key, _model):
            raise RuntimeError("SECRET_PROVIDER_TOKEN")

        with patch.dict(os.environ, {"GEMINI_MODELS": "one-model"}):
            people, metadata, warnings = extract_interviewees(
                "Article body.",
                "configured",
                generator=generator,
            )
        result_text = repr((people, metadata, warnings))
        self.assertEqual(people, [])
        self.assertEqual(metadata["status"], "unavailable")
        self.assertTrue(metadata["attempted"])
        self.assertNotIn("SECRET", result_text)
        self.assertEqual(warnings[0]["code"], "manual_interviewee_review_required")

    def test_ai_phase_uses_one_bounded_provider_attempt(self):
        attempts = []

        def generator(_prompt, _api_key, model):
            attempts.append(model)
            raise RuntimeError("provider unavailable")

        with patch.dict(os.environ, {"GEMINI_MODELS": "first-model,second-model"}):
            people, metadata, warnings = extract_interviewees(
                "Article body.",
                "configured",
                generator=generator,
            )
        self.assertEqual(attempts, ["first-model"])
        self.assertEqual(people, [])
        self.assertEqual(metadata["status"], "unavailable")
        self.assertEqual(warnings[0]["code"], "manual_interviewee_review_required")

    @patch("server.article_extractor.fetch_article_html")
    def test_extract_article_returns_metadata_when_gemini_is_absent(self, fetch_mock):
        fetch_mock.return_value = FetchedArticle(
            url="https://example.com/story",
            html=(
                '<h1 class="entry-title">A complete record</h1>'
                '<div class="entry-content"><p>Metadata extraction still succeeds.</p></div>'
            ),
            content_type="text/html",
            byte_length=120,
            redirects=(),
        )
        result = extract_article("https://example.com/story", "example.com", gemini_api_key=None)
        self.assertTrue(result["ok"])
        self.assertEqual(result["article_url"], "https://example.com/story")
        self.assertEqual(result["article"]["title"], "A complete record")
        self.assertEqual(result["people"], [])
        self.assertEqual(result["intervieweeExtraction"]["status"], "not_configured")
        self.assertEqual(result["warnings"][0]["code"], "manual_interviewee_review_required")
        self.assertEqual(result["fetch"]["redirectCount"], 0)


if __name__ == "__main__":
    unittest.main()

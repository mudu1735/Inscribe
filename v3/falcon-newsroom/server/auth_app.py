import os
import re
import secrets
from datetime import timedelta, timezone, datetime
from functools import wraps
from pathlib import Path
from time import monotonic
from urllib.parse import urlencode, urlparse

import requests
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request, session, url_for
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from werkzeug.security import check_password_hash, generate_password_hash


def _repo_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / ".env").exists() or (parent / ".env.example").exists() or (parent / ".git").exists():
            return parent
    return Path(__file__).resolve().parents[3]


load_dotenv(_repo_root() / ".env")

FLASK_ENV = os.getenv("FLASK_ENV", "").lower()
MONGO_URI = os.getenv("MONGO_URI", "")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set. Add it to your .env file.")

MONGO_DB = os.getenv("MONGO_DB", "mudu1735")
USER_COLLECTION = os.getenv("USER_COLLECTION", "loginInfov2")
INTERVIEW_COLLECTION = os.getenv("INTERVIEW_COLLECTION", "interviewRecords")
ARTICLE_COLLECTION = os.getenv("ARTICLE_COLLECTION", "articleRecords")
STORY_COLLECTION = os.getenv("STORY_COLLECTION", "storyRecords")
PITCH_COLLECTION = os.getenv("PITCH_COLLECTION", "pitchRecords")
ACTIVITY_COLLECTION = os.getenv("ACTIVITY_COLLECTION", "activityRecords")
FEEDBACK_COLLECTION = os.getenv("FEEDBACK_COLLECTION", "feedbackRecords")
AUTH_RATE_LIMIT_MAX = int(os.getenv("AUTH_RATE_LIMIT_MAX", "8"))
AUTH_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("AUTH_RATE_LIMIT_WINDOW_SECONDS", "900"))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_AUTH_REDIRECT_URI = os.getenv("GOOGLE_AUTH_REDIRECT_URI", "")
GOOGLE_ALLOWED_DOMAINS = {
    domain.strip().lower().lstrip("@")
    for domain in os.getenv("GOOGLE_ALLOWED_DOMAINS", "").split(",")
    if domain.strip()
}
GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo"

ROLE_VIEWER = "viewer"
ROLE_WRITER = "writer"
ROLE_EDITOR = "editor"
ROLE_ADMIN = "admin"
VALID_ROLES = {ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER, ROLE_VIEWER}
ROLE_RANK = {
    ROLE_VIEWER: 1,
    ROLE_WRITER: 2,
    ROLE_EDITOR: 3,
    ROLE_ADMIN: 4,
}
FRONTEND_ROLE_LANDING = {
    ROLE_VIEWER: "/interviewees",
    ROLE_WRITER: "/stories",
    ROLE_EDITOR: "/dashboard",
    ROLE_ADMIN: "/dashboard",
}
IMPORTANT_ACTIVITY_EVENTS = {"status_change"}
BACKEND_CAPABILITIES = {
    "admin-users",
    "rbac-v4",
    "stories",
    "pitches",
    "shared-workflow-activity",
    "shared-feedback",
}

TRUSTED_CSRF_ORIGINS = {
    origin.rstrip("/")
    for origin in os.getenv("TRUSTED_CSRF_ORIGINS", os.getenv("TRUSTED_ORIGINS", "")).split(",")
    if origin.strip()
}
if FLASK_ENV != "production":
    TRUSTED_CSRF_ORIGINS.update({
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://localhost:5174",
    })

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-me")
if FLASK_ENV == "production" and app.secret_key == "dev-secret-change-me":
    raise RuntimeError("FLASK_SECRET_KEY must be set to a strong value in production.")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = FLASK_ENV == "production"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=30)

mongo_client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
db = mongo_client[MONGO_DB]
users_col = db[USER_COLLECTION]
interviews_col = db[INTERVIEW_COLLECTION]
articles_col = db[ARTICLE_COLLECTION]
stories_col = db[STORY_COLLECTION]
pitches_col = db[PITCH_COLLECTION]
activity_col = db[ACTIVITY_COLLECTION]
feedback_col = db[FEEDBACK_COLLECTION]
AUTH_FAILURES: dict[str, list[float]] = {}

try:
    users_col.create_index([("email", ASCENDING)], unique=True)
except Exception:
    pass

try:
    users_col.create_index([("googleSub", ASCENDING)], unique=True, sparse=True)
except Exception:
    pass

try:
    stories_col.create_index([("writerEmail", ASCENDING), ("status", ASCENDING)])
except Exception:
    pass

try:
    pitches_col.create_index([("ownerEmail", ASCENDING), ("status", ASCENDING)])
except Exception:
    pass

try:
    activity_col.create_index([("entityType", ASCENDING), ("entityId", ASCENDING), ("createdAt", -1)])
except Exception:
    pass

try:
    feedback_col.create_index([("entityType", ASCENDING), ("entityId", ASCENDING), ("createdAt", -1)])
except Exception:
    pass


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def _month_day_year(value) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        dt = value.astimezone(timezone.utc)
    else:
        raw = str(value or "").strip()
        if not raw:
            return ""
        normalized = raw.replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(normalized)
        except Exception:
            for fmt in ("%B %d, %Y, %I:%M %p", "%B %d, %Y", "%b %d, %Y", "%Y-%m-%d"):
                try:
                    dt = datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc)
                    break
                except Exception:
                    dt = None
            if dt is None:
                parsed = raw.split("T", 1)[0]
                if re.match(r"^\d{4}-\d{2}-\d{2}$", parsed):
                    try:
                        dt = datetime.strptime(parsed, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    except Exception:
                        return raw
                else:
                    return raw
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
    return dt.strftime("%B %d, %Y").replace(" 0", " ")


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def normalize_role(role_value) -> str:
    role = str(role_value or "").strip().lower()
    return role if role in VALID_ROLES else ROLE_VIEWER


def is_valid_email(email: str) -> bool:
    candidate = normalize_email(email)
    if not candidate or len(candidate) > 254:
        return False
    return bool(re.match(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$", candidate))


def _sanitize_next_url(next_url: str) -> str:
    candidate = (next_url or "").strip()
    if not candidate:
        return ""
    parsed = urlparse(candidate)
    if parsed.scheme or parsed.netloc or not candidate.startswith("/") or candidate.startswith("//"):
        return ""
    if candidate in {"/login", "/signup"}:
        return ""
    if candidate == "/":
        return "/dashboard"
    if candidate == "/records":
        return "/interviewees"
    return candidate


def _auth_redirect_for_role(role_value: str) -> str:
    next_url = _sanitize_next_url(request.args.get("next") or "")
    return next_url or FRONTEND_ROLE_LANDING.get(normalize_role(role_value), "/interviewees")


def _request_payload() -> dict:
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not payload:
        payload = request.form.to_dict(flat=True)
    return payload if isinstance(payload, dict) else {}


def _payload_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _origin_from_url(value: str) -> str:
    raw = (value or "").strip()
    if not raw:
        return ""
    parsed = urlparse(raw)
    if not parsed.scheme or not parsed.netloc:
        return ""
    return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}".rstrip("/")


def _trusted_request_origins() -> set[str]:
    origins = {origin.lower().rstrip("/") for origin in TRUSTED_CSRF_ORIGINS if origin}
    current = _origin_from_url(request.host_url)
    if current:
        origins.add(current)
    return origins


def _is_same_origin_request() -> bool:
    origin = (request.headers.get("Origin") or "").strip()
    referer = (request.headers.get("Referer") or "").strip()
    candidate = origin or referer
    if not candidate:
        return False
    return _origin_from_url(candidate) in _trusted_request_origins()


def _ensure_csrf_token() -> str:
    token = session.get("csrf_token")
    if not isinstance(token, str) or len(token) < 32:
        token = secrets.token_urlsafe(32)
        session["csrf_token"] = token
    return token


def _has_valid_csrf_token() -> bool:
    expected = session.get("csrf_token")
    provided = request.headers.get("X-CSRF-Token") or request.headers.get("X-CSRFToken") or ""
    if not isinstance(expected, str) or not provided:
        return False
    return secrets.compare_digest(expected, str(provided))


@app.before_request
def csrf_guard_for_authenticated_users():
    if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
        return None
    if request.path in {"/api/auth/login", "/api/auth/register"}:
        return None
    if session.get("user_id") and not (_has_valid_csrf_token() or _is_same_origin_request()):
        return jsonify({"ok": False, "error": "CSRF validation failed."}), 403
    return None


def _auth_rate_key(email: str) -> str:
    remote = (request.headers.get("X-Forwarded-For", "").split(",")[0] or request.remote_addr or "unknown").strip()
    return f"{remote}:{normalize_email(email)}"


def _active_auth_failures(key: str, now: float) -> list[float]:
    attempts = [ts for ts in AUTH_FAILURES.get(key, []) if now - ts < AUTH_RATE_LIMIT_WINDOW_SECONDS]
    if attempts:
        AUTH_FAILURES[key] = attempts
    else:
        AUTH_FAILURES.pop(key, None)
    return attempts


def _is_auth_rate_limited(email: str) -> bool:
    if AUTH_RATE_LIMIT_MAX <= 0:
        return False
    return len(_active_auth_failures(_auth_rate_key(email), monotonic())) >= AUTH_RATE_LIMIT_MAX


def _record_auth_failure(email: str):
    key = _auth_rate_key(email)
    now = monotonic()
    attempts = _active_auth_failures(key, now)
    attempts.append(now)
    AUTH_FAILURES[key] = attempts


def _clear_auth_failures(email: str):
    AUTH_FAILURES.pop(_auth_rate_key(email), None)


def find_user_by_email(email: str):
    return users_col.find_one({"email": normalize_email(email)})


def find_user_by_google_sub(google_sub: str):
    value = str(google_sub or "").strip()
    if not value:
        return None
    return users_col.find_one({"googleSub": value})


def _serialize_user(doc: dict) -> dict:
    first_name = str(doc.get("firstName", "") or "").strip()
    last_name = str(doc.get("lastName", "") or "").strip()
    email = doc.get("email", "")
    name = str(doc.get("name") or f"{first_name} {last_name}".strip() or email).strip()
    return {
        "id": str(doc.get("_id")),
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "name": name,
        "role": normalize_role(doc.get("role")),
        "lastSeen": _month_day_year(doc.get("lastLoginAt") or doc.get("updatedAt") or doc.get("createdAt")),
    }


def _current_user_doc():
    user_id = session.get("user_id")
    if not user_id:
        return None
    try:
        oid = ObjectId(user_id)
    except Exception:
        session.clear()
        return None
    doc = users_col.find_one({"_id": oid})
    if not doc:
        session.clear()
    return doc


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not _current_user_doc():
            return jsonify({"ok": False, "error": "Unauthorized"}), 401
        return fn(*args, **kwargs)

    return wrapper


def require_role_at_least(role_name: str):
    target = normalize_role(role_name)

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_doc = _current_user_doc()
            if not user_doc:
                return jsonify({"ok": False, "error": "Unauthorized"}), 401
            if ROLE_RANK.get(normalize_role(user_doc.get("role")), 1) < ROLE_RANK.get(target, 1):
                return jsonify({"ok": False, "error": "Editor access required."}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_roles(*role_names: str):
    allowed = {normalize_role(role_name) for role_name in role_names}

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_doc = _current_user_doc()
            if not user_doc:
                return jsonify({"ok": False, "error": "Unauthorized"}), 401
            if normalize_role(user_doc.get("role")) not in allowed:
                return jsonify({"ok": False, "error": "Access denied."}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def _current_user_role(user_doc: dict) -> str:
    return normalize_role(user_doc.get("role"))


def _user_display_name(user_doc: dict) -> str:
    first_name = str(user_doc.get("firstName") or "").strip()
    last_name = str(user_doc.get("lastName") or "").strip()
    return str(user_doc.get("name") or f"{first_name} {last_name}".strip() or user_doc.get("email") or "Newsroom user").strip()


def _owner_match_values(user_doc: dict) -> list:
    values = [str(user_doc.get("_id")), normalize_email(user_doc.get("email") or ""), _user_display_name(user_doc)]
    try:
        values.append(user_doc["_id"])
    except Exception:
        pass
    return [value for value in values if value]


def _owned_story_query(user_doc: dict) -> dict:
    values = _owner_match_values(user_doc)
    return {"$or": [
        {"writerUserId": {"$in": values}},
        {"writerId": {"$in": values}},
        {"ownerUserId": {"$in": values}},
        {"ownerId": {"$in": values}},
        {"writerEmail": {"$in": values}},
        {"ownerEmail": {"$in": values}},
        {"writer": {"$in": values}},
        {"owner": {"$in": values}},
        {"authors": {"$in": values}},
    ]}


def _owned_pitch_query(user_doc: dict) -> dict:
    values = _owner_match_values(user_doc)
    return {"$or": [
        {"ownerUserId": {"$in": values}},
        {"ownerId": {"$in": values}},
        {"writerUserId": {"$in": values}},
        {"writerId": {"$in": values}},
        {"ownerEmail": {"$in": values}},
        {"writerEmail": {"$in": values}},
        {"owner": {"$in": values}},
        {"writer": {"$in": values}},
    ]}


def _story_query_for_user(user_doc: dict):
    role = _current_user_role(user_doc)
    if role == ROLE_VIEWER:
        return None
    if role == ROLE_WRITER:
        return _owned_story_query(user_doc)
    return {}


def _pitch_query_for_user(user_doc: dict):
    role = _current_user_role(user_doc)
    if role == ROLE_VIEWER:
        return None
    if role == ROLE_WRITER:
        return _owned_pitch_query(user_doc)
    return {}


def _find_owned_story_or_404(story_id: str, user_doc: dict):
    query = _story_query_for_user(user_doc)
    if query is None:
        return None
    clauses = [{"_id": _object_id_or_none(story_id)}, {"id": story_id}, {"storyId": story_id}]
    clauses = [clause for clause in clauses if list(clause.values())[0]]
    final_query = {"$and": [query, {"$or": clauses}]} if query else {"$or": clauses}
    return stories_col.find_one(final_query)


def _find_owned_pitch_or_404(pitch_id: str, user_doc: dict):
    query = _pitch_query_for_user(user_doc)
    if query is None:
        return None
    clauses = [{"_id": _object_id_or_none(pitch_id)}, {"id": pitch_id}, {"pitchId": pitch_id}]
    clauses = [clause for clause in clauses if list(clause.values())[0]]
    final_query = {"$and": [query, {"$or": clauses}]} if query else {"$or": clauses}
    return pitches_col.find_one(final_query)


def _object_id_or_none(value: str):
    try:
        return ObjectId(value)
    except Exception:
        return None


def _login_user_doc(doc: dict, remember: bool = False):
    session.clear()
    session.permanent = remember
    session["user_id"] = str(doc["_id"])
    session["csrf_token"] = secrets.token_urlsafe(32)


def _coerce_list_field(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [part.strip() for part in value.replace("\n", ",").split(",") if part.strip()]
    return [str(value).strip()] if str(value).strip() else []


def _article_url_lookup_candidates(url: str) -> set[str]:
    raw = str(url or "").strip()
    if not raw:
        return set()
    candidates = {raw, raw.rstrip("/")}
    try:
        parsed = urlparse(raw)
        trimmed_path = (parsed.path or "").rstrip("/")
        candidates.add(parsed._replace(path=trimmed_path).geturl())
        if trimmed_path:
            candidates.add(parsed._replace(path=f"{trimmed_path}/").geturl())
    except Exception:
        pass
    return {candidate for candidate in candidates if candidate}


def _article_join_url_key(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    try:
        parsed = urlparse(raw)
        scheme = (parsed.scheme or "https").lower()
        host = (parsed.netloc or "").lower()
        path = (parsed.path or "").rstrip("/")
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{scheme}://{host}{path}{query}"
    except Exception:
        return raw.rstrip("/")


def _published_date_for_api(value) -> str:
    return _month_day_year(value)


def _interview_to_api(doc: dict) -> dict:
    first_name = str(doc.get("firstName") or doc.get("first_name") or "").strip()
    last_name = str(doc.get("lastName") or doc.get("last_name") or "").strip()
    name = str(doc.get("name") or doc.get("fullName") or f"{first_name} {last_name}").strip() or "Unknown"
    return {
        "id": str(doc.get("_id")),
        "firstName": first_name,
        "lastName": last_name,
        "name": name,
        "grade": doc.get("grade", "") or "",
        "house": doc.get("house", "") or "",
        "url": doc.get("url") or doc.get("articleUrl") or doc.get("article_url") or "",
        "dateAdded": _month_day_year(doc.get("dateAdded") or doc.get("date") or doc.get("dateInterviewed")),
        "time": _month_day_year(doc.get("time") or doc.get("dateAdded") or doc.get("date") or doc.get("dateInterviewed")),
        "addedBy": doc.get("addedBy") or doc.get("added_by") or doc.get("createdBy") or "",
        "quote": doc.get("quote") or doc.get("evidence") or doc.get("quoteEvidence") or "",
    }


def _article_to_api(doc: dict, people_by_url: dict[str, list[dict]] | None = None) -> dict:
    url = str(doc.get("url") or doc.get("articleUrl") or doc.get("article_url") or "").strip()
    authors = _coerce_list_field(doc.get("authors") or doc.get("author"))
    tags = _coerce_list_field(doc.get("tags") or doc.get("categories"))
    section = str(doc.get("section") or doc.get("category") or (tags[0] if tags else "") or "").strip()
    return {
        "id": str(doc.get("_id")),
        "title": doc.get("title") or doc.get("articleTitle") or "",
        "url": url,
        "outlet": doc.get("outlet", "") or "",
        "authors": authors,
        "author": ", ".join(authors),
        "section": section,
        "category": doc.get("category", "") or "",
        "tags": tags,
        "publishedAt": _published_date_for_api(doc.get("datePublished") or doc.get("publishedAt") or doc.get("date") or ""),
        "interviewees": (people_by_url or {}).get(_article_join_url_key(url), []),
    }


def _doc_public_id(doc: dict, fallback_field: str = "id") -> str:
    return str(doc.get(fallback_field) or doc.get("id") or doc.get("_id") or "")


def _date_for_api(value) -> str:
    return _month_day_year(value)


def _int_field(doc: dict, field: str, default: int = 0) -> int:
    try:
        return int(doc.get(field, default) or default)
    except Exception:
        return default


def _bool_field(doc: dict, field: str, default: bool = False) -> bool:
    value = doc.get(field, default)
    if isinstance(value, bool):
        return value
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _story_to_api(doc: dict) -> dict:
    writer = str(doc.get("writer") or doc.get("owner") or doc.get("author") or "").strip()
    authors = _coerce_list_field(doc.get("authors"))
    if not writer and authors:
        writer = authors[0]
    return {
        "id": _doc_public_id(doc, "storyId"),
        "title": doc.get("title") or doc.get("storyTitle") or "Untitled story",
        "section": doc.get("section", "") or "",
        "writer": writer or doc.get("writerEmail", "") or "Unassigned",
        "writerEmail": doc.get("writerEmail") or doc.get("ownerEmail") or "",
        "editor": doc.get("editor", "") or "",
        "status": doc.get("status") or "Assigned",
        "priority": doc.get("priority") or "Normal",
        "deadline": doc.get("deadline") or doc.get("dueDate") or "",
        "dueSoon": _bool_field(doc, "dueSoon"),
        "submittedAt": _date_for_api(doc.get("submittedAt") or doc.get("createdAt")),
        "lastEdited": _date_for_api(doc.get("lastEdited") or doc.get("updatedAt")),
        "googleDocUrl": doc.get("googleDocUrl") or doc.get("docUrl") or "",
        "revisionCount": _int_field(doc, "revisionCount"),
        "wordCount": _int_field(doc, "wordCount"),
        "sourceCount": _int_field(doc, "sourceCount"),
        "unread": _bool_field(doc, "unread"),
        "summary": doc.get("summary", "") or "",
        "nextStep": doc.get("nextStep", "") or "",
        "editorNote": doc.get("editorNote", "") or "",
        "feedback": doc.get("feedback") if isinstance(doc.get("feedback"), list) else [],
        "comments": doc.get("comments") if isinstance(doc.get("comments"), list) else [],
        "sources": doc.get("sources") if isinstance(doc.get("sources"), list) else [],
    }


def _pitch_to_api(doc: dict) -> dict:
    return {
        "id": _doc_public_id(doc, "pitchId"),
        "title": doc.get("title") or "Untitled pitch",
        "angle": doc.get("angle") or doc.get("summary") or "",
        "status": doc.get("status") or "New",
        "section": doc.get("section", "") or "",
        "owner": doc.get("owner") or doc.get("writer") or doc.get("ownerEmail") or "Unassigned",
        "ownerEmail": doc.get("ownerEmail") or doc.get("writerEmail") or "",
        "submittedAt": _date_for_api(doc.get("submittedAt") or doc.get("createdAt")),
        "notes": doc.get("notes", "") or "",
        "editorFeedback": doc.get("editorFeedback", "") or "",
        "feedback": doc.get("feedback") if isinstance(doc.get("feedback"), list) else [],
        "comments": doc.get("comments") if isinstance(doc.get("comments"), list) else [],
        "updatedAt": _date_for_api(doc.get("updatedAt") or doc.get("submittedAt") or doc.get("createdAt")),
    }


def _activity_to_api(doc: dict) -> dict:
    text = doc.get("text") or ""
    from_status = doc.get("fromStatus") or ""
    to_status = doc.get("toStatus") or ""
    if not text and to_status:
        text = f"Status changed from {from_status or 'none'} to {to_status}."
    return {
        "id": str(doc.get("_id")),
        "entityType": doc.get("entityType") or "",
        "entityId": doc.get("entityId") or "",
        "eventType": doc.get("eventType") or "",
        "text": text,
        "time": _date_for_api(doc.get("createdAt")),
        "actorName": doc.get("actorName") or "",
        "fromStatus": from_status,
        "toStatus": to_status,
    }


def _feedback_to_api(doc: dict) -> dict:
    return {
        "id": str(doc.get("_id")),
        "entityType": doc.get("entityType") or "",
        "entityId": doc.get("entityId") or "",
        "author": doc.get("authorName") or doc.get("actorName") or "Editor",
        "authorEmail": doc.get("authorEmail") or "",
        "text": doc.get("text") or "",
        "time": _date_for_api(doc.get("createdAt")),
        "updatedAt": _date_for_api(doc.get("updatedAt") or doc.get("createdAt")),
    }


def _can_access_entity(entity_type: str, entity_id: str, user_doc: dict):
    if entity_type == "story":
        return _find_owned_story_or_404(entity_id, user_doc)
    if entity_type == "pitch":
        return _find_owned_pitch_or_404(entity_id, user_doc)
    return None


def _require_feedback_entity(entity_type: str, entity_id: str, user_doc: dict):
    entity_type = str(entity_type or "").strip().lower()
    entity_id = str(entity_id or "").strip()
    if entity_type not in {"story", "pitch"} or not entity_id:
        return None, "Feedback requires story or pitch entity information.", 400
    entity_doc = _can_access_entity(entity_type, entity_id, user_doc)
    if not entity_doc:
        return None, "Feedback is not available for this item.", 403
    return entity_doc, "", 200


def _record_status_activity(entity_type: str, entity_id: str, from_status: str, to_status: str, actor_doc: dict):
    if from_status == to_status:
        return
    activity_col.insert_one({
        "entityType": entity_type,
        "entityId": str(entity_id),
        "eventType": "status_change",
        "fromStatus": from_status or "",
        "toStatus": to_status or "",
        "text": f"Status changed from {from_status or 'none'} to {to_status}.",
        "actorId": str(actor_doc.get("_id")),
        "actorEmail": actor_doc.get("email", ""),
        "actorName": _user_display_name(actor_doc),
        "createdAt": datetime.now(timezone.utc),
    })


def _create_story_from_pitch(pitch_doc: dict, actor_doc: dict):
    pitch_id = _doc_public_id(pitch_doc, "pitchId")
    existing = stories_col.find_one({"sourcePitchId": pitch_id})
    if existing:
        return existing

    now_iso = _now_iso()
    doc = {
        "title": pitch_doc.get("title") or "Untitled story",
        "section": pitch_doc.get("section", "") or "",
        "writer": pitch_doc.get("owner") or pitch_doc.get("writer") or "Unassigned",
        "writerEmail": pitch_doc.get("ownerEmail") or pitch_doc.get("writerEmail") or "",
        "writerUserId": pitch_doc.get("ownerUserId") or pitch_doc.get("writerUserId") or "",
        "editor": _user_display_name(actor_doc),
        "status": "Assigned",
        "priority": "Normal",
        "deadline": "",
        "submittedAt": pitch_doc.get("submittedAt") or pitch_doc.get("createdAt") or now_iso,
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "summary": pitch_doc.get("angle") or pitch_doc.get("summary") or "",
        "nextStep": "Begin reporting from the approved pitch.",
        "editorNote": pitch_doc.get("editorFeedback", "") or "",
        "googleDocUrl": "",
        "revisionCount": 0,
        "wordCount": 0,
        "sourceCount": 0,
        "sourcePitchId": pitch_id,
    }
    res = stories_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    _record_status_activity("story", str(res.inserted_id), "", "Assigned", actor_doc)
    return doc


def create_user(email: str, password: str, first_name: str, last_name: str):
    now_iso = _now_iso()
    doc = {
        "email": normalize_email(email),
        "passwordHash": generate_password_hash(password),
        "firstName": (first_name or "").strip(),
        "lastName": (last_name or "").strip(),
        "role": ROLE_VIEWER,
        "createdAt": now_iso,
        "lastLoginAt": now_iso,
        "authProviders": {"password": True},
    }
    res = users_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc


def _split_google_name(profile: dict) -> tuple[str, str]:
    first_name = str(profile.get("given_name") or "").strip()
    last_name = str(profile.get("family_name") or "").strip()
    if first_name or last_name:
        return first_name, last_name
    name = str(profile.get("name") or "").strip()
    if not name:
        return "", ""
    parts = name.split()
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def _google_redirect_uri() -> str:
    return GOOGLE_AUTH_REDIRECT_URI or url_for("api_google_callback", _external=True)


def _is_google_configured() -> bool:
    return bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)


def _google_email_domain_allowed(email: str) -> bool:
    if not GOOGLE_ALLOWED_DOMAINS:
        return True
    domain = normalize_email(email).rsplit("@", 1)[-1]
    return domain in GOOGLE_ALLOWED_DOMAINS


def _google_error_redirect(message: str):
    return redirect(f"/login?{urlencode({'auth': 'google', 'error': message})}")


def upsert_google_user(profile: dict):
    email = normalize_email(profile.get("email") or "")
    google_sub = str(profile.get("sub") or "").strip()
    if not email or not google_sub:
        raise ValueError("Google profile did not include a verified identity.")

    now_iso = _now_iso()
    first_name, last_name = _split_google_name(profile)
    update = {
        "email": email,
        "googleSub": google_sub,
        "googleEmailVerified": True,
        "googlePicture": str(profile.get("picture") or "").strip(),
        "lastLoginAt": now_iso,
    }
    if first_name:
        update["firstName"] = first_name
    if last_name:
        update["lastName"] = last_name

    user_doc = find_user_by_google_sub(google_sub) or find_user_by_email(email)
    if user_doc:
        users_col.update_one({"_id": user_doc["_id"]}, {"$set": {**update, "authProviders.google": True}})
        user_doc.update(update)
        user_doc["authProviders"] = {**(user_doc.get("authProviders") or {}), "google": True}
        return user_doc

    doc = {
        **update,
        "firstName": first_name,
        "lastName": last_name,
        "role": ROLE_VIEWER,
        "createdAt": now_iso,
        "authProviders": {"google": True},
    }
    res = users_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc


@app.get("/api/health")
def api_health():
    return jsonify({
        "ok": True,
        "service": "falcon-newsroom-v3-auth",
        "version": "v3-rbac-activity-2026-06-02",
        "capabilities": sorted(BACKEND_CAPABILITIES),
        "db": MONGO_DB,
        "users": USER_COLLECTION,
    })


@app.post("/api/auth/register")
def api_register():
    payload = _request_payload()
    email = (payload.get("email") or "").strip()
    first_name = (payload.get("firstName") or "").strip()
    last_name = (payload.get("lastName") or "").strip()
    password = payload.get("password") or ""
    confirm = payload.get("confirmPassword") or ""

    if not first_name or not last_name:
        return jsonify({"ok": False, "error": "First and last name are required."}), 400
    if len(first_name) > 80 or len(last_name) > 80:
        return jsonify({"ok": False, "error": "Names must be 80 characters or fewer."}), 400
    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required."}), 400
    if not is_valid_email(email):
        return jsonify({"ok": False, "error": "Please enter a valid email address."}), 400
    if confirm and confirm != password:
        return jsonify({"ok": False, "error": "Passwords do not match."}), 400
    if len(password) < 8:
        return jsonify({"ok": False, "error": "Password must be at least 8 characters."}), 400
    if len(password) > 256:
        return jsonify({"ok": False, "error": "Password must be 256 characters or fewer."}), 400
    if _is_auth_rate_limited(email):
        return jsonify({"ok": False, "error": "Too many failed attempts. Please wait and try again."}), 429
    if find_user_by_email(email):
        return jsonify({"ok": False, "error": "Email is already registered."}), 409

    try:
        user_doc = create_user(email, password, first_name, last_name)
    except DuplicateKeyError:
        return jsonify({"ok": False, "error": "Email is already registered."}), 409

    _login_user_doc(user_doc, remember=False)
    _clear_auth_failures(email)
    return jsonify({"ok": True, "redirect": _auth_redirect_for_role(user_doc.get("role"))})


@app.post("/api/auth/login")
def api_login():
    payload = _request_payload()
    email = (payload.get("email") or "").strip()
    password = payload.get("password") or ""
    remember = _payload_bool(payload.get("remember"))

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required."}), 400
    if not is_valid_email(email):
        return jsonify({"ok": False, "error": "Please enter a valid email address."}), 400
    if len(password) > 256:
        return jsonify({"ok": False, "error": "Invalid email or password."}), 401
    if _is_auth_rate_limited(email):
        return jsonify({"ok": False, "error": "Too many failed attempts. Please wait and try again."}), 429

    user_doc = find_user_by_email(email)
    password_hash = user_doc.get("passwordHash", "") if user_doc else ""
    if not user_doc or not password_hash or not check_password_hash(password_hash, password):
        _record_auth_failure(email)
        return jsonify({"ok": False, "error": "Invalid email or password."}), 401

    _login_user_doc(user_doc, remember=remember)
    _clear_auth_failures(email)
    users_col.update_one({"_id": user_doc["_id"]}, {"$set": {"lastLoginAt": _now_iso(), "authProviders.password": True}})
    return jsonify({"ok": True, "redirect": _auth_redirect_for_role(user_doc.get("role"))})


@app.get("/api/auth/session")
def api_session():
    user_doc = _current_user_doc()
    if not user_doc:
        return jsonify({"ok": True, "authenticated": False})
    return jsonify({
        "ok": True,
        "authenticated": True,
        "user": _serialize_user(user_doc),
        "csrfToken": _ensure_csrf_token(),
    })


@app.post("/api/auth/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/auth/google/start")
def api_google_start():
    if not _is_google_configured():
        return jsonify({"ok": False, "error": "Google sign-in is not configured."}), 503

    state = secrets.token_urlsafe(32)
    session["google_oauth_state"] = state
    session["google_oauth_next"] = _sanitize_next_url(request.args.get("next") or "")
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": _google_redirect_uri(),
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    return jsonify({"ok": True, "authUrl": f"{GOOGLE_AUTH_ENDPOINT}?{urlencode(params)}"})


@app.get("/api/auth/google/callback")
def api_google_callback():
    if request.args.get("error"):
        return _google_error_redirect("Google sign-in was cancelled.")

    state = (request.args.get("state") or "").strip()
    expected_state = session.pop("google_oauth_state", "")
    next_url = session.pop("google_oauth_next", "")
    if not state or not expected_state or not secrets.compare_digest(state, expected_state):
        return _google_error_redirect("Google sign-in could not be verified.")

    code = (request.args.get("code") or "").strip()
    if not code:
        return _google_error_redirect("Google did not return an authorization code.")
    if not _is_google_configured():
        return _google_error_redirect("Google sign-in is not configured.")

    try:
        token_response = requests.post(
            GOOGLE_TOKEN_ENDPOINT,
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": _google_redirect_uri(),
            },
            timeout=10,
        )
        token_response.raise_for_status()
        token_payload = token_response.json()
        access_token = token_payload.get("access_token")
        if not access_token:
            return _google_error_redirect("Google did not return an access token.")

        profile_response = requests.get(
            GOOGLE_USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        profile_response.raise_for_status()
        profile = profile_response.json()
    except Exception:
        return _google_error_redirect("Google sign-in failed. Please try again.")

    email = normalize_email(profile.get("email") or "")
    if not email or not profile.get("email_verified"):
        return _google_error_redirect("Google account email is not verified.")
    if not _google_email_domain_allowed(email):
        return _google_error_redirect("This Google account is not allowed for Falcon Newsroom.")

    try:
        user_doc = upsert_google_user(profile)
    except DuplicateKeyError:
        existing = find_user_by_email(email)
        if not existing:
            return _google_error_redirect("Could not link this Google account.")
        user_doc = existing
    except Exception:
        return _google_error_redirect("Could not create a Falcon account from Google.")

    _login_user_doc(user_doc, remember=False)
    _clear_auth_failures(email)
    return redirect(next_url or FRONTEND_ROLE_LANDING.get(normalize_role(user_doc.get("role")), "/interviewees"))


@app.get("/api/admin/users")
@require_roles(ROLE_ADMIN)
def api_admin_users():
    docs = list(users_col.find({}).sort([("role", ASCENDING), ("email", ASCENDING)]))
    return jsonify({"ok": True, "users": [_serialize_user(doc) for doc in docs], "roles": sorted(VALID_ROLES)})


@app.patch("/api/admin/users/<user_id>/role")
@require_roles(ROLE_ADMIN)
def api_admin_update_user_role(user_id: str):
    current_user = _current_user_doc()
    oid = _object_id_or_none(user_id)
    if not oid:
        return jsonify({"ok": False, "error": "Invalid user id."}), 400

    payload = _request_payload()
    next_role = normalize_role(payload.get("role"))
    if str(payload.get("role") or "").strip().lower() not in VALID_ROLES:
        return jsonify({"ok": False, "error": "Role must be admin, editor, writer, or viewer."}), 400
    if str(current_user.get("_id")) == str(oid):
        return jsonify({"ok": False, "error": "You cannot change your own role while signed in."}), 400

    target = users_col.find_one({"_id": oid})
    if not target:
        return jsonify({"ok": False, "error": "User not found."}), 404
    if normalize_role(target.get("role")) == ROLE_ADMIN and next_role != ROLE_ADMIN:
        admin_count = users_col.count_documents({"role": ROLE_ADMIN})
        if admin_count <= 1:
            return jsonify({"ok": False, "error": "At least one admin must remain."}), 400

    users_col.update_one({"_id": oid}, {"$set": {"role": next_role, "updatedAt": _now_iso()}})
    updated = users_col.find_one({"_id": oid}) or {}
    return jsonify({"ok": True, "user": _serialize_user(updated)})


@app.get("/api/stories")
@require_auth
def api_stories():
    user_doc = _current_user_doc()
    query = _story_query_for_user(user_doc)
    if query is None:
        return jsonify({"ok": False, "error": "Stories are not available to viewers."}), 403
    docs = list(stories_col.find(query).sort([("updatedAt", -1), ("_id", -1)]))
    return jsonify({"ok": True, "stories": [_story_to_api(doc) for doc in docs]})


@app.patch("/api/stories/<story_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR)
def api_update_story(story_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404

    payload = _request_payload()
    update = {"updatedAt": _now_iso()}
    if "status" in payload:
        next_status = str(payload.get("status") or "").strip()
        if not next_status:
            return jsonify({"ok": False, "error": "Status is required."}), 400
        update["status"] = next_status
    if "googleDocUrl" in payload:
        update["googleDocUrl"] = str(payload.get("googleDocUrl") or "").strip()
    if len(update) == 1:
        return jsonify({"ok": False, "error": "No editable fields provided."}), 400

    clauses = [{"_id": story["_id"]}]
    stories_col.update_one({"$or": clauses}, {"$set": update})
    if "status" in update and update["status"] != story.get("status"):
        _record_status_activity("story", _doc_public_id(story, "storyId"), story.get("status", ""), update["status"], user_doc)
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "story": _story_to_api(updated)})


@app.get("/api/pitches")
@require_auth
def api_pitches():
    user_doc = _current_user_doc()
    query = _pitch_query_for_user(user_doc)
    if query is None:
        return jsonify({"ok": False, "error": "Pitch board is not available to viewers."}), 403
    docs = list(pitches_col.find(query).sort([("updatedAt", -1), ("_id", -1)]))
    return jsonify({"ok": True, "pitches": [_pitch_to_api(doc) for doc in docs]})


@app.post("/api/pitches")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_create_pitch():
    user_doc = _current_user_doc()
    payload = _request_payload()
    title = str(payload.get("title") or "").strip()
    if not title:
        return jsonify({"ok": False, "error": "Pitch title is required."}), 400
    now_iso = _now_iso()
    doc = {
        "title": title,
        "angle": str(payload.get("angle") or "").strip(),
        "status": "New",
        "section": str(payload.get("section") or "").strip() or "News",
        "owner": _user_display_name(user_doc),
        "ownerEmail": normalize_email(user_doc.get("email") or ""),
        "ownerUserId": str(user_doc.get("_id")),
        "submittedAt": now_iso,
        "notes": str(payload.get("notes") or "").strip(),
        "feedback": [],
        "comments": [],
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }
    res = pitches_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return jsonify({"ok": True, "pitch": _pitch_to_api(doc)})


@app.patch("/api/pitches/<pitch_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR)
def api_update_pitch(pitch_id: str):
    user_doc = _current_user_doc()
    pitch = _find_owned_pitch_or_404(pitch_id, user_doc)
    if not pitch:
        return jsonify({"ok": False, "error": "Pitch not found."}), 404

    payload = _request_payload()
    update = {"updatedAt": _now_iso()}
    if "status" in payload:
        next_status = str(payload.get("status") or "").strip()
        if not next_status:
            return jsonify({"ok": False, "error": "Status is required."}), 400
        update["status"] = next_status
    if len(update) == 1:
        return jsonify({"ok": False, "error": "No editable fields provided."}), 400

    pitches_col.update_one({"_id": pitch["_id"]}, {"$set": update})
    if "status" in update and update["status"] != pitch.get("status"):
        _record_status_activity("pitch", _doc_public_id(pitch, "pitchId"), pitch.get("status", ""), update["status"], user_doc)
    updated = pitches_col.find_one({"_id": pitch["_id"]}) or {}
    payload = {"ok": True, "pitch": _pitch_to_api(updated)}
    if update.get("status") == "Approved":
        payload["story"] = _story_to_api(_create_story_from_pitch(updated, user_doc))
    return jsonify(payload)


@app.get("/api/feedback")
@require_auth
def api_feedback():
    user_doc = _current_user_doc()
    entity_type = str(request.args.get("entityType") or "").strip().lower()
    entity_id = str(request.args.get("entityId") or "").strip()
    _, error, status = _require_feedback_entity(entity_type, entity_id, user_doc)
    if error:
        return jsonify({"ok": False, "error": error}), status
    docs = list(
        feedback_col.find({
            "entityType": entity_type,
            "entityId": entity_id,
        }).sort([("createdAt", -1), ("_id", -1)]).limit(100)
    )
    return jsonify({"ok": True, "feedback": [_feedback_to_api(doc) for doc in docs]})


@app.post("/api/feedback")
@require_roles(ROLE_ADMIN, ROLE_EDITOR)
def api_create_feedback():
    user_doc = _current_user_doc()
    payload = _request_payload()
    entity_type = str(payload.get("entityType") or "").strip().lower()
    entity_id = str(payload.get("entityId") or "").strip()
    _, error, status = _require_feedback_entity(entity_type, entity_id, user_doc)
    if error:
        return jsonify({"ok": False, "error": error}), status
    text = str(payload.get("text") or "").strip()
    if not text:
        return jsonify({"ok": False, "error": "Feedback text is required."}), 400
    if len(text) > 4000:
        return jsonify({"ok": False, "error": "Feedback must be 4000 characters or fewer."}), 400

    now = datetime.now(timezone.utc)
    doc = {
        "entityType": entity_type,
        "entityId": entity_id,
        "text": text,
        "authorId": str(user_doc.get("_id")),
        "authorEmail": user_doc.get("email", ""),
        "authorName": _user_display_name(user_doc),
        "createdAt": now,
        "updatedAt": now,
    }
    res = feedback_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return jsonify({"ok": True, "feedback": _feedback_to_api(doc)})


@app.patch("/api/feedback/<feedback_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR)
def api_update_feedback(feedback_id: str):
    user_doc = _current_user_doc()
    oid = _object_id_or_none(feedback_id)
    if not oid:
        return jsonify({"ok": False, "error": "Invalid feedback id."}), 400
    doc = feedback_col.find_one({"_id": oid})
    if not doc:
        return jsonify({"ok": False, "error": "Feedback not found."}), 404
    _, error, status = _require_feedback_entity(doc.get("entityType"), doc.get("entityId"), user_doc)
    if error:
        return jsonify({"ok": False, "error": error}), status
    text = str(_request_payload().get("text") or "").strip()
    if not text:
        return jsonify({"ok": False, "error": "Feedback text is required."}), 400
    if len(text) > 4000:
        return jsonify({"ok": False, "error": "Feedback must be 4000 characters or fewer."}), 400
    feedback_col.update_one({"_id": oid}, {"$set": {"text": text, "updatedAt": datetime.now(timezone.utc)}})
    updated = feedback_col.find_one({"_id": oid}) or {}
    return jsonify({"ok": True, "feedback": _feedback_to_api(updated)})


@app.delete("/api/feedback/<feedback_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR)
def api_delete_feedback(feedback_id: str):
    user_doc = _current_user_doc()
    oid = _object_id_or_none(feedback_id)
    if not oid:
        return jsonify({"ok": False, "error": "Invalid feedback id."}), 400
    doc = feedback_col.find_one({"_id": oid})
    if not doc:
        return jsonify({"ok": False, "error": "Feedback not found."}), 404
    _, error, status = _require_feedback_entity(doc.get("entityType"), doc.get("entityId"), user_doc)
    if error:
        return jsonify({"ok": False, "error": error}), status
    feedback_col.delete_one({"_id": oid})
    return jsonify({"ok": True})


@app.get("/api/activity")
@require_auth
def api_activity():
    user_doc = _current_user_doc()
    entity_type = str(request.args.get("entityType") or "").strip().lower()
    entity_id = str(request.args.get("entityId") or "").strip()
    if entity_type not in {"story", "pitch"} or not entity_id:
        return jsonify({"ok": False, "error": "Activity requires story or pitch entity information."}), 400

    if entity_type == "story":
        permitted_doc = _find_owned_story_or_404(entity_id, user_doc)
        denied_message = "Story activity is not available."
    else:
        permitted_doc = _find_owned_pitch_or_404(entity_id, user_doc)
        denied_message = "Pitch activity is not available."
    if not permitted_doc:
        return jsonify({"ok": False, "error": denied_message}), 403

    docs = list(
        activity_col.find({
            "entityType": entity_type,
            "entityId": entity_id,
            "eventType": {"$in": sorted(IMPORTANT_ACTIVITY_EVENTS)},
        }).sort([("createdAt", -1), ("_id", -1)]).limit(50)
    )
    return jsonify({"ok": True, "activity": [_activity_to_api(doc) for doc in docs]})


@app.get("/api/article-records")
@require_auth
def api_article_records():
    page = max(1, int(request.args.get("page", "1") or "1"))
    limit = min(max(1, int(request.args.get("limit", "20") or "20")), 5000)
    skip = (page - 1) * limit
    search = str(request.args.get("search") or "").strip()
    section = str(request.args.get("section") or "").strip()
    sort = str(request.args.get("sort") or "desc").strip().lower()
    sort_direction = ASCENDING if sort == "asc" else -1

    query = {}
    clauses = []
    if search:
        rx = {"$regex": re.escape(search), "$options": "i"}
        clauses.append({"$or": [
            {"title": rx},
            {"articleTitle": rx},
            {"author": rx},
            {"authors": rx},
            {"tags": rx},
            {"categories": rx},
            {"section": rx},
            {"category": rx},
        ]})
    if section and section != "All sections":
        clauses.append({"$or": [
            {"section": section},
            {"category": section},
            {"tags": section},
            {"categories": section},
        ]})
    if clauses:
        query = {"$and": clauses} if len(clauses) > 1 else clauses[0]

    total = articles_col.count_documents(query)
    docs = list(
        articles_col.find(query)
        .sort([("datePublishedSort", sort_direction), ("_id", sort_direction)])
        .skip(skip)
        .limit(limit)
    )

    urls = []
    for doc in docs:
        url = str(doc.get("url") or doc.get("articleUrl") or doc.get("article_url") or "").strip()
        if url:
            urls.extend(_article_url_lookup_candidates(url))

    people_by_url: dict[str, list[dict]] = {}
    if urls:
        cursor = interviews_col.find({
            "$or": [
                {"url": {"$in": urls}},
                {"articleUrl": {"$in": urls}},
                {"article_url": {"$in": urls}},
            ]
        })
        for person_doc in cursor:
            person = _interview_to_api(person_doc)
            people_by_url.setdefault(_article_join_url_key(person["url"]), []).append(person)

    section_values = set()
    for doc in articles_col.find({}, {"section": 1, "category": 1, "tags": 1, "categories": 1}):
        for value in [doc.get("section"), doc.get("category")]:
            text = str(value or "").strip()
            if text:
                section_values.add(text)
        for field in ["tags", "categories"]:
            section_values.update(_coerce_list_field(doc.get(field)))

    total_pages = max(1, (total + limit - 1) // limit)
    return jsonify({
        "ok": True,
        "articles": [_article_to_api(doc, people_by_url) for doc in docs],
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
        "sections": sorted(section_values, key=lambda value: value.lower()),
    })


@app.get("/api/interview-records")
@require_auth
def api_interview_records():
    docs = list(interviews_col.find({}).sort([("_id", -1)]))
    return jsonify({"ok": True, "people": [_interview_to_api(doc) for doc in docs]})


@app.post("/api/interview-records/<record_id>")
@require_role_at_least(ROLE_EDITOR)
def api_update_interview_record(record_id: str):
    try:
        oid = ObjectId(record_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid record id"}), 400

    payload = _request_payload()
    allowed = {"firstName", "lastName", "grade", "house", "url"}
    update = {
        key: ("" if payload.get(key) is None else str(payload.get(key)).strip())
        for key in allowed
        if key in payload
    }
    if not update:
        return jsonify({"ok": False, "error": "No editable fields provided"}), 400

    result = interviews_col.update_one({"_id": oid}, {"$set": update})
    if result.matched_count == 0:
        return jsonify({"ok": False, "error": "Record not found"}), 404

    doc = interviews_col.find_one({"_id": oid}) or {}
    return jsonify({"ok": True, "record": _interview_to_api(doc)})


@app.post("/api/extract")
@require_role_at_least(ROLE_EDITOR)
def api_extract():
    return jsonify({
        "ok": False,
        "error": "The v3 extractor endpoint is not configured yet. Authentication and database reads are separated from v2.",
    }), 501


@app.post("/api/save")
@require_role_at_least(ROLE_EDITOR)
def api_save():
    return jsonify({
        "ok": False,
        "error": "The v3 save endpoint is not configured yet. Authentication and database reads are separated from v2.",
    }), 501


if __name__ == "__main__":
    app.run(
        host=os.getenv("V3_AUTH_HOST", "127.0.0.1"),
        port=int(os.getenv("V3_AUTH_PORT", "5003")),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
        use_reloader=False,
    )

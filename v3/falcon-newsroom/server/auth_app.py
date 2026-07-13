import os
import re
import secrets
from io import BytesIO
from datetime import timedelta, timezone, datetime
from functools import wraps
from pathlib import Path
from time import monotonic
from urllib.parse import urlencode, urlparse

import gridfs
import requests
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request, send_file, session, url_for
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from werkzeug.utils import secure_filename
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
WORKSPACE_COLLECTION = os.getenv("WORKSPACE_COLLECTION", "newsroomWorkspaces")
AUTH_RATE_LIMIT_MAX = int(os.getenv("AUTH_RATE_LIMIT_MAX", "8"))
AUTH_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("AUTH_RATE_LIMIT_WINDOW_SECONDS", "900"))
MAX_STORY_ATTACHMENT_BYTES = int(os.getenv("MAX_STORY_ATTACHMENT_BYTES", str(10 * 1024 * 1024)))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_AUTH_REDIRECT_URI = os.getenv("GOOGLE_AUTH_REDIRECT_URI", "")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "").rstrip("/")
DEFAULT_DEV_FRONTEND_ORIGIN = "http://127.0.0.1:5173"
GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file"
GOOGLE_OAUTH_SCOPES = ("openid", "email", "profile", GOOGLE_DRIVE_SCOPE)
GOOGLE_PICKER_API_KEY = os.getenv("GOOGLE_PICKER_API_KEY", "")
GOOGLE_PICKER_APP_ID = os.getenv("GOOGLE_PICKER_APP_ID", "")
GOOGLE_PICKER_CLIENT_ID = os.getenv("GOOGLE_PICKER_CLIENT_ID", GOOGLE_CLIENT_ID)
GOOGLE_ALLOWED_DOMAINS = {
    domain.strip().lower().lstrip("@")
    for domain in os.getenv("GOOGLE_ALLOWED_DOMAINS", "").split(",")
    if domain.strip()
}
GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_DRIVE_FILES_ENDPOINT = "https://www.googleapis.com/drive/v3/files"
GOOGLE_INTENT_LOGIN = "login"
GOOGLE_INTENT_SIGNUP = "signup"
GOOGLE_INTENTS = {GOOGLE_INTENT_LOGIN, GOOGLE_INTENT_SIGNUP}

ROLE_GUEST = "guest"
ROLE_WRITER = "writer"
ROLE_EDITOR = "editor"
ROLE_ADMIN = "admin"
VALID_ROLES = {ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER, ROLE_GUEST}
ROLE_RANK = {
    ROLE_GUEST: 1,
    ROLE_WRITER: 2,
    ROLE_EDITOR: 3,
    ROLE_ADMIN: 4,
}
FRONTEND_ROLE_LANDING = {
    ROLE_GUEST: "/interviewees",
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
    "pitch-owner-submit",
    "shared-workflow-activity",
    "shared-feedback",
    "personal-dashboard",
    "story-invitations",
    "multi-workspace",
    "workspace-join-codes",
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
workspaces_col = db[WORKSPACE_COLLECTION]
story_files = gridfs.GridFS(db, collection="storyAttachments")
AUTH_FAILURES: dict[str, list[float]] = {}
GOOGLE_STATE_MAX_AGE_SECONDS = 600

try:
    users_col.create_index([("email", ASCENDING)], unique=True)
except Exception:
    pass

try:
    users_col.create_index([("googleSub", ASCENDING)], unique=True, sparse=True)
except Exception:
    pass

try:
    users_col.create_index([("googleId", ASCENDING)], unique=True, sparse=True)
except Exception:
    pass

try:
    workspaces_col.create_index([("publicId", ASCENDING)], unique=True)
except Exception:
    pass

try:
    workspaces_col.create_index([("joinCode", ASCENDING)], unique=True)
except Exception:
    pass

try:
    stories_col.create_index([("writerEmail", ASCENDING), ("status", ASCENDING)])
except Exception:
    pass

try:
    stories_col.create_index([("collaborators.email", ASCENDING), ("status", ASCENDING)])
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
    if role == "viewer":
        return ROLE_GUEST
    return role if role in VALID_ROLES else ROLE_GUEST


def normalize_workspace_code(value) -> str:
    return re.sub(r"[^A-Z0-9]", "", str(value or "").upper())


def _new_workspace_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    while True:
        code = "".join(secrets.choice(alphabet) for _ in range(7))
        if not workspaces_col.find_one({"joinCode": code}):
            return code


def _serialize_workspace(doc: dict | None, include_join_code: bool = False) -> dict | None:
    if not doc:
        return None
    workspace = {
        "id": str(doc.get("publicId") or doc.get("_id") or ""),
        "name": str(doc.get("name") or "Workspace"),
    }
    if include_join_code:
        workspace["joinCode"] = str(doc.get("joinCode") or "")
    return workspace


def _workspace_id_for_user(user_doc: dict | None) -> str:
    return str((user_doc or {}).get("workspaceId") or "").strip()


def _workspace_for_user(user_doc: dict | None):
    workspace_id = _workspace_id_for_user(user_doc)
    if not workspace_id:
        return None
    clauses = [{"publicId": workspace_id}]
    try:
        clauses.append({"_id": ObjectId(workspace_id)})
    except Exception:
        pass
    return workspaces_col.find_one({"$or": clauses})


def _workspace_query(user_doc: dict | None) -> dict:
    workspace_id = _workspace_id_for_user(user_doc)
    return {"workspaceId": workspace_id} if workspace_id else {"_id": None}


def _scoped_query(user_doc: dict | None, query: dict | None = None) -> dict:
    workspace = _workspace_query(user_doc)
    if not query:
        return workspace
    return {"$and": [workspace, query]}


def _ensure_default_workspace():
    public_id = os.getenv("DEFAULT_WORKSPACE_ID", "poolesville-pulse").strip() or "poolesville-pulse"
    existing = workspaces_col.find_one({"publicId": public_id})
    if not existing:
        now_iso = _now_iso()
        doc = {
            "publicId": public_id,
            "name": os.getenv("DEFAULT_WORKSPACE_NAME", "Poolesville Pulse").strip() or "Poolesville Pulse",
            "joinCode": normalize_workspace_code(os.getenv("DEFAULT_WORKSPACE_JOIN_CODE")) or _new_workspace_code(),
            "createdAt": now_iso,
            "updatedAt": now_iso,
        }
        try:
            result = workspaces_col.insert_one(doc)
            doc["_id"] = result.inserted_id
            existing = doc
        except DuplicateKeyError:
            existing = workspaces_col.find_one({"publicId": public_id})

    if existing and not existing.get("legacyMembershipMigratedAt"):
        users_col.update_many({"workspaceId": {"$exists": False}}, {"$set": {"workspaceId": public_id}})
        users_col.update_many({"role": "viewer"}, {"$set": {"role": ROLE_GUEST}})
        for collection in (interviews_col, articles_col, stories_col, pitches_col, activity_col, feedback_col):
            collection.update_many({"workspaceId": {"$exists": False}}, {"$set": {"workspaceId": public_id}})
        workspaces_col.update_one({"_id": existing["_id"]}, {"$set": {"legacyMembershipMigratedAt": _now_iso()}})


_ensure_default_workspace()


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


def _google_id_from_doc(doc: dict) -> str:
    return str(doc.get("googleId") or doc.get("googleSub") or "").strip()


def find_user_by_google_id(google_id: str):
    value = str(google_id or "").strip()
    if not value:
        return None
    return users_col.find_one({"$or": [{"googleId": value}, {"googleSub": value}]})


def find_user_by_google_sub(google_sub: str):
    return find_user_by_google_id(google_sub)


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
        "role": normalize_role(doc.get("role")) if _workspace_id_for_user(doc) else "",
        "workspaceId": _workspace_id_for_user(doc),
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
            if not _workspace_id_for_user(user_doc):
                return jsonify({"ok": False, "error": "Join a workspace first."}), 403
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
            if not _workspace_id_for_user(user_doc):
                return jsonify({"ok": False, "error": "Join a workspace first."}), 403
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
    values = [str(user_doc.get("_id")), normalize_email(user_doc.get("email") or "")]
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
    ]}


def _collaborator_story_query(user_doc: dict) -> dict:
    values = _owner_match_values(user_doc)
    return {"collaborators": {"$elemMatch": {"$and": [
        {"$or": [{"status": "accepted"}, {"status": {"$exists": False}}]},
        {"$or": [
            {"userId": {"$in": values}},
            {"id": {"$in": values}},
            {"email": {"$in": values}},
        ]},
    ]}}}


def _story_primary_owned_by_user(story: dict, user_doc: dict) -> bool:
    if not story or not user_doc:
        return False
    values = {str(value).lower() for value in _owner_match_values(user_doc) if value}
    fields = [
        story.get("writerUserId"),
        story.get("writerId"),
        story.get("ownerUserId"),
        story.get("ownerId"),
        normalize_email(story.get("writerEmail") or ""),
        normalize_email(story.get("ownerEmail") or ""),
    ]
    return any(str(value).lower() in values for value in fields if value)


def _story_collaborators(doc: dict) -> list[dict]:
    raw = doc.get("collaborators") if isinstance(doc.get("collaborators"), list) else []
    collaborators = []
    seen = set()
    for item in raw:
        if not isinstance(item, dict):
            continue
        email = normalize_email(item.get("email") or "")
        if not email or email in seen:
            continue
        seen.add(email)
        role = str(item.get("role") or "comment").strip().lower()
        if role not in {"comment", "edit"}:
            role = "comment"
        name = str(item.get("name") or email).strip()
        collaborators.append({
            "id": str(item.get("userId") or item.get("id") or email),
            "userId": str(item.get("userId") or item.get("id") or ""),
            "email": email,
            "name": name,
            "role": role,
            "status": str(item.get("status") or "accepted").strip().lower(),
            "message": str(item.get("message") or "").strip(),
            "invitedBy": str(item.get("invitedBy") or "").strip(),
            "invitedAt": _date_for_api(item.get("invitedAt")),
            "invitedAtIso": _datetime_for_api(item.get("invitedAt")),
        })
    return collaborators


def _story_collaborator_for_user(story: dict, user_doc: dict) -> dict | None:
    if not story or not user_doc:
        return None
    values = {str(value).lower() for value in _owner_match_values(user_doc) if value}
    for collaborator in _story_collaborators(story):
        candidate_values = {
            str(collaborator.get("id") or "").lower(),
            str(collaborator.get("userId") or "").lower(),
            normalize_email(collaborator.get("email") or ""),
        }
        if collaborator.get("status") == "accepted" and values.intersection({value for value in candidate_values if value}):
            return collaborator
    return None


def _can_manage_story_collaborators(story: dict, user_doc: dict) -> bool:
    role = _current_user_role(user_doc)
    return role in {ROLE_ADMIN, ROLE_EDITOR} or (role == ROLE_WRITER and (_story_primary_owned_by_user(story, user_doc) or _story_collaborator_for_user(story, user_doc) is not None))


def _can_edit_story_content(story: dict, user_doc: dict) -> bool:
    role = _current_user_role(user_doc)
    if role in {ROLE_ADMIN, ROLE_EDITOR}:
        return True
    if role != ROLE_WRITER:
        return False
    if _story_primary_owned_by_user(story, user_doc):
        return True
    collaborator = _story_collaborator_for_user(story, user_doc)
    return collaborator is not None

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


def _pitch_owned_by_user(pitch: dict, user_doc: dict) -> bool:
    if not pitch or not user_doc:
        return False
    values = {str(value).lower() for value in _owner_match_values(user_doc) if value}
    fields = [
        pitch.get("ownerUserId"),
        pitch.get("ownerId"),
        pitch.get("writerUserId"),
        pitch.get("writerId"),
        normalize_email(pitch.get("ownerEmail") or ""),
        normalize_email(pitch.get("writerEmail") or ""),
    ]
    return any(str(value).lower() in values for value in fields if value)

def _story_query_for_user(user_doc: dict):
    role = _current_user_role(user_doc)
    if not _workspace_id_for_user(user_doc) or role == ROLE_GUEST:
        return None
    if role == ROLE_WRITER:
        return _scoped_query(user_doc, {"$or": _owned_story_query(user_doc)["$or"] + [_collaborator_story_query(user_doc)]})
    return _workspace_query(user_doc)


def _pitch_query_for_user(user_doc: dict):
    role = _current_user_role(user_doc)
    if not _workspace_id_for_user(user_doc) or role == ROLE_GUEST:
        return None
    if role == ROLE_WRITER:
        return _scoped_query(user_doc, _owned_pitch_query(user_doc))
    return _workspace_query(user_doc)


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


def _datetime_for_api(value) -> str:
    if isinstance(value, datetime):
        parsed = value
    else:
        raw = str(value or "").strip()
        if not raw:
            return ""
        try:
            parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except ValueError:
            return ""
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    else:
        parsed = parsed.astimezone(timezone.utc)
    return parsed.isoformat(timespec="milliseconds")


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


def _is_valid_http_url(value: str) -> bool:
    try:
        parsed = urlparse(str(value or "").strip())
    except Exception:
        return False
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def _drive_type_label(mime_type: str = "", name: str = "") -> str:
    mime = str(mime_type or "").strip().lower()
    filename = str(name or "").strip().lower()
    if mime == "application/vnd.google-apps.document":
        return "Doc"
    if mime == "application/vnd.google-apps.presentation":
        return "Slides"
    if mime == "application/vnd.google-apps.spreadsheet":
        return "Sheet"
    if mime == "application/vnd.google-apps.folder":
        return "Folder"
    if mime == "application/pdf" or filename.endswith(".pdf"):
        return "PDF"
    if "wordprocessingml" in mime or filename.endswith((".doc", ".docx", ".odt")):
        return "Document"
    if "presentationml" in mime or filename.endswith((".ppt", ".pptx", ".odp")):
        return "Slides"
    if "spreadsheetml" in mime or filename.endswith((".xls", ".xlsx", ".ods", ".csv")):
        return "Spreadsheet"
    if mime.startswith("image/"):
        return "Image"
    if mime.startswith("video/"):
        return "Video"
    if mime.startswith("audio/"):
        return "Audio"
    if mime.startswith("text/") or filename.endswith((".txt", ".md", ".rtf")):
        return "Text"
    return "Drive file"


def _new_attachment_id(prefix: str = "att") -> str:
    return f"{prefix}_{secrets.token_urlsafe(8)}"


def _attachment_added_by(user_doc: dict) -> dict:
    return {
        "userId": str(user_doc.get("_id")),
        "email": normalize_email(user_doc.get("email") or ""),
        "name": _user_display_name(user_doc),
    }


def _story_attachment_item_to_api(story_id: str, item: dict) -> dict | None:
    if not isinstance(item, dict):
        return None
    attachment_type = str(item.get("type") or "").strip().lower()
    attachment_id = str(item.get("id") or item.get("attachmentId") or "").strip()

    if attachment_type == "drive":
        drive_file_id = str(item.get("fileId") or "").strip()
        if not drive_file_id:
            return None
        drive_url = item.get("webViewLink") or item.get("url") or ""
        return {
            "id": attachment_id or drive_file_id,
            "type": "drive",
            "provider": "google-drive",
            "fileId": drive_file_id,
            "name": item.get("name") or "Drive file",
            "mimeType": item.get("mimeType") or "",
            "typeLabel": item.get("typeLabel") or _drive_type_label(item.get("mimeType"), item.get("name")),
            "url": drive_url,
            "webViewLink": drive_url,
            "iconUrl": item.get("iconLink") or "",
            "addedBy": item.get("addedBy") or {},
            "addedAt": _date_for_api(item.get("addedAt")),
            "permissionStatus": item.get("permissionStatus") or "not_shared",
            "shareResults": item.get("shareResults") if isinstance(item.get("shareResults"), list) else [],
            "lastShareAttemptAt": _date_for_api(item.get("lastShareAttemptAt")),
            "copyable": True,
        }

    if attachment_type == "file":
        file_id = str(item.get("fileId") or item.get("attachmentFileId") or "").strip()
        file_name = str(item.get("name") or item.get("attachmentName") or "").strip()
        if not file_id or not file_name:
            return None
        return {
            "id": attachment_id or file_id,
            "type": "file",
            "name": file_name,
            "contentType": item.get("contentType") or item.get("attachmentContentType") or "application/octet-stream",
            "size": int(item.get("size") or item.get("attachmentSize") or 0),
            "url": f"/api/stories/{story_id}/attachments/{attachment_id}" if attachment_id else f"/api/stories/{story_id}/attachment",
            "uploadedAt": _date_for_api(item.get("uploadedAt") or item.get("attachmentUploadedAt")),
            "addedBy": item.get("addedBy") or {},
            "permissionStatus": "app_access",
        }

    if attachment_type == "link":
        link_url = str(item.get("url") or item.get("webViewLink") or "").strip()
        if not _is_valid_http_url(link_url):
            return None
        return {
            "id": attachment_id or link_url,
            "type": "link",
            "provider": "manual-link",
            "name": item.get("name") or "Story link",
            "url": link_url,
            "uploadedAt": _date_for_api(item.get("uploadedAt") or item.get("addedAt")),
            "addedBy": item.get("addedBy") or {},
            "permissionStatus": "manual",
        }
    return None


def _legacy_story_attachment_items(doc: dict) -> list[dict]:
    items = []
    drive_attachment = doc.get("driveAttachment") if isinstance(doc.get("driveAttachment"), dict) else {}
    if drive_attachment.get("fileId"):
        items.append({
            **drive_attachment,
            "id": drive_attachment.get("id") or "legacy-drive",
            "type": "drive",
        })

    file_id = str(doc.get("attachmentFileId") or "").strip()
    file_name = str(doc.get("attachmentName") or "").strip()
    if file_id and file_name:
        items.append({
            "id": "legacy-file",
            "type": "file",
            "fileId": file_id,
            "name": file_name,
            "contentType": doc.get("attachmentContentType") or "application/octet-stream",
            "size": _int_field(doc, "attachmentSize"),
            "uploadedAt": doc.get("attachmentUploadedAt") or doc.get("updatedAt"),
        })

    link_url = str(doc.get("googleDocUrl") or doc.get("docUrl") or "").strip()
    if _is_valid_http_url(link_url):
        items.append({
            "id": "legacy-link",
            "type": "link",
            "provider": "manual-link",
            "name": doc.get("attachmentName") or "Story link",
            "url": link_url,
            "uploadedAt": _date_for_api(doc.get("updatedAt")),
            "permissionStatus": "manual",
        })
    return items


def _story_attachments_to_api(doc: dict) -> list[dict]:
    story_id = _doc_public_id(doc, "storyId")
    raw_items = []
    if isinstance(doc.get("attachments"), list):
        raw_items.extend(item for item in doc.get("attachments") if isinstance(item, dict))
    raw_items.extend(_legacy_story_attachment_items(doc))
    attachments = []
    seen = set()
    for item in raw_items:
        api_item = _story_attachment_item_to_api(story_id, item)
        if not api_item:
            continue
        key = _attachment_item_key(api_item)
        if key in seen:
            continue
        seen.add(key)
        attachments.append(api_item)
    return attachments


def _story_attachment_to_api(doc: dict) -> dict | None:
    attachments = _story_attachments_to_api(doc)
    return attachments[0] if attachments else None


def _attachment_item_key(item: dict) -> str:
    item_type = str(item.get("type") or "").strip().lower()
    url = str(item.get("webViewLink") or item.get("url") or "").strip()
    if item_type in {"drive", "link"} and url:
        return f"url:{url}"
    if item_type == "file":
        file_id = str(item.get("fileId") or item.get("attachmentFileId") or "").strip()
        if file_id:
            return f"{item_type}:{file_id}"
    return str(item.get("id") or item.get("attachmentId") or item.get("url") or "").strip()


def _attachment_identifiers(item: dict) -> set[str]:
    identifiers = {
        str(item.get("id") or "").strip(),
        str(item.get("attachmentId") or "").strip(),
        str(item.get("fileId") or "").strip(),
        str(item.get("attachmentFileId") or "").strip(),
        str(item.get("webViewLink") or "").strip(),
        str(item.get("url") or "").strip(),
    }
    key = _attachment_item_key(item)
    if key:
        identifiers.add(key)
    return {identifier for identifier in identifiers if identifier}


def _attachment_pull_condition(attachment_id: str) -> dict:
    target = str(attachment_id or "").strip()
    return {
        "$or": [
            {"id": target},
            {"attachmentId": target},
            {"fileId": target},
            {"attachmentFileId": target},
            {"webViewLink": target},
            {"url": target},
        ]
    }


def _merged_attachment_items(story: dict, *new_items: dict) -> list[dict]:
    additions = []
    if isinstance(story.get("attachments"), list):
        additions.extend(item for item in story.get("attachments") if isinstance(item, dict))
    additions.extend(_legacy_story_attachment_items(story))
    additions.extend(item for item in new_items if isinstance(item, dict))

    deduped = []
    seen = set()
    for item in additions:
        key = _attachment_item_key(item)
        if key and key in seen:
            continue
        if key:
            seen.add(key)
        deduped.append(item)
    return deduped


def _attachment_push_value(story: dict, *new_items: dict) -> dict:
    return {"$each": _merged_attachment_items(story, *new_items)}


DUE_DATE_FIELDS = ("deadline", "dueDate", "approvalDueDate", "due", "dateDue", "deadlineDate", "due_date", "deadline_date", "approval_due_date")


def _first_text_value(*values) -> str:
    for value in values:
        text = str(value or "").strip()
        if text:
            return text
    return ""


def _due_date_from_doc(doc: dict) -> str:
    return _first_text_value(*(doc.get(field) for field in DUE_DATE_FIELDS))


def _story_deadline(doc: dict) -> str:
    raw_deadline = _due_date_from_doc(doc)
    return _date_for_api(raw_deadline) or raw_deadline


def _story_to_api(doc: dict) -> dict:
    writer = str(doc.get("writer") or doc.get("owner") or doc.get("author") or "").strip()
    authors = _coerce_list_field(doc.get("authors"))
    if not writer and authors:
        writer = authors[0]
    attachments = _story_attachments_to_api(doc)
    deadline = _story_deadline(doc)
    accepted_collaborators = [item for item in _story_collaborators(doc) if item.get("status") == "accepted"]
    author_names = []
    for name in [writer, *[item.get("name") for item in accepted_collaborators]]:
        clean_name = str(name or "").strip()
        if clean_name and clean_name not in author_names:
            author_names.append(clean_name)
    return {
        "id": _doc_public_id(doc, "storyId"),
        "title": doc.get("title") or doc.get("storyTitle") or "Untitled story",
        "section": doc.get("section", "") or "",
        "writer": writer or doc.get("writerEmail", "") or "Unassigned",
        "writerEmail": doc.get("writerEmail") or doc.get("ownerEmail") or "",
        "writerUserId": str(doc.get("writerUserId") or doc.get("ownerUserId") or ""),
        "authors": author_names,
        "authorProfiles": ([{
            "name": writer or doc.get("writerEmail", "") or "Unassigned",
            "email": doc.get("writerEmail") or doc.get("ownerEmail") or "",
            "primary": True,
        }] if writer or doc.get("writerEmail") or doc.get("ownerEmail") else []) + [{
            "name": item.get("name") or item.get("email"),
            "email": item.get("email"),
            "primary": False,
        } for item in accepted_collaborators],
        "editor": doc.get("editor", "") or "",
        "status": doc.get("status") or "Assigned",
        "priority": doc.get("priority") or "Normal",
        "deadline": deadline,
        "dueDate": deadline,
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
        "attachments": attachments,
        "attachment": attachments[0] if attachments else None,
        "feedback": doc.get("feedback") if isinstance(doc.get("feedback"), list) else [],
        "comments": doc.get("comments") if isinstance(doc.get("comments"), list) else [],
        "sources": doc.get("sources") if isinstance(doc.get("sources"), list) else [],
        "collaborators": _story_collaborators(doc),
    }


def _normalize_pitch_status(value) -> str:
    status = str(value or "").strip()
    return {
        "New": "In Progress",
        "Submitted": "Ready for Review",
        "Needs Review": "Ready for Review",
    }.get(status, status or "In Progress")

def _pitch_to_api(doc: dict) -> dict:
    deadline = _story_deadline(doc)
    return {
        "id": _doc_public_id(doc, "pitchId"),
        "title": doc.get("title") or "Untitled pitch",
        "angle": doc.get("angle") or doc.get("summary") or "",
        "status": _normalize_pitch_status(doc.get("status")),
        "section": doc.get("section", "") or "",
        "owner": doc.get("owner") or doc.get("writer") or doc.get("ownerEmail") or "Unassigned",
        "ownerEmail": doc.get("ownerEmail") or doc.get("writerEmail") or "",
        "ownerUserId": str(doc.get("ownerUserId") or doc.get("writerUserId") or ""),
        "submittedAt": _date_for_api(doc.get("submittedAt") or doc.get("createdAt")),
        "notes": doc.get("notes", "") or "",
        "deadline": deadline,
        "dueDate": deadline,
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
        "occurredAt": _datetime_for_api(doc.get("createdAt")),
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
        "workspaceId": _workspace_id_for_user(actor_doc),
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


def _delete_story_file(file_id_value):
    file_id = _object_id_or_none(str(file_id_value or ""))
    if not file_id:
        return
    try:
        story_files.delete(file_id)
    except Exception:
        pass


def _create_story_from_pitch(pitch_doc: dict, actor_doc: dict, deadline: str = "", editor_note: str = ""):
    pitch_id = _doc_public_id(pitch_doc, "pitchId")
    now_iso = _now_iso()
    story_deadline = _first_text_value(deadline, _due_date_from_doc(pitch_doc))
    workspace_id = _workspace_id_for_user(actor_doc)
    existing = stories_col.find_one({"sourcePitchId": pitch_id, "workspaceId": workspace_id})
    if existing:
        existing_update = {"updatedAt": now_iso}
        if story_deadline:
            existing_update["deadline"] = story_deadline
            existing_update["dueDate"] = story_deadline
        if editor_note:
            existing_update["editorNote"] = editor_note
            existing_update["nextStep"] = editor_note
        if len(existing_update) > 1:
            stories_col.update_one({"_id": existing["_id"]}, {"$set": existing_update})
            existing = stories_col.find_one({"_id": existing["_id"]}) or existing
        return existing

    doc = {
        "workspaceId": workspace_id,
        "title": pitch_doc.get("title") or "Untitled story",
        "section": pitch_doc.get("section", "") or "",
        "writer": pitch_doc.get("owner") or pitch_doc.get("writer") or "Unassigned",
        "writerEmail": pitch_doc.get("ownerEmail") or pitch_doc.get("writerEmail") or "",
        "writerUserId": pitch_doc.get("ownerUserId") or pitch_doc.get("writerUserId") or "",
        "editor": _user_display_name(actor_doc),
        "status": "Assigned",
        "priority": "Normal",
        "deadline": story_deadline,
        "dueDate": story_deadline,
        "submittedAt": pitch_doc.get("submittedAt") or pitch_doc.get("createdAt") or now_iso,
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "summary": pitch_doc.get("angle") or pitch_doc.get("summary") or "",
        "nextStep": editor_note or "Begin reporting from the approved pitch.",
        "editorNote": editor_note or pitch_doc.get("editorFeedback", "") or "",
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
    configured_redirect = str(GOOGLE_AUTH_REDIRECT_URI or "").strip()
    if configured_redirect:
        return configured_redirect
    if FRONTEND_ORIGIN:
        return f"{FRONTEND_ORIGIN}/api/auth/google/callback"
    if FLASK_ENV != "production":
        return f"{DEFAULT_DEV_FRONTEND_ORIGIN}/api/auth/google/callback"
    return url_for("api_google_callback", _external=True)


def _google_scope_string() -> str:
    return " ".join(GOOGLE_OAUTH_SCOPES)


def _google_state_serializer():
    return URLSafeTimedSerializer(app.secret_key, salt="falcon-google-oauth-state-v1")


def _google_missing_config() -> list[str]:
    missing = []
    if not GOOGLE_CLIENT_ID:
        missing.append("GOOGLE_CLIENT_ID")
    if not GOOGLE_CLIENT_SECRET:
        missing.append("GOOGLE_CLIENT_SECRET")
    return missing


def _normalize_google_intent(value: str) -> str:
    candidate = str(value or "").strip().lower()
    return candidate if candidate in GOOGLE_INTENTS else GOOGLE_INTENT_LOGIN


def _is_google_configured() -> bool:
    return not _google_missing_config()


def _oauth_expires_at(expires_in) -> datetime:
    seconds = max(60, int(expires_in or 3600) - 60)
    return datetime.now(timezone.utc) + timedelta(seconds=seconds)


def _parse_oauth_expiry(value) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except Exception:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _store_google_oauth_tokens(user_doc: dict, token_payload: dict):
    access_token = str(token_payload.get("access_token") or "").strip()
    if not access_token:
        return
    scopes = str(token_payload.get("scope") or _google_scope_string()).split()
    update = {
        "googleOAuth.accessToken": access_token,
        "googleOAuth.tokenType": token_payload.get("token_type") or "Bearer",
        "googleOAuth.expiresAt": _oauth_expires_at(token_payload.get("expires_in")),
        "googleOAuth.scopes": scopes,
        "googleOAuth.updatedAt": datetime.now(timezone.utc),
    }
    refresh_token = str(token_payload.get("refresh_token") or "").strip()
    if refresh_token:
        update["googleOAuth.refreshToken"] = refresh_token
    users_col.update_one({"_id": user_doc["_id"]}, {"$set": update})
    user_doc.setdefault("googleOAuth", {}).update({
        "accessToken": access_token,
        "tokenType": update["googleOAuth.tokenType"],
        "expiresAt": update["googleOAuth.expiresAt"],
        "scopes": scopes,
        "updatedAt": update["googleOAuth.updatedAt"],
    })
    if refresh_token:
        user_doc["googleOAuth"]["refreshToken"] = refresh_token


def _google_drive_config_missing() -> list[str]:
    missing = []
    if not GOOGLE_PICKER_API_KEY:
        missing.append("GOOGLE_PICKER_API_KEY")
    if not GOOGLE_PICKER_APP_ID:
        missing.append("GOOGLE_PICKER_APP_ID")
    if not GOOGLE_PICKER_CLIENT_ID:
        missing.append("GOOGLE_PICKER_CLIENT_ID")
    return missing


def _google_reauth_url(next_url: str = "") -> str:
    params = {
        "origin": _sanitize_frontend_origin(FRONTEND_ORIGIN) or DEFAULT_DEV_FRONTEND_ORIGIN,
        "intent": GOOGLE_INTENT_LOGIN,
    }
    if next_url:
        params["next"] = _sanitize_next_url(next_url)
    return f"/api/auth/google/start?{urlencode(params)}"


def _has_drive_scope(user_doc: dict) -> bool:
    oauth = user_doc.get("googleOAuth") if isinstance(user_doc.get("googleOAuth"), dict) else {}
    scopes = oauth.get("scopes") if isinstance(oauth.get("scopes"), list) else str(oauth.get("scope") or "").split()
    return GOOGLE_DRIVE_SCOPE in set(str(scope) for scope in scopes)


def _google_oauth_error(message: str, status: int = 409):
    return jsonify({
        "ok": False,
        "error": message,
        "reauthUrl": _google_reauth_url(request.args.get("next") or request.path),
    }), status


def _google_access_token_for_user(user_doc: dict) -> tuple[str, str]:
    oauth = user_doc.get("googleOAuth") if isinstance(user_doc.get("googleOAuth"), dict) else {}
    if not oauth:
        return "", "Sign in with Google again to connect Drive."
    if not _has_drive_scope(user_doc):
        return "", "Sign in with Google again to grant Drive attachment access."

    access_token = str(oauth.get("accessToken") or "").strip()
    expires_at = _parse_oauth_expiry(oauth.get("expiresAt"))
    if access_token and expires_at and expires_at > datetime.now(timezone.utc):
        return access_token, ""

    refresh_token = str(oauth.get("refreshToken") or "").strip()
    if not refresh_token:
        return "", "Sign in with Google again so Falcon can refresh Drive access."

    try:
        response = requests.post(
            GOOGLE_TOKEN_ENDPOINT,
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
        payload.setdefault("refresh_token", refresh_token)
        if "scope" not in payload:
            payload["scope"] = " ".join(oauth.get("scopes") or GOOGLE_OAUTH_SCOPES)
        _store_google_oauth_tokens(user_doc, payload)
        return str(payload.get("access_token") or ""), ""
    except Exception:
        return "", "Google Drive access expired. Sign in with Google again."


def _drive_headers(access_token: str) -> dict:
    return {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }


def _drive_file_metadata(file_id: str, access_token: str) -> tuple[dict, str]:
    clean_file_id = str(file_id or "").strip()
    if not clean_file_id:
        return {}, "Drive file id is required."
    try:
        response = requests.get(
            f"{GOOGLE_DRIVE_FILES_ENDPOINT}/{clean_file_id}",
            params={
                "fields": "id,name,mimeType,webViewLink,iconLink",
                "supportsAllDrives": "true",
            },
            headers=_drive_headers(access_token),
            timeout=10,
        )
        response.raise_for_status()
        return response.json(), ""
    except Exception:
        return {}, "Could not read the selected Google Drive file. Reconnect Google Drive and try again."


def _editor_permission_emails(actor_doc: dict) -> list[str]:
    emails = set()
    cursor = users_col.find({"role": {"$in": [ROLE_EDITOR, ROLE_ADMIN]}, "workspaceId": _workspace_id_for_user(actor_doc)}, {"email": 1})
    for doc in cursor:
        email = normalize_email(doc.get("email") or "")
        if email:
            emails.add(email)
    return sorted(emails)


def _share_drive_attachment_with_editors(drive_attachment: dict, actor_doc: dict) -> tuple[bool, list[dict], str]:
    drive_attachment = drive_attachment if isinstance(drive_attachment, dict) else {}
    file_id = str(drive_attachment.get("fileId") or "").strip()
    if not file_id:
        return True, [], ""
    access_token, token_error = _google_access_token_for_user(actor_doc)
    if token_error:
        return False, [], token_error

    actor_email = normalize_email(actor_doc.get("email") or "")
    editor_emails = [email for email in _editor_permission_emails(actor_doc) if email and email != actor_email]
    if not editor_emails:
        return False, [], "No editor or admin Google accounts are available to share this file with."

    results = []
    for email in editor_emails:
        result = {
            "email": email,
            "role": "writer",
            "ok": False,
            "permissionId": "",
            "error": "",
            "attemptedAt": datetime.now(timezone.utc),
        }
        try:
            response = requests.post(
                f"{GOOGLE_DRIVE_FILES_ENDPOINT}/{file_id}/permissions",
                params={
                    "sendNotificationEmail": "false",
                    "supportsAllDrives": "true",
                },
                json={
                    "type": "user",
                    "role": "writer",
                    "emailAddress": email,
                },
                headers={
                    **_drive_headers(access_token),
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            if response.status_code in {200, 201}:
                payload = response.json()
                result["ok"] = True
                result["permissionId"] = str(payload.get("id") or "")
            elif response.status_code == 409:
                result["ok"] = True
                result["error"] = "Permission already exists."
            else:
                payload = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                result["error"] = payload.get("error", {}).get("message") or f"Google Drive returned {response.status_code}."
        except Exception as exc:
            result["error"] = str(exc) or "Google Drive permission update failed."
        results.append(result)

    ok = all(item.get("ok") for item in results)
    message = "" if ok else "Could not share the attached Drive file with every editor/admin."
    return ok, results, message


def _share_drive_file_with_editors(story: dict, actor_doc: dict) -> tuple[bool, list[dict], str]:
    drive_attachment = story.get("driveAttachment") if isinstance(story.get("driveAttachment"), dict) else {}
    return _share_drive_attachment_with_editors(drive_attachment, actor_doc)


def _sanitize_frontend_origin(origin: str) -> str:
    candidate = _origin_from_url(origin)
    if not candidate:
        return ""
    trusted = _trusted_request_origins()
    if candidate.lower().rstrip("/") in trusted:
        return candidate.rstrip("/")
    return ""


def _origin_from_redirect_uri() -> str:
    return _sanitize_frontend_origin(_google_redirect_uri())


def _frontend_redirect_url(path: str, origin: str = "") -> str:
    target = _sanitize_next_url(path) or "/dashboard"
    frontend_origin = _sanitize_frontend_origin(origin) or _sanitize_frontend_origin(FRONTEND_ORIGIN)
    if frontend_origin:
        return f"{frontend_origin}{target}"
    return target


def _make_google_state(next_url: str, frontend_origin: str, intent: str = GOOGLE_INTENT_LOGIN) -> str:
    return _google_state_serializer().dumps({
        "nonce": secrets.token_urlsafe(16),
        "next": _sanitize_next_url(next_url),
        "frontendOrigin": _sanitize_frontend_origin(frontend_origin),
        "intent": _normalize_google_intent(intent),
    })


def _load_google_state(state: str) -> tuple[dict, str]:
    try:
        data = _google_state_serializer().loads(state, max_age=GOOGLE_STATE_MAX_AGE_SECONDS)
    except SignatureExpired:
        return {}, "Google sign-in expired. Please try again."
    except BadSignature:
        return {}, "Google sign-in could not be verified."
    if not isinstance(data, dict):
        return {}, "Google sign-in could not be verified."
    return data, ""


def _google_email_domain_allowed(email: str) -> bool:
    if not GOOGLE_ALLOWED_DOMAINS:
        return True
    domain = normalize_email(email).rsplit("@", 1)[-1]
    return domain in GOOGLE_ALLOWED_DOMAINS


def _google_error_redirect(message: str, frontend_origin: str = ""):
    login_path = f"/login?{urlencode({'auth': 'google', 'error': message})}"
    frontend_origin = _sanitize_frontend_origin(frontend_origin) or _sanitize_frontend_origin(FRONTEND_ORIGIN)
    if frontend_origin:
        return redirect(f"{frontend_origin}{login_path}")
    return redirect(login_path)


def upsert_google_user(profile: dict, allow_create: bool = True):
    email = normalize_email(profile.get("email") or "")
    google_id = str(profile.get("sub") or profile.get("googleId") or profile.get("googleSub") or "").strip()
    if not email or not google_id:
        raise ValueError("Google profile did not include a verified identity.")

    now_iso = _now_iso()
    first_name, last_name = _split_google_name(profile)
    update = {
        "email": email,
        "googleId": google_id,
        "googleSub": google_id,
        "googleEmailVerified": True,
        "googlePicture": str(profile.get("picture") or "").strip(),
        "lastLoginAt": now_iso,
    }
    if first_name:
        update["firstName"] = first_name
    if last_name:
        update["lastName"] = last_name

    user_by_google = find_user_by_google_id(google_id)
    if user_by_google:
        existing_email = normalize_email(user_by_google.get("email") or "")
        if existing_email and existing_email != email:
            email_owner = find_user_by_email(email)
            if email_owner and str(email_owner.get("_id")) != str(user_by_google.get("_id")):
                raise ValueError("This Google account is already linked to another user.")
        users_col.update_one({"_id": user_by_google["_id"]}, {"$set": {**update, "authProviders.google": True}})
        user_by_google.update(update)
        user_by_google["authProviders"] = {**(user_by_google.get("authProviders") or {}), "google": True}
        return user_by_google

    user_by_email = find_user_by_email(email)
    if user_by_email:
        existing_google_id = _google_id_from_doc(user_by_email)
        if existing_google_id and existing_google_id != google_id:
            raise ValueError("This email is already linked to a different Google account.")
        users_col.update_one({"_id": user_by_email["_id"]}, {"$set": {**update, "authProviders.google": True}})
        user_by_email.update(update)
        user_by_email["authProviders"] = {**(user_by_email.get("authProviders") or {}), "google": True}
        return user_by_email

    if not allow_create:
        raise ValueError("No Falcon account is registered for this Google email. Create an account first.")

    doc = {
        **update,
        "firstName": first_name,
        "lastName": last_name,
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
    if not user_doc:
        _record_auth_failure(email)
        return jsonify({"ok": False, "error": "No account is registered for this email. Create an account first."}), 404

    password_hash = user_doc.get("passwordHash", "") if user_doc else ""
    if not password_hash or not check_password_hash(password_hash, password):
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
        "workspace": _serialize_workspace(_workspace_for_user(user_doc)),
        "csrfToken": _ensure_csrf_token(),
    })


@app.post("/api/workspaces/join")
@require_auth
def api_join_workspace():
    user_doc = _current_user_doc()
    code = normalize_workspace_code(_request_payload().get("code"))
    if not code:
        return jsonify({"ok": False, "error": "Enter a workspace code."}), 400
    workspace = workspaces_col.find_one({"joinCode": code})
    if not workspace:
        return jsonify({"ok": False, "error": "That workspace code was not found."}), 404

    workspace_id = str(workspace.get("publicId") or workspace.get("_id"))
    current_workspace_id = _workspace_id_for_user(user_doc)
    if current_workspace_id:
        if current_workspace_id != workspace_id:
            return jsonify({"ok": False, "error": "You already belong to a different workspace."}), 409
        return jsonify({
            "ok": True,
            "alreadyMember": True,
            "user": _serialize_user(user_doc),
            "workspace": _serialize_workspace(workspace),
        })

    result = users_col.update_one({
        "_id": user_doc["_id"],
        "$or": [
            {"workspaceId": {"$exists": False}},
            {"workspaceId": None},
            {"workspaceId": ""},
        ],
    }, {"$set": {
        "workspaceId": workspace_id,
        "role": ROLE_GUEST,
        "joinedWorkspaceAt": _now_iso(),
        "updatedAt": _now_iso(),
    }})
    updated = users_col.find_one({"_id": user_doc["_id"]}) or user_doc
    if result.matched_count == 0 and _workspace_id_for_user(updated) != workspace_id:
        return jsonify({"ok": False, "error": "Your workspace membership changed. Refresh and try again."}), 409
    return jsonify({
        "ok": True,
        "alreadyMember": result.matched_count == 0,
        "user": _serialize_user(updated),
        "workspace": _serialize_workspace(workspace),
    })


@app.get("/api/workspace")
@require_auth
def api_workspace():
    workspace = _workspace_for_user(_current_user_doc())
    if not workspace:
        return jsonify({"ok": False, "error": "Workspace not found."}), 404
    return jsonify({"ok": True, "workspace": _serialize_workspace(workspace, include_join_code=True)})


@app.post("/api/auth/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/drive/picker-config")
@require_auth
def api_drive_picker_config():
    missing = _google_drive_config_missing()
    return jsonify({
        "ok": not missing,
        "enabled": not missing,
        "missing": missing,
        "apiKey": GOOGLE_PICKER_API_KEY if not missing else "",
        "appId": GOOGLE_PICKER_APP_ID if not missing else "",
        "clientId": GOOGLE_PICKER_CLIENT_ID if not missing else "",
        "scope": GOOGLE_DRIVE_SCOPE,
        "reauthUrl": _google_reauth_url(request.args.get("next") or request.path),
        "error": f"Google Drive picker is missing {', '.join(missing)}." if missing else "",
    })


@app.get("/api/drive/picker-token")
@require_auth
def api_drive_picker_token():
    user_doc = _current_user_doc()
    missing = _google_drive_config_missing()
    if missing:
        return jsonify({
            "ok": False,
            "error": f"Google Drive picker is missing {', '.join(missing)}.",
            "missing": missing,
        }), 503
    access_token, token_error = _google_access_token_for_user(user_doc)
    if token_error:
        return _google_oauth_error(token_error)
    oauth = user_doc.get("googleOAuth") if isinstance(user_doc.get("googleOAuth"), dict) else {}
    return jsonify({
        "ok": True,
        "accessToken": access_token,
        "expiresAt": _parse_oauth_expiry(oauth.get("expiresAt")).isoformat() if _parse_oauth_expiry(oauth.get("expiresAt")) else "",
        "scope": GOOGLE_DRIVE_SCOPE,
    })


@app.get("/api/auth/google/start")
def api_google_start():
    missing_config = _google_missing_config()
    if missing_config:
        return jsonify({
            "ok": False,
            "error": f"Google sign-in is missing {', '.join(missing_config)}.",
            "missing": missing_config,
        }), 503

    redirect_uri = _google_redirect_uri()
    frontend_origin = _origin_from_redirect_uri() or _sanitize_frontend_origin(request.args.get("origin") or "")
    intent = _normalize_google_intent(request.args.get("intent") or "")
    state = _make_google_state(request.args.get("next") or "", frontend_origin, intent)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": _google_scope_string(),
        "state": state,
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "select_account consent",
    }
    return jsonify({"ok": True, "authUrl": f"{GOOGLE_AUTH_ENDPOINT}?{urlencode(params)}"})


@app.get("/api/auth/google/callback")
def api_google_callback():
    state = (request.args.get("state") or "").strip()
    state_data, state_error = _load_google_state(state)
    frontend_origin = state_data.get("frontendOrigin", "") if state_data else _origin_from_redirect_uri()
    next_url = state_data.get("next", "") if state_data else ""
    intent = _normalize_google_intent(state_data.get("intent", "") if state_data else "")

    if request.args.get("error"):
        return _google_error_redirect("Google sign-in was cancelled.", frontend_origin)

    if state_error:
        return _google_error_redirect(state_error, frontend_origin)

    code = (request.args.get("code") or "").strip()
    if not code:
        return _google_error_redirect("Google did not return an authorization code.", frontend_origin)
    if not _is_google_configured():
        return _google_error_redirect("Google sign-in is not configured.", frontend_origin)

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
            return _google_error_redirect("Google did not return an access token.", frontend_origin)

        profile_response = requests.get(
            GOOGLE_USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        profile_response.raise_for_status()
        profile = profile_response.json()
    except Exception:
        return _google_error_redirect("Google sign-in failed. Please try again.", frontend_origin)

    email = normalize_email(profile.get("email") or "")
    if not email or not profile.get("email_verified"):
        return _google_error_redirect("Google account email is not verified.", frontend_origin)
    if not _google_email_domain_allowed(email):
        return _google_error_redirect("This Google account is not allowed for Falcon Newsroom.", frontend_origin)

    try:
        user_doc = upsert_google_user(profile, allow_create=intent == GOOGLE_INTENT_SIGNUP)
    except ValueError as exc:
        return _google_error_redirect(str(exc) or "Could not link this Google account.", frontend_origin)
    except DuplicateKeyError:
        existing = find_user_by_email(email)
        if not existing:
            return _google_error_redirect("Could not link this Google account.", frontend_origin)
        user_doc = existing
    except Exception:
        return _google_error_redirect("Could not create a Falcon account from Google.", frontend_origin)

    _store_google_oauth_tokens(user_doc, token_payload)
    _login_user_doc(user_doc, remember=False)
    _clear_auth_failures(email)
    return redirect(_frontend_redirect_url(
        next_url or "/dashboard",
        frontend_origin,
    ))


@app.get("/api/admin/users")
@require_roles(ROLE_ADMIN)
def api_admin_users():
    user_doc = _current_user_doc()
    docs = list(users_col.find(_workspace_query(user_doc)).sort([("role", ASCENDING), ("email", ASCENDING)]))
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
        return jsonify({"ok": False, "error": "Role must be admin, editor, writer, or guest."}), 400
    if str(current_user.get("_id")) == str(oid):
        return jsonify({"ok": False, "error": "You cannot change your own role while signed in."}), 400

    target = users_col.find_one({"_id": oid, "workspaceId": _workspace_id_for_user(current_user)})
    if not target:
        return jsonify({"ok": False, "error": "User not found."}), 404
    if normalize_role(target.get("role")) == ROLE_ADMIN and next_role != ROLE_ADMIN:
        admin_count = users_col.count_documents({"role": ROLE_ADMIN, "workspaceId": _workspace_id_for_user(current_user)})
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
        return jsonify({"ok": False, "error": "Stories are not available to guests."}), 403
    docs = list(stories_col.find(query).sort([("updatedAt", -1), ("_id", -1)]))
    return jsonify({"ok": True, "stories": [_story_to_api(doc) for doc in docs]})


@app.patch("/api/stories/<story_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_update_story(story_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404

    payload = _request_payload()
    role = _current_user_role(user_doc)
    update = {"updatedAt": _now_iso()}
    unset = {}
    push_attachment = None
    if "status" in payload:
        next_status = str(payload.get("status") or "").strip()
        if not next_status:
            return jsonify({"ok": False, "error": "Status is required."}), 400
        is_story_author = _story_primary_owned_by_user(story, user_doc) or _story_collaborator_for_user(story, user_doc) is not None
        author_can_submit = is_story_author and next_status == "Submitted"
        author_can_unsubmit = is_story_author and next_status == "Drafting" and str(story.get("status") or "") == "Submitted"
        if role == ROLE_WRITER:
            if not is_story_author:
                return jsonify({"ok": False, "error": "Only an accepted story author can submit or unsubmit this story."}), 403
            if not author_can_submit and not author_can_unsubmit:
                return jsonify({"ok": False, "error": "Writers can only submit or unsubmit stories they author."}), 403
        if role in {ROLE_ADMIN, ROLE_EDITOR}:
            editorial_workflow_action = next_status in {"Returned", "Ready for Publish"}
            if not editorial_workflow_action and not author_can_submit and not author_can_unsubmit:
                return jsonify({"ok": False, "error": "Editors and admins can return or approve newsroom stories, and submit or unsubmit stories they author."}), 403
        if role in {ROLE_ADMIN, ROLE_EDITOR} and next_status == "Returned" and str(story.get("status") or "") not in {"Submitted", "In Review", "Ready for Publish"}:
            return jsonify({"ok": False, "error": "Return to writer is only available after a story is submitted."}), 400
        if role in {ROLE_ADMIN, ROLE_EDITOR} and next_status == "Ready for Publish" and str(story.get("status") or "") not in {"Submitted", "In Review"}:
            return jsonify({"ok": False, "error": "Teacher approval is only available for submitted stories."}), 400
        if next_status == "Submitted":
            attachments = _story_attachments_to_api(story)
            if not attachments:
                return jsonify({"ok": False, "error": "Attach work before submitting this story."}), 400
        update["status"] = next_status
        if next_status == "Submitted":
            update["submittedAt"] = _now_iso()
        if next_status == "Returned":
            update["returnedAt"] = _now_iso()
    if any(field in payload for field in DUE_DATE_FIELDS):
        if role not in {ROLE_ADMIN, ROLE_EDITOR}:
            return jsonify({"ok": False, "error": "Only editors and admins can update story due dates."}), 403
        next_deadline = _first_text_value(*(payload.get(field) for field in DUE_DATE_FIELDS))
        if len(next_deadline) > 80:
            return jsonify({"ok": False, "error": "Due date is too long."}), 400
        update["deadline"] = next_deadline
        update["dueDate"] = next_deadline
    if "googleDocUrl" in payload or "documentUrl" in payload:
        if not _can_edit_story_content(story, user_doc):
            return jsonify({"ok": False, "error": "You can comment on this story, but cannot edit its attached work."}), 403
        next_url = str((payload.get("documentUrl") if "documentUrl" in payload else payload.get("googleDocUrl")) or "").strip()
        if next_url and not _is_valid_http_url(next_url):
            return jsonify({"ok": False, "error": "Enter a valid http or https link."}), 400
        if next_url:
            update["googleDocUrl"] = next_url
            update["attachmentType"] = "multiple"
            push_attachment = {
                "id": _new_attachment_id("link"),
                "type": "link",
                "provider": "manual-link",
                "name": "Story link",
                "url": next_url,
                "addedBy": _attachment_added_by(user_doc),
                "addedAt": datetime.now(timezone.utc),
                "permissionStatus": "manual",
            }
        else:
            update["googleDocUrl"] = ""
            update["attachmentType"] = ""
            unset.update({
                "attachments": "",
                "attachmentFileId": "",
                "attachmentName": "",
                "attachmentContentType": "",
                "attachmentSize": "",
                "attachmentUploadedAt": "",
                "driveAttachment": "",
            })
    if len(update) == 1 and not unset and not push_attachment:
        return jsonify({"ok": False, "error": "No editable fields provided."}), 400

    previous_file_id = story.get("attachmentFileId")
    operation = {"$set": update}
    if unset:
        operation["$unset"] = unset
    if push_attachment:
        operation["$set"]["attachments"] = _merged_attachment_items(story, push_attachment)
    stories_col.update_one({"_id": story["_id"]}, operation)
    if unset and previous_file_id:
        _delete_story_file(previous_file_id)
    if "status" in update and update["status"] != story.get("status"):
        _record_status_activity("story", _doc_public_id(story, "storyId"), story.get("status", ""), update["status"], user_doc)
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "story": _story_to_api(updated)})


VALID_STORY_COLLABORATOR_ROLES = {"comment", "edit"}


def _story_collaborator_payload(item: dict, role: str, message: str, actor_doc: dict) -> dict:
    email = normalize_email(item.get("email") or "")
    return {
        "userId": str(item.get("userId") or item.get("id") or ""),
        "email": email,
        "name": str(item.get("name") or email).strip(),
        "role": "edit",
        "status": "pending",
        "message": message,
        "invitedBy": _user_display_name(actor_doc),
        "invitedByEmail": normalize_email(actor_doc.get("email") or ""),
        "invitedAt": datetime.now(timezone.utc),
    }


def _approval_invite_emails(raw_value) -> list[str]:
    if isinstance(raw_value, str):
        candidates = re.split(r"[,;\s]+", raw_value)
    elif isinstance(raw_value, list):
        candidates = raw_value
    else:
        candidates = []
    emails = []
    for value in candidates:
        email = normalize_email(str(value or ""))
        if email and email not in emails:
            emails.append(email)
    return emails


def _add_approval_collaborators(story: dict, emails: list[str], message: str, actor_doc: dict) -> str:
    if not emails:
        return ""
    invalid = [email for email in emails if not is_valid_email(email)]
    if invalid:
        return f"Invite skipped. Enter valid email addresses: {', '.join(invalid)}."

    actor_email = normalize_email(actor_doc.get("email") or "")
    primary_emails = {normalize_email(story.get("writerEmail") or ""), normalize_email(story.get("ownerEmail") or "")}
    current_collaborators = _story_collaborators(story)
    collaborator_by_email = {item["email"]: item for item in current_collaborators}
    invited = []
    skipped = []
    for email in emails:
        if email == actor_email or email in primary_emails or email in collaborator_by_email:
            skipped.append(email)
            continue
        invited_user = find_user_by_email(email)
        if not invited_user or _workspace_id_for_user(invited_user) != _workspace_id_for_user(actor_doc):
            skipped.append(email)
            continue
        invited_role = _current_user_role(invited_user)
        if invited_role != ROLE_WRITER:
            skipped.append(email)
            continue
        collaborator = _story_collaborator_payload(_serialize_user(invited_user), "comment", message, actor_doc)
        collaborator_by_email[email] = collaborator
        invited.append(collaborator)

    if invited:
        next_collaborators = sorted(collaborator_by_email.values(), key=lambda item: item.get("email", ""))
        stories_col.update_one({"_id": story["_id"]}, {"$set": {"collaborators": next_collaborators, "updatedAt": _now_iso()}})
        activity_col.insert_one({
            "workspaceId": _workspace_id_for_user(actor_doc),
            "entityType": "story",
            "entityId": _doc_public_id(story, "storyId"),
            "eventType": "collaborator_invite",
            "text": f"Invited {len(invited)} collaborator{'s' if len(invited) != 1 else ''} from pitch approval.",
            "actorId": str(actor_doc.get("_id")),
            "actorEmail": actor_doc.get("email", ""),
            "actorName": _user_display_name(actor_doc),
            "createdAt": datetime.now(timezone.utc),
        })
    if skipped:
        return f"Approved, but {len(skipped)} invite{'s were' if len(skipped) != 1 else ' was'} skipped."
    return ""
@app.post("/api/stories/<story_id>/collaborators")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_invite_story_collaborators(story_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404
    if not _can_manage_story_collaborators(story, user_doc):
        return jsonify({"ok": False, "error": "Only story authors or editors can invite co-authors."}), 403

    payload = _request_payload()
    raw_emails = payload.get("emails")
    if isinstance(raw_emails, str):
        candidates = re.split(r"[,;\s]+", raw_emails)
    elif isinstance(raw_emails, list):
        candidates = raw_emails
    else:
        candidates = []
    emails = []
    for value in candidates:
        email = normalize_email(str(value or ""))
        if email and email not in emails:
            emails.append(email)
    if not emails:
        return jsonify({"ok": False, "error": "Enter at least one email address."}), 400
    invalid = [email for email in emails if not is_valid_email(email)]
    if invalid:
        return jsonify({"ok": False, "error": f"Enter valid email addresses: {', '.join(invalid)}."}), 400

    role = "edit"
    message = str(payload.get("message") or "").strip()
    if len(message) > 200:
        return jsonify({"ok": False, "error": "Invite message must be 200 characters or fewer."}), 400

    actor_email = normalize_email(user_doc.get("email") or "")
    primary_emails = {normalize_email(story.get("writerEmail") or ""), normalize_email(story.get("ownerEmail") or "")}
    current_collaborators = _story_collaborators(story)
    collaborator_by_email = {item["email"]: item for item in current_collaborators}
    invited = []
    skipped = []
    for email in emails:
        if email == actor_email or email in primary_emails:
            skipped.append(email)
            continue
        existing_collaborator = collaborator_by_email.get(email)
        if existing_collaborator and existing_collaborator.get("status") in {"pending", "accepted"}:
            skipped.append(email)
            continue
        invited_user = find_user_by_email(email)
        if not invited_user or _workspace_id_for_user(invited_user) != _workspace_id_for_user(user_doc):
            return jsonify({"ok": False, "error": f"No account in this workspace is registered for {email}."}), 404
        invited_role = _current_user_role(invited_user)
        if invited_role in {ROLE_ADMIN, ROLE_EDITOR}:
            skipped.append(email)
            continue
        if invited_role != ROLE_WRITER:
            return jsonify({"ok": False, "error": f"{email} must have writer access before they can collaborate on stories."}), 400
        collaborator = _story_collaborator_payload(_serialize_user(invited_user), role, message, user_doc)
        collaborator_by_email[email] = collaborator
        invited.append(collaborator)

    if not invited and skipped:
        return jsonify({"ok": False, "error": "Those users already have access or a pending invitation."}), 400
    if not invited:
        return jsonify({"ok": False, "error": "No collaborators were added."}), 400

    next_collaborators = sorted(collaborator_by_email.values(), key=lambda item: item.get("email", ""))
    stories_col.update_one({"_id": story["_id"]}, {"$set": {"collaborators": next_collaborators, "updatedAt": _now_iso()}})
    activity_col.insert_one({
        "workspaceId": _workspace_id_for_user(user_doc),
        "entityType": "story",
        "entityId": _doc_public_id(story, "storyId"),
        "eventType": "collaborator_invite",
        "text": f"Invited {len(invited)} author{'s' if len(invited) != 1 else ''}.",
        "recipientEmails": [item.get("email") for item in invited],
        "entityTitle": story.get("title") or story.get("storyTitle") or "Untitled story",
        "actorId": str(user_doc.get("_id")),
        "actorEmail": user_doc.get("email", ""),
        "actorName": _user_display_name(user_doc),
        "createdAt": datetime.now(timezone.utc),
    })
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "story": _story_to_api(updated), "collaborators": _story_collaborators(updated)})


@app.delete("/api/stories/<story_id>/collaborators/<path:email>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_remove_story_collaborator(story_id: str, email: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404
    if not _can_manage_story_collaborators(story, user_doc):
        return jsonify({"ok": False, "error": "Only story authors or editors can remove co-authors."}), 403
    target_email = normalize_email(email)
    if not is_valid_email(target_email):
        return jsonify({"ok": False, "error": "Choose a valid collaborator email."}), 400
    current_collaborators = _story_collaborators(story)
    next_collaborators = [item for item in current_collaborators if item.get("email") != target_email]
    if len(next_collaborators) == len(current_collaborators):
        return jsonify({"ok": False, "error": "Collaborator not found."}), 404
    stories_col.update_one({"_id": story["_id"]}, {"$set": {"collaborators": next_collaborators, "updatedAt": _now_iso()}})
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "story": _story_to_api(updated), "collaborators": _story_collaborators(updated)})

@app.post("/api/stories/<story_id>/drive-attachment")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_attach_drive_file(story_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404

    if not _can_edit_story_content(story, user_doc):
        return jsonify({"ok": False, "error": "You can comment on this story, but cannot edit its attached work."}), 403

    payload = _request_payload()
    file_id = str(payload.get("fileId") or payload.get("id") or "").strip()
    access_token, token_error = _google_access_token_for_user(user_doc)
    if token_error:
        return _google_oauth_error(token_error)
    metadata, metadata_error = _drive_file_metadata(file_id, access_token)
    if metadata_error:
        return jsonify({"ok": False, "error": metadata_error}), 400

    now = datetime.now(timezone.utc)
    drive_attachment = {
        "id": _new_attachment_id("drive"),
        "type": "drive",
        "fileId": metadata.get("id") or file_id,
        "name": metadata.get("name") or payload.get("name") or "Drive file",
        "mimeType": metadata.get("mimeType") or payload.get("mimeType") or "",
        "typeLabel": _drive_type_label(metadata.get("mimeType") or payload.get("mimeType"), metadata.get("name") or payload.get("name")),
        "webViewLink": metadata.get("webViewLink") or payload.get("url") or payload.get("webViewLink") or "",
        "iconLink": metadata.get("iconLink") or payload.get("iconUrl") or "",
        "addedBy": _attachment_added_by(user_doc),
        "addedAt": now,
        "permissionStatus": "not_shared",
        "shareResults": [],
        "lastShareAttemptAt": None,
    }
    update = {
        "updatedAt": _now_iso(),
        "attachmentType": "multiple",
        "attachmentName": drive_attachment["name"],
        "googleDocUrl": drive_attachment["webViewLink"],
    }
    unset = {
        "attachmentFileId": "",
        "attachmentContentType": "",
        "attachmentSize": "",
        "attachmentUploadedAt": "",
        "docUrl": "",
        "driveAttachment": "",
    }
    stories_col.update_one(
        {"_id": story["_id"]},
        {"$set": {**update, "attachments": _merged_attachment_items(story, drive_attachment)}, "$unset": unset},
    )
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({
        "ok": True,
        "story": _story_to_api(updated),
        "warning": "",
        "shareResults": [],
    })


@app.post("/api/stories/<story_id>/attachment")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_upload_story_attachment(story_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404
    if not _can_edit_story_content(story, user_doc):
        return jsonify({"ok": False, "error": "You can comment on this story, but cannot edit its attached work."}), 403

    uploaded = request.files.get("file")
    if not uploaded or not uploaded.filename:
        return jsonify({"ok": False, "error": "Choose a file to upload."}), 400

    data = uploaded.read(MAX_STORY_ATTACHMENT_BYTES + 1)
    if len(data) > MAX_STORY_ATTACHMENT_BYTES:
        return jsonify({"ok": False, "error": "Story files must be 10 MB or smaller."}), 413
    if not data:
        return jsonify({"ok": False, "error": "Choose a non-empty file."}), 400

    filename = secure_filename(uploaded.filename) or "story-upload"
    content_type = uploaded.content_type or "application/octet-stream"
    now = datetime.now(timezone.utc)
    attachment_id = _new_attachment_id("file")
    file_id = story_files.put(
        data,
        filename=filename,
        contentType=content_type,
        metadata={
            "storyId": _doc_public_id(story, "storyId"),
            "attachmentId": attachment_id,
            "uploadedBy": str(user_doc.get("_id")),
            "uploadedByEmail": user_doc.get("email", ""),
        },
    )
    attachment = {
        "id": attachment_id,
        "type": "file",
        "fileId": str(file_id),
        "name": filename,
        "contentType": content_type,
        "size": len(data),
        "uploadedAt": now,
        "addedBy": _attachment_added_by(user_doc),
        "permissionStatus": "app_access",
    }
    update = {
        "updatedAt": _now_iso(),
        "attachmentType": "multiple",
        "attachmentName": filename,
        "googleDocUrl": "",
    }
    stories_col.update_one(
        {"_id": story["_id"]},
        {"$set": {**update, "attachments": _merged_attachment_items(story, attachment)}, "$unset": {"docUrl": "", "driveAttachment": ""}},
    )
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "story": _story_to_api(updated)})


def _find_attachment_item(story: dict, attachment_id: str) -> dict | None:
    target = str(attachment_id or "").strip()
    if not target:
        return None
    items = story.get("attachments") if isinstance(story.get("attachments"), list) else []
    for item in items:
        if isinstance(item, dict) and target in _attachment_identifiers(item):
            return item
    for item in _legacy_story_attachment_items(story):
        if target in _attachment_identifiers(item):
            return item
    return None


@app.get("/api/stories/<story_id>/attachments/<attachment_id>")
@require_auth
def api_download_story_attachment_by_id(story_id: str, attachment_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404
    attachment = _find_attachment_item(story, attachment_id)
    if not attachment or attachment.get("type") != "file":
        return jsonify({"ok": False, "error": "Story file not found."}), 404
    file_id = _object_id_or_none(str(attachment.get("fileId") or attachment.get("attachmentFileId") or ""))
    if not file_id:
        return jsonify({"ok": False, "error": "Story file not found."}), 404
    try:
        stored = story_files.get(file_id)
    except Exception:
        return jsonify({"ok": False, "error": "Story file not found."}), 404

    filename = str(attachment.get("name") or getattr(stored, "filename", "") or "story-file").strip()
    content_type = str(attachment.get("contentType") or getattr(stored, "content_type", "") or "application/octet-stream").strip()
    return send_file(
        BytesIO(stored.read()),
        mimetype=content_type,
        as_attachment=True,
        download_name=filename,
    )


@app.delete("/api/stories/<story_id>/attachments/<attachment_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_delete_story_attachment(story_id: str, attachment_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404
    if not _can_edit_story_content(story, user_doc):
        return jsonify({"ok": False, "error": "You can comment on this story, but cannot edit its attached work."}), 403
    attachment = _find_attachment_item(story, attachment_id)
    if not attachment:
        return jsonify({"ok": False, "error": "Attachment not found."}), 404
    if attachment.get("type") == "file":
        _delete_story_file(attachment.get("fileId") or attachment.get("attachmentFileId"))
    unset = {}
    set_values = {"updatedAt": _now_iso()}
    if attachment.get("type") == "file" and attachment_id == "legacy-file":
        unset.update({
            "attachmentFileId": "",
            "attachmentName": "",
            "attachmentContentType": "",
            "attachmentSize": "",
            "attachmentUploadedAt": "",
        })
    if attachment.get("type") == "link":
        set_values["googleDocUrl"] = ""
        unset["docUrl"] = ""
    if attachment.get("type") == "drive":
        attachment_url = str(attachment.get("webViewLink") or attachment.get("url") or "")
        if str(story.get("googleDocUrl") or "") == attachment_url:
            set_values["googleDocUrl"] = ""
        unset["driveAttachment"] = ""
    operation = {
        "$pull": {"attachments": _attachment_pull_condition(attachment_id)},
        "$set": set_values,
    }
    if unset:
        operation["$unset"] = unset
    stories_col.update_one(
        {"_id": story["_id"]},
        operation,
    )
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "story": _story_to_api(updated)})


@app.get("/api/stories/<story_id>/attachment")
@require_auth
def api_download_story_attachment(story_id: str):
    user_doc = _current_user_doc()
    story = _find_owned_story_or_404(story_id, user_doc)
    if not story:
        return jsonify({"ok": False, "error": "Story not found."}), 404

    file_id = _object_id_or_none(str(story.get("attachmentFileId") or ""))
    if not file_id:
        return jsonify({"ok": False, "error": "Story file not found."}), 404
    try:
        stored = story_files.get(file_id)
    except Exception:
        return jsonify({"ok": False, "error": "Story file not found."}), 404

    filename = str(story.get("attachmentName") or getattr(stored, "filename", "") or "story-file").strip()
    content_type = str(story.get("attachmentContentType") or getattr(stored, "content_type", "") or "application/octet-stream").strip()
    return send_file(
        BytesIO(stored.read()),
        mimetype=content_type,
        as_attachment=True,
        download_name=filename,
    )


@app.get("/api/pitches")
@require_auth
def api_pitches():
    user_doc = _current_user_doc()
    query = _pitch_query_for_user(user_doc)
    if query is None:
        return jsonify({"ok": False, "error": "Pitch board is not available to guests."}), 403
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
        "workspaceId": _workspace_id_for_user(user_doc),
        "title": title,
        "angle": str(payload.get("angle") or "").strip(),
        "status": "In Progress",
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
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
def api_update_pitch(pitch_id: str):
    user_doc = _current_user_doc()
    pitch = _find_owned_pitch_or_404(pitch_id, user_doc)
    if not pitch:
        return jsonify({"ok": False, "error": "Pitch not found."}), 404

    payload = _request_payload()
    approval_deadline = _first_text_value(*(payload.get(field) for field in DUE_DATE_FIELDS))
    approval_message = str(payload.get("approvalMessage") or payload.get("message") or "").strip()
    invite_emails = _approval_invite_emails(payload.get("inviteEmails") or payload.get("invites") or payload.get("emails"))
    if len(approval_deadline) > 80:
        return jsonify({"ok": False, "error": "Due date is too long."}), 400
    if len(approval_message) > 200:
        return jsonify({"ok": False, "error": "Approval message must be 200 characters or fewer."}), 400
    update = {"updatedAt": _now_iso()}
    next_status = ""
    if "status" in payload:
        next_status = _normalize_pitch_status(payload.get("status"))
        if next_status not in {"In Progress", "Ready for Review", "Approved", "On Hold"}:
            return jsonify({"ok": False, "error": "Choose a valid pitch status."}), 400
        if _current_user_role(user_doc) == ROLE_WRITER:
            if not _pitch_owned_by_user(pitch, user_doc):
                return jsonify({"ok": False, "error": "Only the pitch owner can submit it for review."}), 403
            if next_status != "Ready for Review":
                return jsonify({"ok": False, "error": "Writers can only submit their own pitch for review."}), 403
            if _normalize_pitch_status(pitch.get("status")) not in {"In Progress", "Ready for Review"}:
                return jsonify({"ok": False, "error": "This pitch can no longer be submitted for review."}), 409
        update["status"] = next_status
    if next_status == "Approved":
        if not approval_deadline:
            return jsonify({"ok": False, "error": "Due date is required before approving a pitch."}), 400
        update["deadline"] = approval_deadline
        update["dueDate"] = approval_deadline
    if len(update) == 1:
        return jsonify({"ok": False, "error": "No editable fields provided."}), 400

    pitches_col.update_one({"_id": pitch["_id"]}, {"$set": update})
    if "status" in update and update["status"] != pitch.get("status"):
        _record_status_activity("pitch", _doc_public_id(pitch, "pitchId"), pitch.get("status", ""), update["status"], user_doc)
    updated = pitches_col.find_one({"_id": pitch["_id"]}) or {}
    payload = {"ok": True, "pitch": _pitch_to_api(updated)}
    if update.get("status") == "Approved":
        story_doc = _create_story_from_pitch(updated, user_doc, approval_deadline, approval_message)
        invite_warning = _add_approval_collaborators(story_doc, invite_emails, approval_message, user_doc)
        story_doc = stories_col.find_one({"_id": story_doc["_id"]}) or story_doc
        payload["story"] = _story_to_api(story_doc)
        if invite_warning:
            payload["warning"] = invite_warning
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
            "workspaceId": _workspace_id_for_user(user_doc),
            "entityType": entity_type,
            "entityId": entity_id,
        }).sort([("createdAt", -1), ("_id", -1)]).limit(100)
    )
    return jsonify({"ok": True, "feedback": [_feedback_to_api(doc) for doc in docs]})


@app.post("/api/feedback")
@require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)
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
        "workspaceId": _workspace_id_for_user(user_doc),
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
    doc = feedback_col.find_one({"_id": oid, "workspaceId": _workspace_id_for_user(user_doc)})
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
    updated = feedback_col.find_one({"_id": oid, "workspaceId": _workspace_id_for_user(user_doc)}) or {}
    return jsonify({"ok": True, "feedback": _feedback_to_api(updated)})


@app.delete("/api/feedback/<feedback_id>")
@require_roles(ROLE_ADMIN, ROLE_EDITOR)
def api_delete_feedback(feedback_id: str):
    user_doc = _current_user_doc()
    oid = _object_id_or_none(feedback_id)
    if not oid:
        return jsonify({"ok": False, "error": "Invalid feedback id."}), 400
    doc = feedback_col.find_one({"_id": oid, "workspaceId": _workspace_id_for_user(user_doc)})
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
            "workspaceId": _workspace_id_for_user(user_doc),
            "entityType": entity_type,
            "entityId": entity_id,
            "eventType": {"$in": sorted(IMPORTANT_ACTIVITY_EVENTS)},
        }).sort([("createdAt", -1), ("_id", -1)]).limit(50)
    )
    return jsonify({"ok": True, "activity": [_activity_to_api(doc) for doc in docs]})


def _pending_story_invitations(user_doc: dict) -> list[tuple[dict, dict]]:
    email = normalize_email(user_doc.get("email") or "")
    user_id = str(user_doc.get("_id") or "")
    if not email and not user_id:
        return []
    query = {"workspaceId": _workspace_id_for_user(user_doc), "collaborators": {"$elemMatch": {
        "status": "pending",
        "$or": [{"email": email}, {"userId": user_id}],
    }}}
    invitations = []
    for story in stories_col.find(query).sort([("updatedAt", -1), ("_id", -1)]):
        for invite in _story_collaborators(story):
            if invite.get("status") != "pending":
                continue
            if normalize_email(invite.get("email") or "") == email or str(invite.get("userId") or "") == user_id:
                invitations.append((story, invite))
                break
    return invitations


def _dashboard_entity_maps(user_doc: dict, personal_only: bool = False) -> tuple[dict[str, str], dict[str, str]]:
    if personal_only:
        story_query = _scoped_query(user_doc, {"$or": _owned_story_query(user_doc)["$or"] + [_collaborator_story_query(user_doc)]})
        pitch_query = _scoped_query(user_doc, _owned_pitch_query(user_doc))
    else:
        story_query = _story_query_for_user(user_doc)
        pitch_query = _pitch_query_for_user(user_doc)
    story_titles = {}
    pitch_titles = {}
    if story_query is not None:
        for doc in stories_col.find(story_query, {"_id": 1, "id": 1, "storyId": 1, "title": 1, "storyTitle": 1}):
            story_titles[_doc_public_id(doc, "storyId")] = doc.get("title") or doc.get("storyTitle") or "Untitled story"
    if pitch_query is not None:
        for doc in pitches_col.find(pitch_query, {"_id": 1, "id": 1, "pitchId": 1, "title": 1}):
            pitch_titles[_doc_public_id(doc, "pitchId")] = doc.get("title") or "Untitled pitch"
    return story_titles, pitch_titles

def _dashboard_event_datetime(value) -> datetime | None:
    if isinstance(value, datetime):
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        parsed = None
        for fmt in ("%B %d, %Y", "%b %d, %Y", "%Y-%m-%d"):
            try:
                parsed = datetime.strptime(raw, fmt)
                break
            except ValueError:
                continue
    if parsed is None:
        return None
    return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)


def _activity_actor_is_user(doc: dict, user_doc: dict) -> bool:
    actor_id = str(doc.get("actorId") or "").lower()
    actor_email = normalize_email(doc.get("actorEmail") or "")
    user_ids = {str(value).lower() for value in _owner_match_values(user_doc) if value}
    return bool((actor_id and actor_id in user_ids) or (actor_email and actor_email in user_ids))


def _dashboard_status_activity_relevant(doc: dict, role: str, personal_story_ids: set[str], personal_pitch_ids: set[str]) -> bool:
    if doc.get("eventType") != "status_change":
        return False
    entity_type = str(doc.get("entityType") or "")
    entity_id = str(doc.get("entityId") or "")
    to_status = str(doc.get("toStatus") or "")
    if entity_type == "pitch":
        to_status = _normalize_pitch_status(to_status)
        if entity_id in personal_pitch_ids:
            return to_status in {"In Progress", "Approved", "On Hold"}
        return role in {ROLE_EDITOR, ROLE_ADMIN} and to_status == "Ready for Review"
    if entity_type == "story":
        if entity_id in personal_story_ids:
            return to_status in {"Assigned", "Needs Revision", "Returned", "Ready for Publish", "Published"}
        return role in {ROLE_EDITOR, ROLE_ADMIN} and to_status == "Submitted"
    return False


def _dashboard_status_activity_text(doc: dict) -> str:
    actor = str(doc.get("actorName") or "A newsroom teammate")
    entity_type = str(doc.get("entityType") or "")
    to_status = str(doc.get("toStatus") or "")
    if entity_type == "pitch":
        to_status = _normalize_pitch_status(to_status)
        messages = {
            "Ready for Review": f"{actor} submitted this pitch for review.",
            "In Progress": f"{actor} requested more work before this pitch can move forward.",
            "Approved": f"{actor} approved this pitch and moved it to Stories.",
            "On Hold": f"{actor} placed this pitch on hold.",
        }
        return messages.get(to_status, str(doc.get("text") or "Pitch updated."))
    messages = {
        "Submitted": f"{actor} submitted this story for review.",
        "Assigned": f"{actor} assigned this story.",
        "Needs Revision": f"{actor} requested story revisions.",
        "Returned": f"{actor} returned this story for revisions.",
        "Ready for Publish": f"{actor} moved this story to teacher approval.",
        "Published": f"{actor} marked this story published.",
    }
    return messages.get(to_status, str(doc.get("text") or "Story updated."))

@app.get("/api/dashboard")
@require_auth
def api_dashboard():
    user_doc = _current_user_doc()
    role = _current_user_role(user_doc)
    user_email = normalize_email(user_doc.get("email") or "")
    tasks = []

    pending_invitations = _pending_story_invitations(user_doc) if role == ROLE_WRITER else []
    for story, invite in pending_invitations:
        story_id = _doc_public_id(story, "storyId")
        tasks.append({
            "id": f"invite:{story_id}", "kind": "invitation", "title": story.get("title") or story.get("storyTitle") or "Untitled story",
            "detail": f"{invite.get('invitedBy') or 'A newsroom teammate'} invited you to join as a co-author.",
            "time": invite.get("invitedAt") or "", "priority": "high", "entityType": "story", "entityId": story_id,
            "actions": ["accept", "decline"],
        })

    if role in {ROLE_EDITOR, ROLE_ADMIN}:
        for pitch in pitches_col.find(_scoped_query(user_doc, {"status": {"$in": ["Ready for Review", "Submitted", "Needs Review"]}})).sort([("updatedAt", -1), ("_id", -1)]).limit(20):
            if _pitch_owned_by_user(pitch, user_doc):
                continue
            tasks.append({"id": f"pitch:{_doc_public_id(pitch, 'pitchId')}", "kind": "pitch_review", "title": pitch.get("title") or "Untitled pitch", "detail": f"Pitch from {pitch.get('owner') or pitch.get('writer') or pitch.get('ownerEmail') or 'a writer'} needs review.", "time": _date_for_api(pitch.get("updatedAt") or pitch.get("submittedAt") or pitch.get("createdAt")), "priority": "normal", "entityType": "pitch", "entityId": _doc_public_id(pitch, "pitchId")})
        for story in stories_col.find(_scoped_query(user_doc, {"status": {"$in": ["Submitted", "In Review"]}})).sort([("updatedAt", -1), ("_id", -1)]).limit(20):
            if _story_primary_owned_by_user(story, user_doc):
                continue
            tasks.append({"id": f"story:{_doc_public_id(story, 'storyId')}", "kind": "story_review", "title": story.get("title") or story.get("storyTitle") or "Untitled story", "detail": f"{story.get('writer') or story.get('writerEmail') or 'A writer'} submitted this story for review.", "time": _date_for_api(story.get("submittedAt") or story.get("updatedAt")), "priority": "high" if story.get("dueSoon") else "normal", "entityType": "story", "entityId": _doc_public_id(story, "storyId")})
    elif role == ROLE_WRITER:
        for pitch in pitches_col.find(_scoped_query(user_doc, {"$and": [_owned_pitch_query(user_doc), {"status": {"$in": ["In Progress", "New"]}}]})).sort([("updatedAt", -1), ("_id", -1)]).limit(20):
            tasks.append({"id": f"pitch:{_doc_public_id(pitch, 'pitchId')}", "kind": "pitch_work", "title": pitch.get("title") or "Untitled pitch", "detail": "Continue refining this pitch, then submit it when it is ready for editor review.", "time": _date_for_api(pitch.get("updatedAt") or pitch.get("createdAt")), "priority": "normal", "entityType": "pitch", "entityId": _doc_public_id(pitch, "pitchId")})
        writer_story_query = _story_query_for_user(user_doc)
        for story in stories_col.find(writer_story_query).sort([("updatedAt", -1), ("_id", -1)]).limit(30):
            status = str(story.get("status") or "Assigned")
            if status in {"Published", "Ready for Publish", "Submitted", "In Review"}:
                continue
            detail = "Revisions were requested. Review the editor notes and resubmit." if status in {"Returned", "Needs Revision"} else "Continue reporting and attach your work before the deadline."
            tasks.append({"id": f"story:{_doc_public_id(story, 'storyId')}", "kind": "revision" if status in {"Returned", "Needs Revision"} else "story_work", "title": story.get("title") or story.get("storyTitle") or "Untitled story", "detail": detail, "time": _date_for_api(story.get("updatedAt") or story.get("createdAt")), "dueDate": _story_deadline(story), "priority": "high" if status in {"Returned", "Needs Revision"} or story.get("dueSoon") else "normal", "entityType": "story", "entityId": _doc_public_id(story, "storyId")})

    story_titles, pitch_titles = _dashboard_entity_maps(user_doc)
    personal_story_titles, personal_pitch_titles = _dashboard_entity_maps(user_doc, personal_only=True)
    personal_story_ids = set(personal_story_titles)
    personal_pitch_ids = set(personal_pitch_titles)
    entity_clauses = []
    if story_titles:
        entity_clauses.append({"entityType": "story", "entityId": {"$in": list(story_titles)}})
    if pitch_titles:
        entity_clauses.append({"entityType": "pitch", "entityId": {"$in": list(pitch_titles)}})
    personal_entity_clauses = []
    if personal_story_titles:
        personal_entity_clauses.append({"entityType": "story", "entityId": {"$in": list(personal_story_titles)}})
    if personal_pitch_titles:
        personal_entity_clauses.append({"entityType": "pitch", "entityId": {"$in": list(personal_pitch_titles)}})

    if role in {ROLE_EDITOR, ROLE_ADMIN}:
        activity_query = {"entityType": {"$in": ["story", "pitch"]}}
    elif entity_clauses:
        activity_query = {"$or": entity_clauses}
    else:
        activity_query = {"_id": None}

    activities = []
    activity_cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    for doc in activity_col.find(_scoped_query(user_doc, activity_query)).sort([("createdAt", -1), ("_id", -1)]).limit(100):
        event_datetime = _dashboard_event_datetime(doc.get("createdAt"))
        if event_datetime is None or event_datetime < activity_cutoff:
            continue
        if _activity_actor_is_user(doc, user_doc):
            continue
        if not _dashboard_status_activity_relevant(doc, role, personal_story_ids, personal_pitch_ids):
            continue
        item = _activity_to_api(doc)
        item["text"] = _dashboard_status_activity_text(doc)
        item["title"] = doc.get("entityTitle") or (story_titles if item["entityType"] == "story" else pitch_titles).get(item["entityId"], "")
        item["kind"] = item.get("eventType") or "update"
        item["_sortAt"] = event_datetime.timestamp()
        activities.append(item)

    feedback_query = {"$or": personal_entity_clauses} if personal_entity_clauses else {"_id": None}
    for doc in feedback_col.find(_scoped_query(user_doc, feedback_query)).sort([("createdAt", -1), ("_id", -1)]).limit(30):
        if normalize_email(doc.get("authorEmail") or "") == user_email:
            continue
        event_datetime = _dashboard_event_datetime(doc.get("createdAt"))
        if event_datetime is None or event_datetime < activity_cutoff:
            continue
        entity_type = doc.get("entityType") or ""
        entity_id = doc.get("entityId") or ""
        activities.append({"id": f"feedback:{doc.get('_id')}", "entityType": entity_type, "entityId": entity_id, "eventType": "comment", "kind": "comment", "text": f"{doc.get('authorName') or doc.get('actorName') or 'A teammate'} commented: {doc.get('text') or ''}", "title": (story_titles if entity_type == "story" else pitch_titles).get(entity_id, ""), "time": _date_for_api(doc.get("createdAt")), "occurredAt": _datetime_for_api(doc.get("createdAt")), "actorName": doc.get("authorName") or doc.get("actorName") or "", "_sortAt": event_datetime.timestamp()})

    for story, invite in pending_invitations:
        event_datetime = _dashboard_event_datetime(invite.get("invitedAtIso") or invite.get("invitedAt"))
        if event_datetime is None or event_datetime < activity_cutoff:
            continue
        story_id = _doc_public_id(story, "storyId")
        activities.append({"id": f"invite:{story_id}", "entityType": "story", "entityId": story_id, "eventType": "invitation", "kind": "invitation", "text": f"{invite.get('invitedBy') or 'A newsroom teammate'} invited you to co-author this story.", "title": story.get("title") or story.get("storyTitle") or "Untitled story", "time": invite.get("invitedAt") or "", "occurredAt": invite.get("invitedAtIso") or "", "actions": ["accept", "decline"], "_sortAt": event_datetime.timestamp()})

    activities.sort(key=lambda item: item.get("_sortAt", 0), reverse=True)
    for item in activities:
        item.pop("_sortAt", None)
    return jsonify({"ok": True, "tasks": tasks[:40], "activity": activities[:60]})


@app.post("/api/story-invitations/<story_id>/<decision>")
@require_roles(ROLE_WRITER)
def api_respond_story_invitation(story_id: str, decision: str):
    if decision not in {"accept", "decline"}:
        return jsonify({"ok": False, "error": "Choose accept or decline."}), 400
    user_doc = _current_user_doc()
    email = normalize_email(user_doc.get("email") or "")
    clauses = [{"_id": _object_id_or_none(story_id)}, {"id": story_id}, {"storyId": story_id}]
    clauses = [clause for clause in clauses if list(clause.values())[0]]
    story = stories_col.find_one({"$and": [_workspace_query(user_doc), {"$or": clauses}, {"collaborators": {"$elemMatch": {"email": email, "status": "pending"}}}]})
    if not story:
        return jsonify({"ok": False, "error": "This invitation is no longer available."}), 404
    next_collaborators = []
    for collaborator in _story_collaborators(story):
        if collaborator.get("email") != email:
            next_collaborators.append(collaborator)
        elif decision == "accept":
            next_collaborators.append({**collaborator, "status": "accepted", "role": "edit", "respondedAt": _now_iso()})
    stories_col.update_one({"_id": story["_id"]}, {"$set": {"collaborators": next_collaborators, "updatedAt": _now_iso()}})
    activity_col.insert_one({"workspaceId": _workspace_id_for_user(user_doc), "entityType": "story", "entityId": _doc_public_id(story, "storyId"), "entityTitle": story.get("title") or story.get("storyTitle") or "Untitled story", "eventType": f"invitation_{'accepted' if decision == 'accept' else 'declined'}", "text": f"{_user_display_name(user_doc)} {'joined the story as a co-author' if decision == 'accept' else 'declined the co-author invitation'}.", "actorId": str(user_doc.get("_id")), "actorEmail": email, "actorName": _user_display_name(user_doc), "createdAt": datetime.now(timezone.utc)})
    updated = stories_col.find_one({"_id": story["_id"]}) or {}
    return jsonify({"ok": True, "decision": decision, "story": _story_to_api(updated) if decision == "accept" else None})


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

    query = _scoped_query(_current_user_doc(), query)
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
        cursor = interviews_col.find(_scoped_query(_current_user_doc(), {
            "$or": [
                {"url": {"$in": urls}},
                {"articleUrl": {"$in": urls}},
                {"article_url": {"$in": urls}},
            ]
        }))
        for person_doc in cursor:
            person = _interview_to_api(person_doc)
            people_by_url.setdefault(_article_join_url_key(person["url"]), []).append(person)

    section_values = {}

    def add_section_value(value):
        text = str(value or "").strip()
        if text and text.lower() != "all sections":
            section_values.setdefault(text.lower(), text)

    for doc in articles_col.find(_workspace_query(_current_user_doc()), {"section": 1, "category": 1, "tags": 1, "categories": 1}):
        for value in [doc.get("section"), doc.get("category")]:
            add_section_value(value)
        for field in ["tags", "categories"]:
            for value in _coerce_list_field(doc.get(field)):
                add_section_value(value)

    total_pages = max(1, (total + limit - 1) // limit)
    return jsonify({
        "ok": True,
        "articles": [_article_to_api(doc, people_by_url) for doc in docs],
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
        "sections": sorted(section_values.values(), key=lambda value: value.lower()),
    })


@app.get("/api/interview-records")
@require_auth
def api_interview_records():
    docs = list(interviews_col.find(_workspace_query(_current_user_doc())).sort([("_id", -1)]))
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

    result = interviews_col.update_one({"_id": oid, "workspaceId": _workspace_id_for_user(_current_user_doc())}, {"$set": update})
    if result.matched_count == 0:
        return jsonify({"ok": False, "error": "Record not found"}), 404

    doc = interviews_col.find_one({"_id": oid}) or {}
    return jsonify({"ok": True, "record": _interview_to_api(doc)})


@app.delete("/api/interview-records/<record_id>")
@require_role_at_least(ROLE_EDITOR)
def api_delete_interview_record(record_id: str):
    try:
        oid = ObjectId(record_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid record id"}), 400

    result = interviews_col.delete_one({"_id": oid, "workspaceId": _workspace_id_for_user(_current_user_doc())})
    if result.deleted_count == 0:
        return jsonify({"ok": False, "error": "Record not found"}), 404
    return jsonify({"ok": True})


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

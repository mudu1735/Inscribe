import os
from functools import wraps

from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime, date, timezone
from collections import defaultdict
from urllib.parse import urlparse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from extractor import extract_people_for_ui, get_article_data

# templates/ and static/ are located under the app/ folder.
app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-me")

# -------------------------
# Keys / config (hardcoded for now)
# -------------------------
GEMINI_API_KEY = "[REDACTED-GOOGLE-API-KEY]"

MONGO_URI = "mongodb+srv://[REDACTED-MONGODB-URI]"
MONGO_DB = "mudu1735"
INTERVIEW_COLLECTION = "interviewRecords"
ARTICLE_COLLECTION = "articleRecords"
USER_COLLECTION = "loginInfov2"
ALLOWED_ARTICLE_DOMAIN = "poolesvillepulse.org"
ROLE_VIEWER = "viewer"
ROLE_EDITOR = "editor"
ROLE_ADMIN = "admin"
VALID_ROLES = {ROLE_VIEWER, ROLE_EDITOR, ROLE_ADMIN}
ROLE_LABELS = {
    ROLE_VIEWER: "Viewer",
    ROLE_EDITOR: "Editor",
    ROLE_ADMIN: "Admin",
}
ROLE_RANK = {
    ROLE_VIEWER: 1,
    ROLE_EDITOR: 2,
    ROLE_ADMIN: 3,
}

mongo_client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
db = mongo_client[MONGO_DB]

try:
    db[USER_COLLECTION].create_index("email", unique=True)
except Exception:
    pass

try:
    db[USER_COLLECTION].update_many(
        {"$or": [{"role": {"$exists": False}}, {"role": None}]},
        {"$set": {"role": ROLE_VIEWER}},
    )
except Exception:
    pass

try:
    db[USER_COLLECTION].update_many(
        {"role": {"$nin": list(VALID_ROLES)}},
        {"$set": {"role": ROLE_VIEWER}},
    )
except Exception:
    pass

login_manager = LoginManager()
login_manager.login_view = "login_page"
login_manager.init_app(app)


class User(UserMixin):
    def __init__(self, doc: dict):
        self.id = str(doc.get("_id"))
        self.email = doc.get("email", "")
        self.first_name = doc.get("firstName", "")
        self.last_name = doc.get("lastName", "")
        self.role = normalize_role(doc.get("role"))


def normalize_role(role_value) -> str:
    role = str(role_value or "").strip().lower()
    if role not in VALID_ROLES:
        return ROLE_VIEWER
    return role


def role_label(role_value) -> str:
    return ROLE_LABELS.get(normalize_role(role_value), "Viewer")


def get_current_role() -> str:
    if current_user.is_authenticated:
        return normalize_role(getattr(current_user, "role", ROLE_VIEWER))
    return ROLE_VIEWER


def default_landing_for_role(role_value: str) -> str:
    if ROLE_RANK.get(normalize_role(role_value), 1) >= ROLE_RANK[ROLE_EDITOR]:
        return url_for("index")
    return url_for("records_page")


def _forbidden_response(message: str = "Forbidden"):
    if request.path.startswith("/api/"):
        return jsonify({"ok": False, "error": message}), 403
    # For non-API requests, redirect to login page with next param
    return redirect(url_for("login_page", next=request.path))


def require_any_role(allowed_roles: list[str]):
    normalized_allowed = {normalize_role(x) for x in allowed_roles}

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = get_current_role()
            if role not in normalized_allowed:
                return _forbidden_response()
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_role(role_name: str):
    return require_any_role([role_name])


def require_role_at_least(role_name: str):
    target = normalize_role(role_name)

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = get_current_role()
            if ROLE_RANK.get(role, 1) < ROLE_RANK.get(target, 1):
                return _forbidden_response()
            return fn(*args, **kwargs)

        return wrapper

    return decorator


@login_manager.user_loader
def load_user(user_id: str):
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None

    doc = db[USER_COLLECTION].find_one({"_id": oid})
    if not doc:
        return None
    return User(doc)


@login_manager.unauthorized_handler
def handle_unauthorized():
    if request.path.startswith("/api/"):
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    return redirect(url_for("login_page", next=request.path))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def _current_user_display() -> tuple[str, str]:
    if not current_user.is_authenticated:
        return "Guest", "G"

    display_name = ((getattr(current_user, "first_name", "") or "").strip() + " " + (getattr(current_user, "last_name", "") or "").strip()).strip()
    if not display_name:
        display_name = (getattr(current_user, "email", "") or "User").strip()
    initials = "".join([part[:1].upper() for part in display_name.split() if part])[:2] or "U"
    return display_name, initials


def _template_user_context() -> dict:
    display_name, initials = _current_user_display()
    role = get_current_role()
    is_guest = not current_user.is_authenticated
    user_role_label = "Guest (Viewer)" if is_guest else role_label(role)
    can_edit = ROLE_RANK.get(role, 1) >= ROLE_RANK[ROLE_EDITOR]
    return {
        "user_display_name": display_name,
        "user_initials": initials,
        "user_role_label": user_role_label,
        "user_is_admin": role == ROLE_ADMIN,
        "can_edit": can_edit,
        "can_access_add_article": can_edit,
        "is_guest": is_guest,
    }


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def is_allowed_article_url(url: str) -> bool:
    raw = (url or "").strip()
    if not raw:
        return False

    try:
        parsed = urlparse(raw)
    except Exception:
        return False

    if parsed.scheme not in {"http", "https"}:
        return False

    host = (parsed.netloc or "").split("@")[-1].split(":")[0].lower().strip(".")
    if not host:
        return False

    return host == ALLOWED_ARTICLE_DOMAIN or host.endswith(f".{ALLOWED_ARTICLE_DOMAIN}")


def find_user_by_email(email: str):
    return db[USER_COLLECTION].find_one({"email": normalize_email(email)})


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
    }
    res = db[USER_COLLECTION].insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc


# -------------------------
# Pages
# -------------------------
@app.get("/")
@require_role_at_least(ROLE_EDITOR)
def index():
    return render_template("mainPage.html", **_template_user_context())


@app.get("/login")
def login_page():
    if current_user.is_authenticated:
        return redirect(default_landing_for_role(get_current_role()))
    return render_template("login.html")


@app.get("/records")
@require_any_role([ROLE_VIEWER, ROLE_EDITOR, ROLE_ADMIN])
def records_page():
    return render_template("interviewdb.html", **_template_user_context())


@app.get("/articles")
@require_any_role([ROLE_VIEWER, ROLE_EDITOR, ROLE_ADMIN])
def articles_page():
    return render_template("articledb.html", **_template_user_context())


@app.get("/admin")
@require_role(ROLE_ADMIN)
def admin_dashboard_page():
    return render_template("adminDashboard.html", **_template_user_context())


@app.post("/login")
def login_action():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not payload:
        payload = request.form.to_dict(flat=True)

    email = (payload.get("email") or "").strip()
    password = payload.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required."}), 400

    user_doc = find_user_by_email(email)
    if not user_doc:
        return jsonify({"ok": False, "error": "Invalid email or password."}), 401

    if not check_password_hash(user_doc.get("passwordHash", ""), password):
        return jsonify({"ok": False, "error": "Invalid email or password."}), 401

    login_user(User(user_doc))
    db[USER_COLLECTION].update_one({"_id": user_doc["_id"]}, {"$set": {"lastLoginAt": _now_iso()}})

    next_url = request.args.get("next") or default_landing_for_role(user_doc.get("role"))
    return jsonify({"ok": True, "redirect": next_url})


@app.post("/register")
def register_action():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not payload:
        payload = request.form.to_dict(flat=True)

    email = (payload.get("email") or "").strip()
    first_name = (payload.get("firstName") or "").strip()
    last_name = (payload.get("lastName") or "").strip()
    password = payload.get("password") or ""
    confirm = payload.get("confirmPassword") or ""

    if not first_name or not last_name:
        return jsonify({"ok": False, "error": "First and last name are required."}), 400

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required."}), 400

    if confirm and confirm != password:
        return jsonify({"ok": False, "error": "Passwords do not match."}), 400

    if len(password) < 8:
        return jsonify({"ok": False, "error": "Password must be at least 8 characters."}), 400

    existing = find_user_by_email(email)
    if existing:
        return jsonify({"ok": False, "error": "Email is already registered."}), 409

    user_doc = create_user(email, password, first_name, last_name)
    login_user(User(user_doc))

    return jsonify({"ok": True, "redirect": default_landing_for_role(user_doc.get("role"))})


@app.post("/logout")
def logout_action():
    if current_user.is_authenticated:
        logout_user()
    return jsonify({"ok": True})


# -------------------------
# APIs
# -------------------------
@app.post("/api/extract")
@require_role_at_least(ROLE_EDITOR)
def api_extract():
    data = request.get_json(silent=True) or {}
    url = (data.get("url") or "").strip()
    if not url:
        return jsonify({"ok": False, "error": "Missing url"}), 400
    if not is_allowed_article_url(url):
        return jsonify({"ok": False, "error": "Please paste a Poolesville Pulse link (poolesvillepulse.org)."}), 400
    if not GEMINI_API_KEY:
        return jsonify({"ok": False, "error": "Server missing GEMINI_API_KEY"}), 500

    try:
        people = extract_people_for_ui(url, api_key=GEMINI_API_KEY)
        return jsonify({"ok": True, "article_url": url, "people": people})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.post("/api/save")
@require_role_at_least(ROLE_EDITOR)
def api_save_interviewees():
    """Save extracted people for a given article URL.

    Expected payload (from templates/mainPage.html):
      {
        "articleUrl": "https://...",
        "addedBy": "...",
        "people": [
          {"firstName": "...", "lastName": "...", "grade": "...", "house": "...", "dateAdded": "YYYY-MM-DD"}
        ]
      }

    Dedupe rule:
      Upsert by (urlNorm, firstNameNorm, lastNameNorm).
      This prevents duplicates for the same person extracted from the same URL,
      and allows the same person to exist across different URLs.
    """
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"ok": False, "error": "Invalid JSON payload"}), 400

    article_url = (data.get("articleUrl") or data.get("article_url") or "").strip()
    if not article_url:
        return jsonify({"ok": False, "error": "Missing articleUrl"}), 400
    if not is_allowed_article_url(article_url):
        return jsonify({"ok": False, "error": "Only Poolesville Pulse links (poolesvillepulse.org) can be saved."}), 400

    # Save/refresh article metadata in articleRecords
    try:
        article = get_article_data(article_url)
        article_doc = {
            "url": article_url,
            "title": (article.get("title") or ""),
            "authors": article.get("authors") or [],
            "tags": article.get("tags") or [],
            "datePublished": (article.get("date") or ""),
        }
        db[ARTICLE_COLLECTION].replace_one({"url": article_url}, article_doc, upsert=True)
    except Exception:
        # Don't block saving interview records if metadata extraction fails.
        pass

    people = data.get("people") or []
    if not isinstance(people, list):
        return jsonify({"ok": False, "error": "people must be a list"}), 400

    now_iso = datetime.now(timezone.utc).isoformat(timespec="milliseconds")

    inserted = 0
    updated = 0
    skipped = 0

    col = db[INTERVIEW_COLLECTION]

    for p in people:
        if not isinstance(p, dict):
            skipped += 1
            continue

        first = (p.get("firstName") or "").strip()
        last = (p.get("lastName") or "").strip()
        grade = (p.get("grade") or "").strip()
        house = (p.get("house") or "").strip()
        date_added = (p.get("dateAdded") or "").strip()

        if not date_added:
            date_added = date.today().isoformat()

        if not first and not last:
            skipped += 1
            continue

        # Dedupe by (url, firstName, lastName), case-insensitive.
        flt = {"url": article_url, "firstName": first, "lastName": last}
        existing = col.find_one(flt, collation={"locale": "en", "strength": 2})
        if isinstance(existing, dict):
            same = (
                (existing.get("firstName") or "") == first
                and (existing.get("lastName") or "") == last
                and (existing.get("grade") or "") == grade
                and (existing.get("house") or "") == house
                and (existing.get("url") or "") == article_url
            )
            if same:
                skipped += 1
                continue

        time_value = existing.get("time") if isinstance(existing, dict) and existing.get("time") else now_iso

        # Replacement doc written in a stable field order.
        replacement = {
            "firstName": first,
            "lastName": last,
            "grade": grade,
            "house": house,
            "url": article_url,
            "date": date_added,
            "time": time_value,
        }

        res = col.replace_one(
            flt,
            replacement,
            upsert=True,
            collation={"locale": "en", "strength": 2},
        )
        if res.upserted_id is not None:
            inserted += 1
        else:
            updated += 1

    msg = f"Saved {inserted + updated} record(s) ({inserted} new, {updated} updated" + (f", {skipped} skipped" if skipped else "") + ")"
    return jsonify({"ok": True, "message": msg, "inserted": inserted, "updated": updated, "skipped": skipped})


@app.get("/api/interview-records")
@require_any_role([ROLE_VIEWER, ROLE_EDITOR, ROLE_ADMIN])
def api_interview_records():
    col = db[INTERVIEW_COLLECTION]

    # Newest first using your ISO "time" field (best for sorting)
    docs = col.find({}).sort("time", -1).limit(3000)

    records = []
    for d in docs:
        first = d.get("firstName", "")
        last = d.get("lastName", "")

        records.append({
            "id": str(d.get("_id")),
            "firstName": first,
            "lastName": last,
            "grade": d.get("grade", ""),
            "house": d.get("house", ""),
            "url": d.get("url", ""),
            "dateAdded": d.get("date", ""),
        })

    return jsonify({"ok": True, "people": records})


@app.get("/api/article-records")
@require_any_role([ROLE_VIEWER, ROLE_EDITOR, ROLE_ADMIN])
def api_article_records():
    """Return article records from MongoDB.

    Joins interviewees from interviewRecords by URL so the articles UI can
    show per-article people without additional round trips.
    """

    def domain_from_url(u: str) -> str:
        try:
            p = urlparse(u or "")
            return (p.netloc or "").lower()
        except Exception:
            return ""

    art_col = db[ARTICLE_COLLECTION]
    people_col = db[INTERVIEW_COLLECTION]

    docs = list(art_col.find({}).sort("_id", -1).limit(3000))

    urls = [d.get("url") for d in docs if isinstance(d, dict) and d.get("url")]
    people_by_url: dict[str, list[dict]] = defaultdict(list)

    if urls:
        cursor = people_col.find(
            {"url": {"$in": urls}},
            {"firstName": 1, "lastName": 1, "grade": 1, "house": 1, "url": 1},
        )
        for p in cursor:
            u = p.get("url") or ""
            name = (f"{p.get('firstName', '')} {p.get('lastName', '')}").strip() or "—"
            people_by_url[u].append(
                {
                    "name": name,
                    "grade": p.get("grade", ""),
                    "house": p.get("house", ""),
                }
            )

        for u in list(people_by_url.keys()):
            people_by_url[u].sort(key=lambda x: (x.get("name") or "").lower())

    records = []
    for d in docs:
        url = (d.get("url") or "").strip()
        authors = d.get("authors")
        if authors is None:
            authors = []
        if isinstance(authors, str):
            authors = [authors]

        tags = d.get("tags")
        if tags is None:
            tags = []
        if isinstance(tags, str):
            tags = [tags]

        published = (d.get("datePublished") or d.get("publishedAt") or d.get("date") or "").strip()

        records.append(
            {
                "id": str(d.get("_id")),
                "title": d.get("title", ""),
                "url": url,
                "domain": domain_from_url(url),
                "outlet": d.get("outlet", "") or "",
                "authors": authors,
                "author": ", ".join([a for a in authors if a]) if isinstance(authors, list) else "",
                "tags": tags,
                "publishedAt": published,
                "interviewees": people_by_url.get(url, []),
            }
        )

    return jsonify({"ok": True, "articles": records})


def _split_list_field(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        parts = [str(x).strip() for x in value]
    else:
        parts = [p.strip() for p in str(value).replace("\n", ",").split(",")]

    out: list[str] = []
    seen = set()
    for p in parts:
        if not p:
            continue
        key = p.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


_MONTHS_FULL = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


def _normalize_published_date(value: str) -> str:
    """Normalize various date strings into 'January 20, 2026'.

    Accepts:
    - '' (empty)
    - ISO 'YYYY-MM-DD'
    - Month name 'January 20, 2026' (case-insensitive, month may be abbreviated)
    """
    raw = (value or "").strip()
    if not raw:
        return ""

    # ISO date
    try:
        d = date.fromisoformat(raw)
        return f"{_MONTHS_FULL[d.month - 1]} {d.day}, {d.year}"
    except Exception:
        pass

    # ISO datetime (tolerate trailing Z)
    try:
        dt_raw = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(dt_raw)
        d = dt.date()
        return f"{_MONTHS_FULL[d.month - 1]} {d.day}, {d.year}"
    except Exception:
        pass

    import re

    m = re.match(r"^\s*([A-Za-z]+)\s+(\d{1,2})\s*,\s*(\d{4})\s*$", raw)
    if not m:
        raise ValueError("Use: January 20, 2026")

    month_token = (m.group(1) or "").strip().lower()
    day_str = m.group(2)
    year_str = m.group(3)

    day_num = int(day_str)
    year_num = int(year_str)

    month_index = -1
    for i, full in enumerate(_MONTHS_FULL):
        full_l = full.lower()
        if month_token == full_l:
            month_index = i
            break
        if month_token[:3] == full_l[:3]:
            month_index = i
            break

    if month_index < 0:
        raise ValueError("Invalid month name")

    # Validate actual calendar date.
    _ = date(year_num, month_index + 1, day_num)
    return f"{_MONTHS_FULL[month_index]} {day_num}, {year_num}"


@app.post("/api/article-records/<record_id>")
@require_role_at_least(ROLE_EDITOR)
def api_update_article_record(record_id: str):
    """Update a single article record by Mongo _id.

    Payload: { title?, url?, outlet?, authors?, tags?, publishedAt? }
    - authors/tags accept list[str] or comma/newline-separated string.
    - If url changes, interviewRecords with old url are updated to new url.
    """
    try:
        oid = ObjectId(record_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid record id"}), 400

    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"ok": False, "error": "Invalid JSON payload"}), 400

    art_col = db[ARTICLE_COLLECTION]
    people_col = db[INTERVIEW_COLLECTION]

    existing = art_col.find_one({"_id": oid})
    if not existing:
        return jsonify({"ok": False, "error": "Record not found"}), 404

    update = {}

    if "title" in payload:
        update["title"] = str(payload.get("title") or "").strip()

    if "outlet" in payload:
        update["outlet"] = str(payload.get("outlet") or "").strip()

    if "authors" in payload:
        update["authors"] = _split_list_field(payload.get("authors"))

    if "tags" in payload:
        update["tags"] = _split_list_field(payload.get("tags"))

    if "publishedAt" in payload:
        try:
            update["datePublished"] = _normalize_published_date(str(payload.get("publishedAt") or "").strip())
        except Exception as e:
            return jsonify({"ok": False, "error": f"Invalid published date: {e}"}), 400

    old_url = str(existing.get("url") or "").strip()
    new_url = old_url
    if "url" in payload:
        new_url = str(payload.get("url") or "").strip()
        if not new_url:
            return jsonify({"ok": False, "error": "url is required"}), 400
        if not is_allowed_article_url(new_url):
            return jsonify({"ok": False, "error": "URL must be from poolesvillepulse.org"}), 400

        if new_url != old_url:
            conflict = art_col.find_one({"url": new_url, "_id": {"$ne": oid}})
            if conflict:
                return jsonify({"ok": False, "error": "Another article record already uses that URL"}), 409
            update["url"] = new_url

    if not update:
        return jsonify({"ok": False, "error": "No editable fields provided"}), 400

    art_col.update_one({"_id": oid}, {"$set": update})

    if new_url != old_url and old_url:
        people_col.update_many({"url": old_url}, {"$set": {"url": new_url}})

    updated = art_col.find_one({"_id": oid}) or {}

    def domain_from_url(u: str) -> str:
        try:
            p = urlparse(u or "")
            return (p.netloc or "").lower()
        except Exception:
            return ""

    authors = updated.get("authors")
    if authors is None:
        authors = []
    if isinstance(authors, str):
        authors = [authors]

    tags = updated.get("tags")
    if tags is None:
        tags = []
    if isinstance(tags, str):
        tags = [tags]

    url = str(updated.get("url") or "").strip()
    published = str(updated.get("datePublished") or updated.get("publishedAt") or updated.get("date") or "").strip()

    record = {
        "id": str(updated.get("_id")),
        "title": updated.get("title", ""),
        "url": url,
        "domain": domain_from_url(url),
        "outlet": updated.get("outlet", "") or "",
        "authors": authors,
        "author": ", ".join([a for a in authors if a]) if isinstance(authors, list) else "",
        "tags": tags,
        "publishedAt": published,
    }

    return jsonify({"ok": True, "article": record})


@app.delete("/api/article-records/<record_id>")
@require_role_at_least(ROLE_EDITOR)
def api_delete_article_record(record_id: str):
    try:
        oid = ObjectId(record_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid record id"}), 400

    art_col = db[ARTICLE_COLLECTION]
    people_col = db[INTERVIEW_COLLECTION]

    existing = art_col.find_one({"_id": oid})
    if not existing:
        return jsonify({"ok": False, "error": "Record not found"}), 404

    url = str(existing.get("url") or "").strip()

    res = art_col.delete_one({"_id": oid})
    if res.deleted_count == 0:
        return jsonify({"ok": False, "error": "Record not found"}), 404

    deleted_interviewees = 0
    if url:
        deleted_interviewees = people_col.delete_many({"url": url}).deleted_count

    return jsonify({
        "ok": True,
        "deletedId": record_id,
        "deletedInterviewees": deleted_interviewees,
    })


@app.post("/api/article-records/<record_id>/delete")
@require_role_at_least(ROLE_EDITOR)
def api_delete_article_record_post(record_id: str):
    # Convenience endpoint for clients that can't send DELETE.
    return api_delete_article_record(record_id)


@app.post("/api/interview-records/<record_id>")
@require_role_at_least(ROLE_EDITOR)
def api_update_interview_record(record_id: str):
    """Update a single interview record by Mongo _id.

    Payload: { firstName?, lastName?, grade?, house?, url? }
    """
    try:
        oid = ObjectId(record_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid record id"}), 400

    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"ok": False, "error": "Invalid JSON payload"}), 400

    allowed = {"firstName", "lastName", "grade", "house", "url"}
    update = {}
    for k in allowed:
        if k in payload:
            v = payload.get(k)
            if v is None:
                update[k] = ""
            else:
                update[k] = str(v).strip()

    if not update:
        return jsonify({"ok": False, "error": "No editable fields provided"}), 400

    col = db[INTERVIEW_COLLECTION]
    res = col.update_one({"_id": oid}, {"$set": update})
    if res.matched_count == 0:
        return jsonify({"ok": False, "error": "Record not found"}), 404

    doc = col.find_one({"_id": oid})
    if not doc:
        return jsonify({"ok": True, "updated": update})

    return jsonify({
        "ok": True,
        "record": {
            "id": str(doc.get("_id")),
            "firstName": doc.get("firstName", ""),
            "lastName": doc.get("lastName", ""),
            "grade": doc.get("grade", ""),
            "house": doc.get("house", ""),
            "url": doc.get("url", ""),
            "dateAdded": doc.get("date", ""),
        }
    })


@app.delete("/api/interview-records/<record_id>")
@require_role_at_least(ROLE_EDITOR)
def api_delete_interview_record(record_id: str):
    try:
        oid = ObjectId(record_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid record id"}), 400

    col = db[INTERVIEW_COLLECTION]
    res = col.delete_one({"_id": oid})
    if res.deleted_count == 0:
        return jsonify({"ok": False, "error": "Record not found"}), 404
    return jsonify({"ok": True, "deletedId": record_id})


@app.post("/api/interview-records/<record_id>/delete")
@require_role_at_least(ROLE_EDITOR)
def api_delete_interview_record_post(record_id: str):
    # Convenience endpoint for clients that can't send DELETE.
    return api_delete_interview_record(record_id)


@app.get("/api/admin/users")
@require_role(ROLE_ADMIN)
def api_admin_users():
    users = []
    cursor = db[USER_COLLECTION].find({}, {"firstName": 1, "lastName": 1, "email": 1, "role": 1}).sort(
        [("role", 1), ("lastName", 1), ("firstName", 1), ("email", 1)]
    )

    for doc in cursor:
        users.append(
            {
                "id": str(doc.get("_id")),
                "firstName": (doc.get("firstName") or "").strip(),
                "lastName": (doc.get("lastName") or "").strip(),
                "email": (doc.get("email") or "").strip(),
                "role": normalize_role(doc.get("role")),
            }
        )

    return jsonify({"ok": True, "users": users})


@app.post("/api/admin/users/<user_id>/role")
@require_role(ROLE_ADMIN)
def api_admin_update_user_role(user_id: str):
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid user id"}), 400

    payload = request.get_json(silent=True) or {}
    requested_role = str(payload.get("role") or "").strip().lower()
    if requested_role not in VALID_ROLES:
        return jsonify({"ok": False, "error": "Invalid role"}), 400

    user_doc = db[USER_COLLECTION].find_one({"_id": oid})
    if not user_doc:
        return jsonify({"ok": False, "error": "User not found"}), 404

    db[USER_COLLECTION].update_one({"_id": oid}, {"$set": {"role": requested_role}})
    return jsonify({"ok": True, "id": user_id, "role": requested_role})


@app.delete("/api/admin/users/<user_id>")
@require_role(ROLE_ADMIN)
def api_admin_delete_user(user_id: str):
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({"ok": False, "error": "Invalid user id"}), 400

    if current_user.is_authenticated and str(getattr(current_user, "id", "")) == str(user_id):
        return jsonify({"ok": False, "error": "You cannot delete your own account."}), 400

    res = db[USER_COLLECTION].delete_one({"_id": oid})
    if res.deleted_count == 0:
        return jsonify({"ok": False, "error": "User not found"}), 404

    return jsonify({"ok": True, "deletedId": user_id})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

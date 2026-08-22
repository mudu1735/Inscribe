import base64
import ast
import csv
import hashlib
import re
import secrets
import unittest
import zipfile
from datetime import datetime, timezone
from io import BytesIO, StringIO
from pathlib import Path
from urllib.parse import urlparse

from bson import ObjectId
from cryptography.fernet import Fernet, InvalidToken
from flask import Flask, request, session
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from werkzeug.utils import secure_filename


AUTH_APP_PATH = Path(__file__).with_name("auth_app.py")
AUTH_APP_TREE = ast.parse(AUTH_APP_PATH.read_text(encoding="utf-8"), filename=str(AUTH_APP_PATH))


def load_functions(names, namespace=None):
    selected = [
        node for node in AUTH_APP_TREE.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name in names
    ]
    missing = set(names) - {node.name for node in selected}
    if missing:
        raise AssertionError(f"Missing functions in auth_app.py: {sorted(missing)}")
    module = ast.Module(body=selected, type_ignores=[])
    ast.fix_missing_locations(module)
    loaded = dict(namespace or {})
    exec(compile(module, str(AUTH_APP_PATH), "exec"), loaded)
    return loaded


class Upload:
    def __init__(self, filename, data):
        self.filename = filename
        self._stream = BytesIO(data)

    def read(self, amount=-1):
        return self._stream.read(amount)


class SecurityHelperTests(unittest.TestCase):
    def test_workspace_roles_are_canonicalized_independently_of_legacy_migrations(self):
        loaded = load_functions(
            {"_canonicalize_workspace_user_roles"},
            {
                "ROLE_GUEST": "guest",
                "VALID_ROLES": {"admin", "editor", "writer", "guest"},
                "ROLE_OWNER": "owner",
            },
        )

        class Users:
            calls = []

            def update_many(self, query, update):
                self.calls.append((query, update))

        users = Users()
        loaded["users_col"] = users
        loaded["_canonicalize_workspace_user_roles"]()
        self.assertEqual(users.calls, [(
            {
                "workspaceId": {"$exists": True, "$nin": [None, ""]},
                "platformRole": {"$ne": "owner"},
                "role": {"$nin": ["admin", "editor", "guest", "writer"]},
            },
            {"$set": {"role": "guest"}},
        )])

    def test_oauth_tokens_are_authenticated_encrypted_and_tamper_evident(self):
        app = Flask(__name__)
        app.secret_key = "stable-test-secret-with-more-than-thirty-two-characters"
        loaded = load_functions(
            {"_oauth_token_cipher", "_encrypt_oauth_token", "_decrypt_oauth_token"},
            {
                "app": app,
                "base64": base64,
                "hashlib": hashlib,
                "Fernet": Fernet,
                "InvalidToken": InvalidToken,
                "OAUTH_TOKEN_ENCRYPTION_KEY": "independent-oauth-encryption-key",
                "_has_strong_oauth_encryption_key": True,
                "OAUTH_TOKEN_PREFIX": "fernet:v1:",
            },
        )
        encrypt = loaded["_encrypt_oauth_token"]
        decrypt = loaded["_decrypt_oauth_token"]
        plaintext = "google-refresh-token-secret"
        encrypted = encrypt(plaintext)
        self.assertTrue(encrypted.startswith("fernet:v1:"))
        self.assertNotIn(plaintext, encrypted)
        self.assertEqual(decrypt(encrypted), plaintext)
        self.assertEqual(decrypt(encrypted[:-1] + ("A" if encrypted[-1] != "A" else "B")), "")
        self.assertEqual(decrypt("legacy-token"), "legacy-token")

    def test_shared_rate_limit_keys_are_hashed_and_windowed(self):
        app = Flask(__name__)
        app.secret_key = "stable-test-secret"
        loaded = load_functions(
            {"_security_rate_key", "_security_rate_window"},
            {
                "app": app,
                "hashlib": hashlib,
                "datetime": datetime,
                "timezone": timezone,
                "timedelta": __import__("datetime").timedelta,
            },
        )
        raw = "203.0.113.1:student@example.com"
        key = loaded["_security_rate_key"](raw)
        self.assertEqual(len(key), 64)
        self.assertNotIn("student", key)
        now = datetime(2026, 7, 17, 12, 7, tzinfo=timezone.utc)
        start, expires = loaded["_security_rate_window"](900, now)
        self.assertEqual(start.minute, 0)
        self.assertEqual((expires - start).total_seconds(), 1800)

    def test_redirect_and_external_url_guards(self):
        loaded = load_functions(
            {"_sanitize_next_url", "_safe_http_url", "_is_valid_http_url"},
            {"urlparse": urlparse},
        )
        sanitize = loaded["_sanitize_next_url"]
        self.assertEqual(sanitize("/stories?mine=1"), "/stories?mine=1")
        for payload in ("/\\evil.example", "//evil.example", "https://evil.example", "/dashboard\n/evil"):
            self.assertEqual(sanitize(payload), "")

        safe_url = loaded["_safe_http_url"]
        self.assertEqual(safe_url("https://docs.google.com/document/d/abc"), "https://docs.google.com/document/d/abc")
        for payload in ("javascript:alert(1)", "https://good.example\\@evil.example", "https://user:pass@example.com/"):
            self.assertEqual(safe_url(payload), "")

    def test_login_origin_guard(self):
        app = Flask(__name__)
        loaded = load_functions(
            {"_origin_from_url", "_trusted_request_origins", "_is_same_origin_request", "_is_allowed_auth_request_origin"},
            {
                "request": request,
                "urlparse": urlparse,
                "TRUSTED_CSRF_ORIGINS": {"https://falcon.example"},
            },
        )
        allowed = loaded["_is_allowed_auth_request_origin"]
        with app.test_request_context("/api/auth/login", base_url="https://api.falcon.example", headers={"Origin": "https://falcon.example"}):
            self.assertTrue(allowed())
        with app.test_request_context("/api/auth/login", base_url="https://api.falcon.example", headers={"Origin": "https://evil.example", "Sec-Fetch-Site": "cross-site"}):
            self.assertFalse(allowed())
        with app.test_request_context("/api/auth/login", base_url="https://api.falcon.example"):
            self.assertTrue(allowed())

    def test_oauth_nonce_is_browser_bound_bounded_and_one_use(self):
        app = Flask(__name__)
        app.secret_key = secrets.token_urlsafe(48)

        class OAuthNonces:
            def __init__(self):
                self.records = {}

            def insert_one(self, document):
                nonce = document["nonce"]
                if nonce in self.records:
                    raise DuplicateKeyError("duplicate nonce")
                self.records[nonce] = dict(document)

            def find_one_and_delete(self, query):
                return self.records.pop(query["nonce"], None)

        oauth_nonces = OAuthNonces()
        loaded = load_functions(
            {"_google_state_serializer", "_normalize_google_intent", "_make_google_state", "_load_google_state"},
            {
                "app": app,
                "session": session,
                "secrets": secrets,
                "datetime": datetime,
                "timezone": timezone,
                "URLSafeTimedSerializer": URLSafeTimedSerializer,
                "BadSignature": BadSignature,
                "SignatureExpired": SignatureExpired,
                "DuplicateKeyError": DuplicateKeyError,
                "GOOGLE_INTENT_LOGIN": "login",
                "GOOGLE_INTENTS": {"login", "signup"},
                "GOOGLE_STATE_MAX_AGE_SECONDS": 600,
                "oauth_state_col": oauth_nonces,
                "_sanitize_next_url": lambda value: value if str(value).startswith("/") else "",
                "_sanitize_frontend_origin": lambda _value: "",
            },
        )
        make_state = loaded["_make_google_state"]
        load_state = loaded["_load_google_state"]

        with app.test_request_context("/"):
            states = [make_state("/dashboard", "") for _ in range(7)]
            pending = list(session["google_oauth_nonces"])
            self.assertEqual(len(pending), 5)
            state = states[-1]

        with app.test_request_context("/"):
            _data, error = load_state(state)
            self.assertIn("not started in this browser", error)

        with app.test_request_context("/"):
            session["google_oauth_nonces"] = pending
            data, error = load_state(state)
            self.assertEqual(error, "")
            self.assertEqual(data["next"], "/dashboard")
            session["google_oauth_nonces"] = pending
            _data, replay_error = load_state(state)
            self.assertIn("already been used", replay_error)

    def test_auth_version_is_enforced_without_account_verification(self):
        app = Flask(__name__)
        app.secret_key = secrets.token_urlsafe(48)
        user_id = ObjectId()
        user = {
            "_id": user_id,
            "authVersion": 2,
            "email": "owner@example.com",
        }

        class Users:
            @staticmethod
            def find_one(query):
                return user if query.get("_id") == user_id else None

        loaded = load_functions(
            {"_auth_version_for_doc", "_current_user_doc"},
            {"session": session, "ObjectId": ObjectId, "users_col": Users()},
        )
        current_user = loaded["_current_user_doc"]
        with app.test_request_context("/"):
            session["user_id"] = str(user_id)
            self.assertIsNone(current_user())
            self.assertNotIn("user_id", session)
        with app.test_request_context("/"):
            session["user_id"] = str(user_id)
            session["auth_version"] = 1
            self.assertIsNone(current_user())
        with app.test_request_context("/"):
            session["user_id"] = str(user_id)
            session["auth_version"] = 2
            self.assertEqual(current_user()["email"], "owner@example.com")

    def test_verified_google_reclaim_revokes_password_and_increments_version(self):
        existing = {
            "_id": "user-1",
            "email": "owner@example.com",
            "passwordHash": "attacker-hash",
            "authVersion": 1,
            "authProviders": {"password": True},
        }

        class Users:
            captured_update = None

            def find_one(self, query):
                if query.get("email") == existing["email"]:
                    return existing
                return None

            def find_one_and_update(self, _query, update, return_document=None):
                self.captured_update = update
                return {
                    **existing,
                    "googleId": "google-sub-123",
                    "googleSub": "google-sub-123",
                    "googleEmailVerified": True,
                    "authVersion": 2,
                    "authProviders": {"password": False, "google": True},
                }

            def insert_one(self, _doc):
                raise AssertionError("Reclaim must not create a second user")

        users = Users()
        loaded = load_functions(
            {
                "_now_iso", "normalize_email", "_split_google_name", "_google_id_from_doc",
                "find_user_by_email", "find_user_by_google_id", "upsert_google_user",
            },
            {
                "datetime": datetime,
                "timezone": timezone,
                "users_col": users,
                "ReturnDocument": ReturnDocument,
                "_is_valid_http_url": lambda value: str(value).startswith("https://"),
            },
        )
        claimed = loaded["upsert_google_user"]({
            "email": "owner@example.com",
            "email_verified": True,
            "sub": "google-sub-123",
            "given_name": "Real",
            "family_name": "Owner",
        })
        update = users.captured_update
        self.assertIsInstance(update, list)
        set_stage = update[0]["$set"]
        self.assertEqual(set_stage["authVersion"]["$add"][1], 1)
        self.assertEqual(set_stage["authVersion"]["$add"][0]["$cond"][2], 1)
        self.assertEqual(update[1], {"$unset": "passwordHash"})
        self.assertFalse(set_stage["authProviders.password"])
        self.assertTrue(set_stage["googleEmailVerified"])
        self.assertEqual(claimed["authVersion"], 2)

    def test_verified_google_reclaim_initializes_missing_auth_version_before_increment(self):
        source = AUTH_APP_PATH.read_text(encoding="utf-8")
        self.assertIn('{"$isNumber": "$authVersion"}', source)
        self.assertIn('{"$gte": ["$authVersion", 1]}', source)
        self.assertIn('"$unset": "passwordHash"', source)

    def test_names_parser_rejects_malformed_and_oversized_csv(self):
        loaded = load_functions(
            {"_upload_cell_text", "_validated_upload_row", "_validate_xlsx_archive", "_normalized_upload_header", "_read_names_upload", "_names_documents"},
            {
                "csv": csv,
                "re": re,
                "zipfile": zipfile,
                "BytesIO": BytesIO,
                "StringIO": StringIO,
                "Path": Path,
                "datetime": datetime,
                "secure_filename": secure_filename,
                "MAX_NAMES_UPLOAD_BYTES": 10 * 1024 * 1024,
                "MAX_NAMES_ROWS": 25000,
                "MAX_NAMES_COLUMNS": 100,
                "MAX_NAMES_CELL_CHARS": 500,
                "MAX_XLSX_ARCHIVE_ENTRIES": 1000,
                "MAX_XLSX_UNCOMPRESSED_BYTES": 50 * 1024 * 1024,
                "NAME_HEADER_ALIASES": {
                    "firstName": {"firstname", "first"},
                    "lastName": {"lastname", "last"},
                    "grade": {"grade"},
                    "house": {"house"},
                    "type": {"type"},
                    "email": {"email"},
                    "title": {"title"},
                },
            },
        )
        read_upload = loaded["_read_names_upload"]
        headers, rows, _filename = read_upload(Upload("names.csv", b"firstName,lastName\nMaya,Johnson\n"))
        documents, skipped, duplicates = loaded["_names_documents"](headers, rows)
        self.assertEqual((documents[0]["firstName"], skipped, duplicates), ("Maya", 0, 0))

        with self.assertRaisesRegex(ValueError, "parse"):
            read_upload(Upload("names.csv", b'firstName,lastName\n"Maya,Johnson\n'))
        with self.assertRaisesRegex(ValueError, "100 columns"):
            read_upload(Upload("names.csv", (",".join(f"c{i}" for i in range(101)) + "\n").encode()))
        with self.assertRaisesRegex(ValueError, "500 characters"):
            read_upload(Upload("names.csv", ("firstName,lastName\n" + "M" * 501 + ",Johnson\n").encode()))

    def test_names_queries_are_workspace_and_batch_scoped(self):
        loaded = load_functions({"_active_names_query"})
        query_a = loaded["_active_names_query"]({"publicId": "class-a", "namesDatabase": {"activeBatchId": "batch-a"}})
        query_b = loaded["_active_names_query"]({"publicId": "class-b", "namesDatabase": {"activeBatchId": "batch-b"}})
        self.assertEqual(query_a, {"workspaceId": "class-a", "uploadBatchId": "batch-a"})
        self.assertEqual(query_b, {"workspaceId": "class-b", "uploadBatchId": "batch-b"})
        self.assertNotEqual(query_a, query_b)


class OwnerWorkspaceSecurityTests(unittest.TestCase):
    def test_owner_role_is_platform_scoped_and_not_a_workspace_role(self):
        loaded = load_functions(
            {"normalize_role", "_is_owner", "_account_role", "_membership_workspace_id_for_user", "_workspace_members_query"},
            {
                "ROLE_OWNER": "owner",
                "ROLE_GUEST": "guest",
                "VALID_ROLES": {"admin", "editor", "writer", "guest"},
            },
        )
        self.assertEqual(loaded["normalize_role"]("owner"), "guest")
        self.assertTrue(loaded["_is_owner"]({"platformRole": "owner"}))
        self.assertTrue(loaded["_is_owner"]({"role": "owner"}))
        self.assertEqual(loaded["_account_role"]({"platformRole": "owner"}), "owner")
        self.assertEqual(loaded["_membership_workspace_id_for_user"]({"platformRole": "owner"}), "")
        self.assertEqual(
            loaded["_workspace_members_query"]("newsroom-a"),
            {
                "workspaceId": "newsroom-a",
                "platformRole": {"$ne": "owner"},
                "role": {"$in": ["admin", "editor", "guest", "writer"]},
            },
        )

    def test_owner_login_redirect_ignores_requested_workspace_page(self):
        app = Flask(__name__)
        loaded = load_functions(
            {"normalize_role", "_sanitize_next_url", "_auth_redirect_for_role"},
            {
                "request": request,
                "urlparse": urlparse,
                "ROLE_OWNER": "owner",
                "ROLE_GUEST": "guest",
                "VALID_ROLES": {"admin", "editor", "writer", "guest"},
                "FRONTEND_ROLE_LANDING": {
                    "owner": "/owner",
                    "guest": "/interviewees",
                    "writer": "/stories",
                    "editor": "/dashboard",
                    "admin": "/dashboard",
                },
            },
        )
        redirect_for_role = loaded["_auth_redirect_for_role"]
        with app.test_request_context("/api/auth/login?next=/stories"):
            self.assertEqual(redirect_for_role("owner"), "/owner")
            self.assertEqual(redirect_for_role("writer"), "/stories")

    def test_owner_account_migration_removes_workspace_membership(self):
        class Users:
            calls = []

            def update_many(self, query, update):
                self.calls.append((query, update))

        users = Users()
        loaded = load_functions(
            {"_canonicalize_owner_accounts"},
            {
                "users_col": users,
                "ROLE_OWNER": "owner",
                "OWNER_EMAILS": {"owner@example.com"},
                "_now_iso": lambda: "2026-08-11T12:00:00+00:00",
            },
        )
        loaded["_canonicalize_owner_accounts"]()
        query, update = users.calls[0]
        self.assertIn({"role": "owner"}, query["$or"])
        self.assertIn({"email": {"$in": ["owner@example.com"]}}, query["$or"])
        self.assertEqual(update["$set"]["platformRole"], "owner")
        self.assertEqual(set(update["$unset"]), {"workspaceId", "role", "joinedWorkspaceAt"})

    def test_workspace_creation_helpers_are_unique_and_allow_optional_publication_url(self):
        class Workspaces:
            def __init__(self):
                self.public_ids = {"school-news"}

            def find_one(self, query):
                return query.get("publicId") in self.public_ids

        loaded = load_functions(
            {"_new_workspace_public_id", "_workspace_settings_updates"},
            {
                "re": re,
                "secrets": secrets,
                "workspaces_col": Workspaces(),
                "urlparse": urlparse,
                "_now_iso": lambda: "2026-08-11T12:00:00+00:00",
                "_safe_http_url": lambda value, max_length=500: value if str(value).startswith(("http://", "https://")) else "",
                "_normalized_publication_hostname": lambda value: str(value or "").lower(),
            },
        )
        public_id = loaded["_new_workspace_public_id"]("School News")
        self.assertTrue(public_id.startswith("school-news-"))
        updates, error = loaded["_workspace_settings_updates"]({"name": "School News", "publicationUrl": ""})
        self.assertEqual(error, "")
        self.assertEqual(updates["publicationUrl"], "")
        self.assertEqual(loaded["_workspace_settings_updates"]({"name": "School News", "publicationUrl": "javascript:alert(1)"})[1], "Enter a valid publication URL beginning with http:// or https://.")

    def test_owner_workspace_context_is_the_collection_scope(self):
        runtime_session = {"owner_workspace_id": "newsroom-a"}
        loaded = load_functions(
            {"_is_owner", "_membership_workspace_id_for_user", "_workspace_id_for_user", "_workspace_query", "_scoped_query"},
            {
                "ROLE_OWNER": "owner",
                "has_request_context": lambda: True,
                "session": runtime_session,
            },
        )
        owner = {"platformRole": "owner"}
        self.assertEqual(loaded["_workspace_query"](owner), {"workspaceId": "newsroom-a"})
        self.assertEqual(
            loaded["_scoped_query"](owner, {"status": "Published"}),
            {"$and": [{"workspaceId": "newsroom-a"}, {"status": "Published"}]},
        )
        runtime_session["owner_workspace_id"] = "newsroom-b"
        self.assertEqual(loaded["_workspace_query"](owner), {"workspaceId": "newsroom-b"})
        runtime_session.clear()
        self.assertEqual(loaded["_workspace_query"](owner), {"_id": None})
        self.assertEqual(
            loaded["_workspace_query"]({"role": "admin", "workspaceId": "member-newsroom"}),
            {"workspaceId": "member-newsroom"},
        )

    def test_workspace_data_routes_are_scoped_and_creation_does_not_seed_content(self):
        source = AUTH_APP_PATH.read_text(encoding="utf-8")

        def function_source(name):
            node = next(item for item in AUTH_APP_TREE.body if isinstance(item, ast.FunctionDef) and item.name == name)
            return ast.get_source_segment(source, node) or ""

        scoped_routes = {
            "api_stories": "_story_query_for_user(user_doc)",
            "api_pitches": "_pitch_query_for_user(user_doc)",
            "api_feedback": '"workspaceId": _workspace_id_for_user(user_doc)',
            "api_activity": '"workspaceId": _workspace_id_for_user(user_doc)',
            "api_dashboard": "_scoped_query(user_doc",
            "api_article_records": "_workspace_query(user_doc)",
            "api_interview_records": "_workspace_query(_current_user_doc())",
            "api_admin_names": "_active_names_query(workspace)",
        }
        for route_name, scope_snippet in scoped_routes.items():
            self.assertIn(scope_snippet, function_source(route_name), route_name)

        create_source = function_source("api_owner_create_workspace")
        self.assertIn("workspaces_col.insert_one(workspace)", create_source)
        for content_collection in (
            "stories_col",
            "pitches_col",
            "articles_col",
            "interviews_col",
            "feedback_col",
            "activity_col",
            "names_col",
        ):
            self.assertNotIn(content_collection, create_source)
    def test_owner_routes_and_first_member_admin_policy_are_wired(self):
        source = AUTH_APP_PATH.read_text(encoding="utf-8")
        for snippet in (
            '@app.get("/api/owner/workspaces")',
            '@app.post("/api/owner/workspaces")',
            '@app.patch("/api/owner/workspaces/<workspace_id>")',
            '@app.post("/api/owner/workspaces/<workspace_id>/open")',
            '@app.post("/api/owner/workspaces/<workspace_id>/join-code/rotate")',
            "joining_role = ROLE_ADMIN if member_count == 0 else ROLE_GUEST",
            "Owners open workspaces from the owner workspace page.",
        ):
            self.assertIn(snippet, source)
        admin_roles_source = ast.get_source_segment(
            source,
            next(node for node in AUTH_APP_TREE.body if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == "VALID_ROLES" for target in node.targets)),
        ) or ""
        self.assertNotIn("ROLE_OWNER", admin_roles_source)

if __name__ == "__main__":
    unittest.main()

import ast
import re
import unittest
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse


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


class WorkflowHelperTests(unittest.TestCase):
    def test_removed_user_record_query_prefers_stable_identity_over_legacy_name(self):
        loaded = load_functions(
            {"_workspace_user_record_query"},
            {
                "normalize_email": lambda value: str(value or "").strip().lower(),
                "_user_display_name": lambda user: user.get("name", ""),
            },
        )
        query = loaded["_workspace_user_record_query"](
            "newsroom",
            {"_id": "user-1", "email": "Writer@Example.com", "name": "Writer One"},
            ("ownerUserId",),
            ("ownerEmail",),
            ("owner",),
        )
        clauses = query["$and"][1]["$or"]
        self.assertIn({"ownerUserId": {"$in": ["user-1"]}}, clauses)
        self.assertIn({"ownerEmail": "writer@example.com"}, clauses)
        legacy_clause = next(clause for clause in clauses if "$and" in clause)
        self.assertIn({"owner": {"$in": ["Writer One", "writer@example.com"]}}, legacy_clause["$and"])
        self.assertIn({"ownerUserId": {"$in": [None, ""]}}, legacy_clause["$and"])
        self.assertIn({"ownerEmail": {"$in": [None, ""]}}, legacy_clause["$and"])

    def test_pitch_statuses_and_round_details_normalize_legacy_values(self):
        loaded = load_functions(
            {"_normalize_pitch_status", "_normalize_pitch_round_status", "_pitch_round_detail_updates"},
            {
                "PITCH_STATUS_IN_PROGRESS": "In Progress",
                "PITCH_STATUS_READY": "Ready for Review",
                "PITCH_STATUS_SELECTED": "Selected",
            },
        )
        self.assertEqual(loaded["_normalize_pitch_status"]("Approved"), "Selected")
        self.assertEqual(loaded["_normalize_pitch_status"]("Selected for Story"), "Selected")
        self.assertEqual(loaded["_normalize_pitch_status"]("Needs Review"), "Ready for Review")
        self.assertEqual(loaded["_normalize_pitch_round_status"]("Open for Submissions"), "Open")
        details, error = loaded["_pitch_round_detail_updates"]({"name": "  May pitches  "})
        self.assertEqual(error, "")
        self.assertEqual(details, {"name": "May pitches", "description": ""})
        self.assertEqual(loaded["_pitch_round_detail_updates"]({"name": ""})[1], "Round name is required.")

    def test_pitch_detail_validation_and_legacy_section_compatibility(self):
        loaded = load_functions(
            {"_pitch_detail_updates"},
            {
                "PITCH_SECTIONS": {"News", "Sports"},
                "MAX_PITCH_TITLE_LENGTH": 240,
                "MAX_PITCH_ANGLE_LENGTH": 4000,
                "MAX_PITCH_SECTION_LENGTH": 80,
                "MAX_PITCH_NOTES_LENGTH": 10000,
            },
        )
        validate = loaded["_pitch_detail_updates"]
        pitch = {"title": "Old", "angle": "Old angle", "section": "Legacy Desk", "notes": ""}
        updates, error = validate(
            {"title": "  New title  ", "angle": " New angle ", "section": "News", "notes": " Notes "},
            pitch,
        )
        self.assertEqual(error, "")
        self.assertEqual(updates, {"title": "New title", "angle": "New angle", "section": "News", "notes": "Notes"})

        updates, error = validate({"notes": "Changed"}, pitch)
        self.assertEqual(error, "")
        self.assertEqual(updates, {"notes": "Changed"})
        self.assertEqual(validate({"angle": ""}, pitch)[1], "Pitch angle is required.")
        self.assertEqual(validate({"section": "Unknown Desk"}, pitch)[1], "Choose a valid pitch section.")
        self.assertEqual(validate({"section": "Legacy Desk"}, pitch)[1], "")
        self.assertIn("240 characters", validate({"title": "x" * 241}, pitch)[1])

    def test_story_transition_policy_is_strict_and_publish_retry_is_idempotent(self):
        loaded = load_functions(
            {"_story_status_transition_decision"},
            {
                "VALID_STORY_STATUSES": {
                    "Assigned", "Reporting", "Drafting", "Submitted", "In Review",
                    "Needs Revision", "Returned", "Ready for Publish", "Published",
                },
                "ROLE_ADMIN": "admin",
                "ROLE_EDITOR": "editor",
                "_safe_http_url": lambda value: value if str(value).startswith(("http://", "https://")) else "",
            },
        )
        decide = loaded["_story_status_transition_decision"]
        self.assertTrue(decide("writer", "Reporting", "Submitted", True)["ok"])
        self.assertTrue(decide("editor", "Submitted", "In Review", False)["ok"])
        self.assertTrue(decide("editor", "In Review", "Ready for Publish", False)["ok"])
        self.assertEqual(decide("editor", "Submitted", "Ready for Publish", False)["status"], 409)
        self.assertEqual(decide("editor", "Ready for Publish", "Published", False, "https://paper.example/a")["status"], 403)
        self.assertEqual(decide("admin", "Ready for Publish", "Published", False, "javascript:alert(1)")["status"], 400)

        retry = decide(
            "admin", "Published", "Published", False,
            "https://paper.example/a", "https://paper.example/a",
        )
        self.assertTrue(retry["ok"])
        self.assertTrue(retry["idempotent"])
        self.assertEqual(
            decide("admin", "Published", "Published", False, "https://paper.example/b", "https://paper.example/a")["status"],
            409,
        )

    def test_story_content_and_collaborator_locks_follow_status(self):
        loaded = load_functions(
            {"_can_edit_story_content", "_can_manage_story_collaborators"},
            {
                "ROLE_ADMIN": "admin",
                "ROLE_EDITOR": "editor",
                "ROLE_WRITER": "writer",
                "WRITER_STORY_CONTENT_STATUSES": {"Assigned", "Reporting", "Drafting", "Returned", "Needs Revision"},
                "EDITOR_STORY_CONTENT_STATUSES": {"Assigned", "Reporting", "Drafting", "Returned", "Needs Revision", "Submitted", "In Review"},
                "LOCKED_COLLABORATOR_STATUSES": {"Ready for Publish", "Published"},
                "_current_user_role": lambda user: user["role"],
                "_story_primary_owned_by_user": lambda _story, user: user.get("owns", False),
                "_story_collaborator_for_user": lambda _story, user: {"role": "edit"} if user.get("collaborates") else None,
            },
        )
        can_edit = loaded["_can_edit_story_content"]
        can_manage = loaded["_can_manage_story_collaborators"]
        writer = {"role": "writer", "owns": True}
        self.assertTrue(can_edit({"status": "Drafting"}, writer))
        self.assertFalse(can_edit({"status": "Submitted"}, writer))
        self.assertTrue(can_edit({"status": "In Review"}, {"role": "editor"}))
        self.assertFalse(can_edit({"status": "Ready for Publish"}, {"role": "admin"}))
        self.assertTrue(can_manage({"status": "Submitted"}, writer))
        self.assertFalse(can_manage({"status": "Published"}, {"role": "admin"}))

    def test_publication_url_is_workspace_bound_and_canonical(self):
        loaded = load_functions(
            {"_safe_http_url", "_normalized_publication_hostname", "_validated_publication_url", "_canonical_article_url", "_article_url_lookup_candidates", "_publication_url_conflict_query"},
            {"urlparse": urlparse, "re": re},
        )
        validate = loaded["_validated_publication_url"]
        workspace = {"publicationUrl": "https://paper.example", "articleDomain": "paper.example"}
        self.assertEqual(validate("https://paper.example/story/", workspace), "https://paper.example/story/")
        self.assertEqual(validate("https://news.paper.example/story", workspace), "https://news.paper.example/story")
        for unsafe in (
            "https://paper.example.evil.test/story",
            "https://news..paper.example/story",
            "https://user:pass@paper.example/story",
            "https://paper.example\\@evil.test/story",
            "https://paper.example:8443/story",
        ):
            self.assertEqual(validate(unsafe, workspace), "")
        self.assertEqual(loaded["_canonical_article_url"]("HTTPS://Paper.Example:443/story/"), "https://paper.example/story")
        self.assertEqual(loaded["_canonical_article_url"]("https://paper.example"), "https://paper.example/")
        conflict = loaded["_publication_url_conflict_query"]("class-a", "story-a", "https://paper.example/story/")
        self.assertEqual(conflict["workspaceId"], "class-a")
        self.assertEqual(conflict["sourceStoryId"], {"$ne": "story-a"})
        self.assertIn({"urlNorm": "https://paper.example/story"}, conflict["$or"])

    def test_publish_archive_document_and_upsert_are_one_per_story(self):
        class Articles:
            def __init__(self):
                self.records = {}

            def update_one(self, key, update, upsert=False):
                record = self.records.setdefault((key["workspaceId"], key["sourceStoryId"]), {})
                if not record:
                    record.update(update.get("$setOnInsert", {}))
                record.update(update.get("$set", {}))

        articles = Articles()
        loaded = load_functions(
            {
                "_coerce_list_field", "_safe_http_url", "_canonical_article_url", "_doc_public_id",
                "_story_archive_authors", "_article_archive_document", "_upsert_published_article",
            },
            {"urlparse": urlparse, "datetime": datetime, "articles_col": articles},
        )
        story = {
            "_id": "story-1",
            "workspaceId": "class-a",
            "title": "Compost pilot",
            "writer": "Willow Writer",
            "section": "News",
            "collaborators": [
                {"status": "accepted", "name": "Casey Collaborator"},
                {"status": "pending", "name": "Pending Person"},
            ],
        }
        published_at = datetime(2026, 7, 17, tzinfo=timezone.utc)
        first = loaded["_upsert_published_article"](story, "https://paper.example/compost/", published_at)
        second = loaded["_upsert_published_article"](story, "https://paper.example/compost/", published_at)
        self.assertEqual(len(articles.records), 1)
        self.assertEqual(first["sourceStoryId"], "story-1")
        self.assertEqual(first["authors"], ["Willow Writer", "Casey Collaborator"])
        self.assertEqual(first["urlNorm"], "https://paper.example/compost")
        self.assertEqual(second["byline"], "Willow Writer, Casey Collaborator")

    def test_interviewee_search_query_joins_names_to_article_urls(self):
        loaded = load_functions(
            {"_interviewee_search_query", "_article_search_clause"},
            {"re": re},
        )
        interview_query = loaded["_interviewee_search_query"]("class-a", "Maya Johnson")
        self.assertEqual(interview_query["workspaceId"], "class-a")
        self.assertIn({"firstName": {"$regex": "Maya\\ Johnson", "$options": "i"}}, interview_query["$or"])
        self.assertTrue(any("$expr" in clause for clause in interview_query["$or"]))
        article_clause = loaded["_article_search_clause"](
            "Maya Johnson",
            {"https://paper.example/a", "https://paper.example/a/"},
        )
        self.assertIn(
            {"url": {"$in": ["https://paper.example/a", "https://paper.example/a/"]}},
            article_clause["$or"],
        )


if __name__ == "__main__":
    unittest.main()

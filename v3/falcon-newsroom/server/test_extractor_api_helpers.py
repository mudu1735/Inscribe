import ast
import re
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from article_extractor import ArticleExtractionError, normalize_publication_host


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


class ExtractorApiHelperTests(unittest.TestCase):
    def test_workspace_publication_url_takes_priority_over_stale_domain(self):
        loaded = load_functions(
            {"_safe_http_url", "_workspace_extraction_host"},
            {
                "urlparse": urlparse,
                "normalize_publication_host": normalize_publication_host,
                "ArticleExtractionError": ArticleExtractionError,
            },
        )
        host = loaded["_workspace_extraction_host"]({
            "publicationUrl": "https://news.example.edu/archive",
            "articleDomain": "stale.example.org",
        })
        self.assertEqual(host, "news.example.edu")

    def test_extracted_metadata_is_bounded_deduplicated_and_control_safe(self):
        loaded = load_functions(
            {
                "_coerce_list_field",
                "_metadata_text",
                "_metadata_list",
                "_sanitized_extracted_article",
            },
            {"re": re},
        )
        article = loaded["_sanitized_extracted_article"](
            {
                "title": "A\x00 title\nwith controls",
                "authors": ["Avery Student", "avery student", "B" * 150],
                "tags": ["News", "news", "Campus"],
                "datePublished": "2026-07-17",
                "body": "must never be copied into the signed ticket",
            },
            "https://news.example.edu/story",
        )
        self.assertEqual(article["title"], "A title with controls")
        self.assertEqual(len(article["authors"]), 2)
        self.assertEqual(len(article["authors"][1]), 100)
        self.assertEqual(article["tags"], ["News", "Campus"])
        self.assertNotIn("body", article)

    def test_people_validation_deduplicates_and_normalizes(self):
        loaded = load_functions(
            {"_validated_person_text", "_validated_extraction_people"},
            {
                "datetime": datetime,
                "timezone": timezone,
                "MAX_EXTRACTION_PEOPLE": 100,
                "EXTRACTION_GRADES": {"", "9", "10", "11", "12", "Staff"},
                "EXTRACTION_HOUSES": {"", "SMCS", "Global", "Humanities", "ISP"},
            },
        )
        people = loaded["_validated_extraction_people"](
            [
                {
                    "firstName": " Avery ",
                    "lastName": " Student ",
                    "grade": "11",
                    "house": "SMCS",
                    "dateAdded": "2026-07-16",
                },
                {
                    "firstName": "avery",
                    "lastName": "student",
                    "grade": "11",
                    "house": "SMCS",
                    "dateAdded": "2026-07-16",
                },
            ],
            today=date(2026, 7, 17),
        )
        self.assertEqual(len(people), 1)
        self.assertEqual(people[0]["firstName"], "Avery")
        self.assertEqual(people[0]["firstNameNorm"], "avery")

    def test_people_validation_rejects_invalid_enums_dates_and_controls(self):
        loaded = load_functions(
            {"_validated_person_text", "_validated_extraction_people"},
            {
                "datetime": datetime,
                "timezone": timezone,
                "MAX_EXTRACTION_PEOPLE": 100,
                "EXTRACTION_GRADES": {"", "9", "10", "11", "12", "Staff"},
                "EXTRACTION_HOUSES": {"", "SMCS", "Global", "Humanities", "ISP"},
            },
        )
        validate = loaded["_validated_extraction_people"]
        base = {
            "firstName": "Avery",
            "lastName": "Student",
            "grade": "11",
            "house": "SMCS",
            "dateAdded": "2026-07-16",
        }
        for change in (
            {"grade": "13"},
            {"house": "Unknown"},
            {"dateAdded": "07/16/2026"},
            {"dateAdded": "2026-07-18"},
            {"firstName": "Avery\nInjected"},
        ):
            with self.subTest(change=change), self.assertRaises(ValueError):
                validate([{**base, **change}], today=date(2026, 7, 17))

    def test_extractor_errors_are_mapped_without_exposing_internals(self):
        loaded = load_functions({"_extractor_error_status"})
        status = loaded["_extractor_error_status"]
        self.assertEqual(status("response_too_large"), 413)
        self.assertEqual(status("invalid_content_type"), 415)
        self.assertEqual(status("fetch_timeout"), 504)
        self.assertEqual(status("fetch_failed"), 502)
        self.assertEqual(status("blocked_address"), 422)
        self.assertEqual(status("missing_url"), 400)


if __name__ == "__main__":
    unittest.main()

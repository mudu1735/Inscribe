import re
import json
import requests
from typing import List, Dict, Tuple
from bs4 import BeautifulSoup
import sys


from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi



# ============================================================
# 🔒 HARD-CODED MongoDB connection (temporary)
# ============================================================
MONGO_URI = "mongodb+srv://mudu1375:mudu2008@cluster0.jeailsf.mongodb.net/?appName=Cluster0"
MONGO_DB = "mudu1735"
MONGO_COLLECTION = "names"


# ============================================================
# Mongo connection (READ-ONLY usage)
# ============================================================
def get_mongo_db():
    client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
    return client[MONGO_DB]


# ============================================================
# Article scraping (title/authors/tags/date/text)
# ============================================================
def get_article_data(url: str, timeout: int = 15) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; FalconJournalismBot/1.0)"
    }

    resp = requests.get(url, headers=headers, timeout=timeout)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.content, "html.parser")

    # Get title from h1
    headline = soup.find("h1", {"class": "sno-story-headline"})
    title = headline.get_text(strip=True) if headline else ""
    if not title and soup.title:
        title = soup.title.get_text(strip=True)

    # Get authors from byline
    authors: List[str] = []
    byline_div = soup.find("div", {"class": "sno-story-byline"})
    if byline_div:
        author_links = byline_div.find_all("a")
        authors = [a.get_text(strip=True) for a in author_links if a.get_text(strip=True)]

        if not authors:
            byline_text = byline_div.get_text(" ", strip=True)
            byline_text = byline_text.replace("By ", "").replace("Written by ", "").strip()
            authors = [byline_text] if byline_text else []

    # Get date
    date_published = ""
    date_div = soup.find("div", {"class": "sno-story-date"})
    if date_div:
        time_wrapper = date_div.find("span", {"class": "time-wrapper"})
        if time_wrapper:
            date_published = time_wrapper.get_text(strip=True)
    if not date_published:
        time_tag = soup.find("time")
        if time_tag:
            date_published = (time_tag.get("datetime") or time_tag.get_text(strip=True) or "").strip()

    # Get tags from the category block list
    tags: List[str] = []
    cat_block_list = soup.find("ul", {"class": "sno-story-cat-block-list"})
    if cat_block_list:
        tag_links = cat_block_list.find_all("a", {"rel": "category tag"})
        tags = [a.get_text(strip=True) for a in tag_links if a.get_text(strip=True)]

    # Get body
    story_body = soup.find("div", {"class": "sno-story-body-content"})
    paragraphs = story_body.find_all("p") if story_body else soup.find_all("p")

    cleaned: List[str] = []
    for p in paragraphs:
        text = p.get_text(" ", strip=True)
        if text:
            cleaned.append(text)

    return {
        "title": title or "",
        "authors": authors,
        "date": date_published,
        "tags": tags,
        "text": " ".join(cleaned),
    }


def get_article_text(url: str, timeout: int = 15) -> str:
    return get_article_data(url, timeout=timeout).get("text", "")


# ============================================================
# Gemini JSON parsing
# ============================================================
def _extract_json_array(text: str) -> List[str]:
    text = text.strip()

    # Remove markdown fences
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text).strip()

    try:
        arr = json.loads(text)
        if isinstance(arr, list):
            return [str(x).strip() for x in arr if str(x).strip()]
    except Exception:
        pass

    m = re.search(r"\[[\s\S]*\]", text)
    if not m:
        raise ValueError("No JSON array found in model output.")

    arr = json.loads(m.group(0))
    if not isinstance(arr, list):
        raise ValueError("Extracted JSON is not a list.")

    return [str(x).strip() for x in arr if str(x).strip()]


# ============================================================
# Name normalization helpers
# ============================================================
HONORIFICS = [
    "mr", "mrs", "ms", "miss", "dr", "prof", "coach",
    "principal", "teacher"
]

def normalize_name(name: str) -> str:
    name = name.strip()
    name = re.sub(r"[^\w\s'-]", "", name)

    parts = name.split()
    if parts and parts[0].lower().rstrip(".") in HONORIFICS:
        parts = parts[1:]

    return " ".join(parts)


def split_name(full: str) -> Tuple[str, str]:
    full = re.sub(r"\s+", " ", full).strip()
    parts = full.split(" ")
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


# ============================================================
# Gemini interviewee extraction
# ============================================================
def find_interviewees(article_text: str, api_key: str) -> List[str]:
    import google.generativeai as genai

    genai.configure(api_key=api_key)

    prompt = f"""
Analyze this article and identify who was directly interviewed or quoted.

Return ONLY a JSON array of names, like:
["Name 1", "Name 2"]

If no one was interviewed, return:
[]

Do not include explanations or formatting.

Article:
{article_text}
"""

    response = genai.GenerativeModel(
        "gemini-3-flash-preview"
    ).generate_content(prompt)

    return _extract_json_array(response.text or "")


# ============================================================
# Mongo lookup
# ============================================================
def lookup_person(db, first: str, last: str) -> Dict | None:
    if not first or not last:
        return None

    matches = list(db[MONGO_COLLECTION].find({
        "firstName": {"$regex": f"^{re.escape(first)}$", "$options": "i"},
        "lastName": {"$regex": f"^{re.escape(last)}$", "$options": "i"}
    }))

    if len(matches) == 1:
        p = matches[0]
        return {
            "firstName": p["firstName"],
            "lastName": p["lastName"],
            "grade": p.get("grade", ""),
            "house": p.get("house", ""),
            "match": "exact",
            "personId": str(p["_id"])
        }

    if len(matches) > 1:
        return {
            "firstName": first,
            "lastName": last,
            "grade": "",
            "house": "",
            "match": "ambiguous",
            "candidates": [
                {
                    "personId": str(p["_id"]),
                    "grade": p.get("grade", ""),
                    "house": p.get("house", "")
                }
                for p in matches
            ]
        }

    return None


# ============================================================
# Main extractor for UI
# ============================================================
def extract_people_for_ui(url: str, api_key: str) -> List[Dict[str, str]]:
    db = get_mongo_db()

    article = get_article_data(url)
    article_text = article.get("text", "")
    raw_names = find_interviewees(article_text, api_key)

    results = []

    for raw in raw_names:
        clean = normalize_name(raw)
        first, last = split_name(clean)

        person = lookup_person(db, first, last)

        if person:
            results.append(person)
        else:
            results.append({
                "firstName": first,
                "lastName": last,
                "grade": "",
                "house": "",
                "match": "new"
            })

    return results

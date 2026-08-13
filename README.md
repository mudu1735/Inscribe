# Inscribe

This repo now keeps the deployed Flask app and the React prototypes separate.

## Structure

- `app/` is a tiny compatibility shim for Vercel and older imports. It imports the real Flask app from `v2/app/`.
- `v2/app/` contains the Flask v2 application, server-rendered templates, static assets, API routes, and article extractor.
- `v2/scripts/article_metadata/` contains one-off metadata scrape, repair, and validation scripts.
- `v2/data/pulse_scrape/` is for generated scrape output and is ignored by Git/Vercel.
- `v3/falcon-newsroom/` contains the React/Vite newsroom application, its Flask API, and regression tests.
- `v3/linear-landing-reference/` contains the separate Linear-style landing prototype.
- `artifacts/` contains screenshots and reference documents; it is local-only and ignored.
- `legacy_experiments/` contains old proof-of-concept tests and notebooks; it is local-only and ignored.

## Run v2 Flask

1. Copy `.env.example` to `.env` and fill in real values.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Run locally:
   - `python -m v2.app.app`

The root `requirements.txt` stays at the repo root so the existing Vercel Flask deployment can keep installing Python dependencies without changing project settings.

## Run v3 Falcon Newsroom

The v3 development command starts the React app on `127.0.0.1:5173` and the
Flask API on `127.0.0.1:5003`:

```powershell
Copy-Item .env.example .env
pip install -r requirements.txt
cd v3/falcon-newsroom
npm install
npm run dev
```

Use a unique `FLASK_SECRET_KEY` with at least 32 characters. Production startup
rejects missing, short, or example secrets. Set `FRONTEND_ORIGIN` and
`TRUSTED_CSRF_ORIGINS` to the deployed same-origin frontend, and enable
`TRUST_PROXY_HEADERS` only when the API is behind a trusted proxy.

The API supports password registration and login in both development and
production; password accounts do not require email verification. Google sign-in
still validates the identity returned by Google. OAuth tokens are encrypted in
MongoDB with a strong `OAUTH_TOKEN_ENCRYPTION_KEY`, or with the strong Flask
secret when the independent key is omitted. Serve Flask through a production
WSGI server behind TLS, not the built-in development server.

Static-host security headers are defined for Vite preview/development,
Vercel (`v3/falcon-newsroom/vercel.json`), and `_headers`-compatible hosts
(`v3/falcon-newsroom/public/_headers`). Preserve equivalent CSP, anti-framing,
content-type, referrer, and permissions headers on any other host.

## Test v3 Falcon Newsroom

```powershell
cd v3/falcon-newsroom
npm test
..\..\venv\Scripts\python.exe -m unittest discover -s server -p "test_*.py" -v
..\..\venv\Scripts\python.exe -m compileall -q server
..\..\venv\Scripts\python.exe -m pip check
npm audit
```

`npm test` runs static contract checks, TypeScript checking, and a production
Vite build. The Python tests cover security boundaries, workflow transitions,
and the bounded article extractor.

Linear reference prototype:

```powershell
cd v3/linear-landing-reference
npm install
npm run dev
```

## Environment Variables

Sensitive configuration is loaded from a root `.env` file.

- `FLASK_SECRET_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OAUTH_TOKEN_ENCRYPTION_KEY`
- `GOOGLE_AUTH_REDIRECT_URI`
- `GOOGLE_ALLOWED_DOMAINS`
- `FRONTEND_ORIGIN`
- `MONGO_URI`
- `MONGO_DB`
- `INTERVIEW_COLLECTION`
- `ARTICLE_COLLECTION`
- `USER_COLLECTION`
- `ALLOWED_ARTICLE_DOMAIN`
- `TRUSTED_CSRF_ORIGINS`
- `TRUST_PROXY_HEADERS`
- `V3_AUTH_HOST`
- `V3_AUTH_PORT`
- `MAX_REQUEST_BYTES`
- `MAX_STORY_ATTACHMENTS`
- `MAX_STORY_STORAGE_BYTES`
- `MAX_DRIVE_SHARE_RECIPIENTS`
- `DRIVE_SHARE_TOTAL_TIMEOUT_SECONDS`
- `SECURITY_RATE_COLLECTION`
- `ADMIN_MUTATION_LOCK_COLLECTION`
- `AUTH_RATE_LIMIT_MAX`
- `AUTH_ACCOUNT_RATE_LIMIT_MAX`
- `AUTH_IP_RATE_LIMIT_MAX`
- `JOIN_RATE_LIMIT_MAX`
- `JOIN_IP_RATE_LIMIT_MAX`
- `EXTRACTION_RATE_LIMIT_MAX`
- `EXTRACTION_TOKEN_MAX_AGE_SECONDS`
- `ALLOW_LOCAL_DEV_EXTRACTOR`

`ALLOWED_ARTICLE_DOMAIN` and `ALLOW_LOCAL_DEV_EXTRACTOR` are retained for the
legacy v2 extractor. V3 derives its allowed article host from each workspace's
publication settings and does not permit cross-domain extraction.

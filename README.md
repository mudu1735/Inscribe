# Inscribe / Falcon Newsroom

Inscribe is a newsroom workspace for student journalism. It supports pitching,
assigning, reporting, reviewing, and publishing stories, along with searchable
article and interviewee databases.

The repository contains the current v3 application. It is the application to
run for local development and deployment.

## Repository structure

```text
Falcon_journalism_v2/
├── v3/
│   ├── README.md                Short v3 notes
│   └── falcon-newsroom/
│       ├── src/                 React/Vite frontend
│       ├── server/              Flask/MongoDB backend and tests
│       ├── api/index.py         Vercel serverless backend entrypoint
│       ├── public/              Logos, landing assets, security headers
│       ├── scripts/              Development and static checks
│       ├── package.json          Frontend commands and dependencies
│       ├── vite.config.js        Local proxy and security headers
│       └── vercel.json           Production deployment configuration
└── .gitignore
```

## Current v3 application

The active application is `v3/falcon-newsroom/`:

- React 19 and Vite frontend
- Flask API on port `5003`
- Vite frontend on port `5173`
- MongoDB for users, workspaces, stories, pitches, records, and activity
- MongoDB GridFS for uploaded story attachments
- Optional Google OAuth and Google Drive integration
- Optional Gemini-powered article/interviewee extraction

The main frontend entrypoint is `v3/falcon-newsroom/src/main.jsx`. Most of the
authenticated interface and client-side routing is in
`v3/falcon-newsroom/src/App.jsx`. The backend is
`v3/falcon-newsroom/server/auth_app.py`, and the article extractor is
`v3/falcon-newsroom/server/article_extractor.py`.

The main editorial workflow is:

```text
Pitch → Approval → Story assignment → Reporting/drafting → Review → Publication
```

Stories can contain comments, activity history, Google Docs links, Google Drive
attachments, and uploaded files. Publishing a story creates or updates its
article archive entry. Article extraction stores article metadata and reviewed
interviewee records in MongoDB.

## Prerequisites

Before starting locally, install or have access to:

1. Python 3.12 or newer. The repository declares 3.12 in `.python-version`, but
   Python 3.14 should be usable if the pinned dependencies install successfully.
2. Node.js 20.19.x or Node.js 22.12+ and npm, matching Vite's supported
   runtime range.
3. A MongoDB deployment, either MongoDB Atlas or a local MongoDB server. Use a
   separate local database; the application creates indexes and performs startup
   migrations.
4. A root `.env` file containing at least `MONGO_URI` and a local Flask secret.

Gemini and Google credentials are optional for the basic application. Without a
Gemini key, users can still review and enter interviewees manually. Without
Google credentials, password authentication and local file attachments still
work, but Google sign-in and Drive features do not.

## Local setup on macOS/Linux

From the repository root:

```bash
# Python 3.12 is the declared target; Python 3.14 is also acceptable if the
# dependency installation below completes successfully.
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r v3/falcon-newsroom/requirements.txt

cd v3/falcon-newsroom
npm ci

npm run dev
```

Then open <http://127.0.0.1:5173>.

If dependency installation fails on a newer Python version, retry with Python
3.12, the version recorded in `.python-version`.

## Local setup on Windows

From the repository root in PowerShell:

```powershell
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r v3/falcon-newsroom/requirements.txt

Set-Location v3/falcon-newsroom
npm ci
npm run dev
```

## Minimal local `.env`

Create `.env` in the repository root. Replace the placeholder values, and do
not commit the file.

```dotenv
FLASK_ENV=development
FLASK_SECRET_KEY=replace-with-a-long-random-local-secret

MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=inscribe_local

# Make the first local account an owner so it can create/open workspaces.
OWNER_EMAILS=your-email@example.com

DEFAULT_WORKSPACE_ID=local-newsroom
DEFAULT_WORKSPACE_NAME=Local Newsroom
DEFAULT_WORKSPACE_JOIN_CODE=LOCAL123
DEFAULT_PUBLICATION_URL=https://poolesvillepulse.org
DEFAULT_ARTICLE_DOMAIN=poolesvillepulse.org

FRONTEND_ORIGIN=http://127.0.0.1:5173
TRUSTED_CSRF_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

# Optional: article metadata extraction and AI interviewee extraction.
GEMINI_API_KEY=
GEMINI_MODEL=
```

`FLASK_ENV=development` matters locally because production mode enables secure
cookies and rejects weak or missing secrets. `OWNER_EMAILS` is optional, but it
is the easiest way to make the first registered local account an owner. Other
users register normally and join a workspace with its join code.

## Optional Google configuration

To enable Google sign-in and Google Drive features, add these variables:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH_TOKEN_ENCRYPTION_KEY=replace-with-a-second-long-random-secret
GOOGLE_AUTH_REDIRECT_URI=http://127.0.0.1:5173/api/auth/google/callback
GOOGLE_ALLOWED_DOMAINS=
GOOGLE_PICKER_API_KEY=
GOOGLE_PICKER_APP_ID=
```

The redirect URI must also be registered in the Google Cloud OAuth client. The
Google Picker variables are needed for the Drive picker UI. A strong
`FLASK_SECRET_KEY` can serve as the OAuth encryption key when an independent
`OAUTH_TOKEN_ENCRYPTION_KEY` is not supplied.

## Development commands

Run both services:

```bash
cd v3/falcon-newsroom
npm run dev
```

Run the services separately when debugging:

```bash
# Terminal 1, with the virtualenv active
cd v3/falcon-newsroom
python -B -m server.auth_app

# Terminal 2
cd v3/falcon-newsroom
npm run dev:vite
```

Useful checks:

```bash
cd v3/falcon-newsroom
npm run typecheck
npm run build
npm test

python -m unittest discover -s server -p 'test_*.py' -v
python -m pip check
```

`npm test` runs the static source-contract checks, TypeScript checking, a
production Vite build, and all Python tests. The Python test suite focuses on
extraction, security helpers, workspace isolation, and workflow transitions.

## Security and deployment notes

The v3 backend includes role-based access control, workspace scoping, CSRF
checks, rate limiting, signed extraction tokens, bounded uploads, encrypted
OAuth tokens, and SSRF-resistant article fetching.

For production, use a strong secret, TLS, a production WSGI server, correctly
configured `FRONTEND_ORIGIN` and `TRUSTED_CSRF_ORIGINS`, and a separate strong
OAuth encryption key. The Vercel configuration serves the frontend statically
and routes `/api/*` to `api/index.py`.

## Current repository notes

The previous README described directories that are not present in this
checkout, including `v2/` and `v3/linear-landing-reference/`. They are not part
of the current repository.

# Inscribe

Inscribe is a collaborative newsroom workspace for student journalism. It
helps teams develop pitches, assign and report stories, review drafts, manage
publishing records, and keep research organized across workspaces.

The active application lives in `v3/falcon-newsroom/`. The root `.env.example`
is the shared configuration template for local development and deployment.

## Features

- Multi-workspace organization with owner-managed workspaces and join codes.
- Email/password accounts with optional Google OAuth sign-in.
- Role-based access for owners, admins, editors, writers, and guests.
- Pitch rounds, pitch submissions, editorial feedback, and pitch selection.
- Story assignments and a controlled workflow from reporting through review and
  publication.
- Story comments, activity history, co-author invitations, Google Docs links,
  Google Drive attachments, and local file uploads.
- Article archive and interviewee database scoped to each workspace.
- Optional article metadata and interviewee extraction with Gemini.
- Calendar events, dashboard tasks, analytics, and admin-managed names imports
  from CSV or `.xlsx` files.

The editorial workflow is:

```text
Pitch → Approval → Assignment → Reporting/drafting → Review → Publication
```

## Project layout

```text
.
├── .env.example
├── .github/workflows/ci.yml
└── v3/falcon-newsroom/
    ├── src/                 React frontend and client-side UI
    ├── server/              Flask API, article extractor, and Python tests
    ├── api/index.py         Vercel serverless entrypoint
    ├── public/              App assets and security headers
    ├── scripts/             Development and static-check helpers
    ├── package.json         Frontend scripts and dependencies
    ├── vite.config.js       Vite server, proxy, and security headers
    └── vercel.json          Vercel build, routing, and deployment settings
```

The main frontend entrypoint is `v3/falcon-newsroom/src/main.jsx`. The primary
authenticated application and client-side routing are in
`v3/falcon-newsroom/src/App.jsx`. The backend is
`v3/falcon-newsroom/server/auth_app.py`, with article extraction in
`v3/falcon-newsroom/server/article_extractor.py`.

## Requirements

- Python 3.12 (the version in `v3/falcon-newsroom/.python-version` and CI).
- Node.js 20.19.x or Node.js 22.12+, plus npm.
- A MongoDB deployment, either MongoDB Atlas or a local MongoDB server.
- A root `.env` file with a MongoDB connection string and Flask secret.

The application uses MongoDB for accounts, workspaces, stories, pitches,
articles, interviewees, activity, feedback, calendar events, and rate limits.
Story uploads are stored in MongoDB GridFS.

## Quick start

### macOS/Linux

From the repository root:

```bash
cp .env.example .env
# Edit .env and replace the placeholder values.

python3.12 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r v3/falcon-newsroom/requirements.txt

cd v3/falcon-newsroom
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. The `dev` command starts both services:

- Vite frontend: `127.0.0.1:5173`
- Flask API: `127.0.0.1:5003`

The development helper automatically uses the repository-root `venv`. To use
another Python interpreter, set `FALCON_V3_PYTHON` before `npm run dev`.

### Windows PowerShell

From the repository root:

```powershell
Copy-Item .env.example .env
# Edit .env and replace the placeholder values.

py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r v3/falcon-newsroom/requirements.txt

Set-Location v3/falcon-newsroom
npm ci
npm run dev
```

If PowerShell blocks activation, allow it for the current user or run the
commands with the virtual environment's Python directly.

## Environment configuration

Start with the tracked [`.env.example`](.env.example). Do not commit `.env` or
any file containing real credentials.

### Required locally

```dotenv
FLASK_ENV=development
FLASK_SECRET_KEY=replace-with-a-unique-random-secret-of-at-least-32-characters
MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=inscribe_local
OWNER_EMAILS=owner@example.com
FRONTEND_ORIGIN=http://127.0.0.1:5173
TRUSTED_CSRF_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

`MONGO_URI` is required for the backend to start. Use a separate database for
local development. `OWNER_EMAILS` is optional, but makes the matching account
an owner so it can create and open workspaces. Other users can join a workspace
with its join code.

`FLASK_ENV=development` enables local cookie and secret behavior. Production
must use a unique `FLASK_SECRET_KEY` with at least 32 characters. The optional
`TRUST_PROXY_HEADERS` setting should only be enabled when the app is behind a
trusted reverse proxy.

### Optional integrations

Google sign-in and Google Drive support use:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH_TOKEN_ENCRYPTION_KEY=
GOOGLE_AUTH_REDIRECT_URI=http://127.0.0.1:5173/api/auth/google/callback
GOOGLE_ALLOWED_DOMAINS=
GOOGLE_PICKER_API_KEY=
GOOGLE_PICKER_APP_ID=
GOOGLE_PICKER_CLIENT_ID=
```

Register the redirect URI in the Google Cloud OAuth client. The Picker values
are needed for the Drive picker. Use a separate strong
`OAUTH_TOKEN_ENCRYPTION_KEY` in production; a strong Flask secret can be used
as the fallback when the independent key is omitted.

Gemini-powered article and interviewee extraction uses:

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=
```

Extraction is optional. Editors and admins can still add and review records
manually when no Gemini key is configured. The workspace publication URL must
be configured before extraction can run.

Optional `DEFAULT_WORKSPACE_*` settings in `.env.example` are intended only for
deployments that deliberately bootstrap one workspace. In the normal flow,
owners create workspaces in the application and configure each workspace's
publication website there.

## Development commands

Run the frontend and backend together from `v3/falcon-newsroom/`:

```bash
npm run dev
```

Run them separately while debugging:

```bash
# Terminal 1, with the virtual environment active
python -B -m server.auth_app

# Terminal 2
npm run dev:vite
```

Available checks:

```bash
npm run typecheck
npm run build
npm run test:frontend
npm run test:backend
npm test
python -m pip check
```

`npm test` runs the frontend static checks, TypeScript validation, production
Vite build, and Python test suite. The Python tests cover article extraction,
security helpers, workspace isolation, role-based access, and workflow
transitions.

## Deployment

The application is configured for Vercel. Set the Vercel project root to
`v3/falcon-newsroom/`; `vercel.json` builds the Vite frontend, routes `/api/*`
to `api/index.py`, and serves the single-page application routes.

Configure these production variables in the deployment environment:

- `MONGO_URI` and `MONGO_DB` for the production database.
- A strong `FLASK_SECRET_KEY`.
- `FLASK_ENV=production`.
- `FRONTEND_ORIGIN` set to the deployed origin.
- `TRUSTED_CSRF_ORIGINS` containing the deployed origin.
- Google and Gemini variables if those integrations are enabled.

Use TLS and keep production credentials out of the repository. Production
startup rejects weak Flask secrets, uses secure session cookies, and applies
the security headers configured in `vercel.json` and `public/_headers`.

## Security model

The backend applies workspace-scoped data access, role checks, CSRF validation,
authentication and action rate limits, signed extraction tokens, bounded file
uploads, encrypted OAuth tokens, and SSRF-resistant article fetching. Keep
workspace data and credentials isolated between local, staging, and production
MongoDB databases.

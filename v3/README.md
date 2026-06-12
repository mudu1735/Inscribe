# Falcon Journalism v3

React/Vite prototype workspace.

- `falcon-newsroom/`: main interactive newsroom prototype. It uses its own v3 backend in `falcon-newsroom/server/` for `/api/*` routes.
- `linear-landing-reference/`: separate Linear-inspired landing page experiment/reference.

Run v3 from `falcon-newsroom/`:

```powershell
npm install
npm run dev
```

`npm run dev` starts the v3 backend on `127.0.0.1:5003`, then starts Vite on `127.0.0.1:5173`. Vite is pinned to `5173` because Google OAuth requires the local callback URL to exactly match the redirect URI registered in Google Cloud. For debugging, you can still run the two processes manually:

```powershell
npm run dev:auth
npm run dev:vite
```

The v3 Vite proxy sends `/api/*` to the v3 backend on `127.0.0.1:5003`. Do not use the v2 Flask app for v3 auth.

Local `node_modules/` and `dist/` folders are ignored.

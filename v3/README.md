# Falcon Newsroom v3

`falcon-newsroom/` is the current Inscribe application: a React/Vite frontend
with a Flask/MongoDB backend in `falcon-newsroom/server/`.

Run it from `falcon-newsroom/` after creating the root `.env`, installing the
v3 Python requirements, and installing Node dependencies:

```bash
npm ci
npm run dev
```

The backend listens on `127.0.0.1:5003` and Vite listens on
`127.0.0.1:5173`. The Vite proxy sends `/api/*` requests to the v3 backend.

On Windows, activate `venv` first and run `npm run dev`; see the root README for
complete setup and environment-variable instructions.

Local `node_modules/` and `dist/` folders are ignored.

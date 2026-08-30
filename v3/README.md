# Inscribe v3

The active Inscribe application is in `falcon-newsroom/`: a React/Vite
frontend with a Flask/MongoDB backend.

From the repository root, create `.env` from `.env.example`, install the v3
Python requirements, and install the frontend dependencies. Then run:

```bash
cd v3/falcon-newsroom
npm ci
npm run dev
```

The backend listens on `127.0.0.1:5003` and Vite listens on
`127.0.0.1:5173`. The Vite proxy forwards `/api/*` requests to the backend.

The development command starts both services and automatically uses the
repository-root `venv` when it exists. On Windows, activate `venv` before
running the command. See the [root README](../README.md) for complete setup,
environment, testing, and deployment instructions.

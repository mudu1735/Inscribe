# Falcon Journalism v3

React/Vite prototype workspace.

- `falcon-newsroom/`: main interactive newsroom prototype. It calls the Flask API endpoints through `VITE_API_BASE_URL` or same-origin `/api/*` paths.
- `linear-landing-reference/`: separate Linear-inspired landing page experiment/reference.

Run a prototype from its own folder:

```powershell
npm install
npm run dev
```

Local `node_modules/` and `dist/` folders are ignored.

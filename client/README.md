# Arshiya’s Kitchen — web client

React 19 + Vite single-page app for the Arshiya’s Kitchen recipe and meal-planning API.

## Development

```bash
npm ci
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:5000`. Start the backend first, or configure `VITE_API_URL` in `.env.local` for a separately hosted API.

## Checks and build

```bash
npm run lint
npm run build
npm run preview
```

Routes include discovery, account access, recipe details and editing, favorites, the weekly planner, and the protected admin area.

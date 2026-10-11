# Deployment and demo runbook

## Live services

- **Website:** <https://recipe-meal-planner.vercel.app>
- **API health:** <https://recipe-meal-planner-8dbv.onrender.com/api/health>
- **API base:** `https://recipe-meal-planner-8dbv.onrender.com/api`

The repository is configured for a Vercel static frontend and a Render Node API in Singapore. Both services track `main`; the Render service is on the free plan and may need a short cold start after inactivity.

## Production settings

### Frontend (Vercel)

The tracked `client/.env.production` points the production build at the current Render API. Keep this value in step with the public API URL if the Render service is renamed. The value is a public endpoint, not a secret. The Vercel project root is `client`; Vercel builds with `npm ci` and `npm run build`. `client/vercel.json` retains the SPA fallback so direct links such as `/recipe/:id` continue to load.

### API (Render)

The existing `recipe-meal-planner` service uses `server/`, Node, the `main` branch, and the Singapore region. Keep these settings:

- Build: `npm ci` (the existing `npm install` command also works)
- Start: `npm start`
- Health check path: `/api/health`
- `NODE_ENV=production`
- `MONGO_URI`: private MongoDB Atlas connection string
- `JWT_SECRET`: private random value of at least 32 characters
- `CLIENT_URL=https://recipe-meal-planner.vercel.app`

Set private values in the Render service environment, never in GitHub or this repository. If serving the frontend from an additional domain, append that exact origin to `CLIENT_URL` as a comma-separated value. Use Cloudinary credentials in Render for reliable production image storage; they remain optional for a basic demo.

## Database and first admin

Use a MongoDB Atlas database with a dedicated least-privilege application user. Add its connection URI as `MONGO_URI` in Render and verify `/api/health` reports the database as connected after the updated API is deployed. Never commit connection strings, JWT secrets, Cloudinary secrets, or real user data.

To create the first administrator safely:

1. Register the intended account through the live website.
2. In a trusted local checkout, configure the same database URI in `server/.env`.
3. Run `ADMIN_EMAIL=you@example.com npm run admin:promote` from `server/`.
4. Sign in and confirm the Admin navigation item appears.

The promotion script does not create accounts or expose a public role-changing endpoint.

## Safe release flow

1. Open a pull request targeting `main`.
2. Wait for the GitHub Actions frontend and backend checks to pass.
3. Merge the reviewed change. Vercel builds the client and Render deploys the API from `main`.
4. Verify the website and API health link above. For API calls, check browser dev tools for CORS or network errors.

The repository CI runs a clean install, frontend lint/build, backend tests/syntax checks, and high-severity dependency audits. A free Render service can sleep when idle; a first API request may take a little longer while it wakes.

## Local smoke test

```bash
cd server && npm ci && cp .env.example .env
# Set MONGO_URI and a private JWT_SECRET in server/.env.
npm run dev
```

In another terminal:

```bash
cd client && npm ci && npm run dev
```

The Vite development server proxies `/api` to the local backend. Keep `client/.env.production` untouched for local development.

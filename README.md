# Arshiya’s Kitchen

A warm, responsive recipe-sharing and weekly meal-planning app built with React, Express, MongoDB, and JWT authentication. Made for home cooks to find a new favorite, keep recipes close, and share meals with their community.

## Try the live app

- **Website:** <https://recipe-meal-planner-omega.vercel.app>
- **API health:** <https://recipe-meal-planner-8dbv.onrender.com/api/health>
- **Deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

The public site is intentionally open to browse. Create an account to save favorites, build a meal plan, publish a recipe, or leave a review. No shared demo password is embedded in the project.

## What’s included

- Friendly, responsive recipe discovery with search and meal-type filters
- A browsable house collection of ten Indian home recipes across regional breakfasts, curries, snacks, and sweets, including quick and vegetarian filters
- Serving-size adjustment, copyable shopping lists, print-friendly recipe pages, and device-saved house favorites
- Email/password registration plus Google sign-in with server-verified ID tokens and expiring JWTs (Google Web client ID is public configuration; no client secret is needed)
- Recipe publishing, editing, deletion, text search, and paginated results
- Favorites and a flexible seven-day meal planner; house recipes save locally, while signed-in cooks can add community recipes to their account plan
- One review per account per recipe, with aggregate star ratings
- Administrator tools for member and recipe moderation
- Clean white-and-sage light theme by default, optional dark mode, stable-position buttons, centered responsive navigation, a shared site footer, and page metadata
- Security headers, request limits, validation, input sanitization, and rate limiting
- CI checks for lint, production build, backend tests, syntax, and dependency advisories

## Requirements

- Node.js 22.12+ (or a compatible Node.js 20.19+ release) and npm
- MongoDB (local or Atlas)
- Cloudinary is optional locally and recommended for production image storage

## Run locally

1. Configure and start the API:

   ```bash
   cd server
   npm ci
   cp .env.example .env
   ```

   Set `MONGO_URI` and replace the `JWT_SECRET` placeholder with a random value of at least 32 characters in `server/.env`. Generate a value with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Then start the API:

   ```bash
   npm run dev
   ```

2. In another terminal, start the client:

   ```bash
   cd client
   npm ci
   npm run dev
   ```

   Open the Vite URL (normally <http://localhost:5173>). During development the Vite proxy sends `/api` requests to `http://localhost:5000`.

## First administrator

Register the account that should administer the app, then promote that exact email against the configured database from the `server` directory:

```bash
ADMIN_EMAIL=you@example.com npm run admin:promote
```

The script does not create an account or expose a public role-changing endpoint.

## Environment and deployment

See `server/.env.example`, `client/.env.example`, and the [deployment runbook](docs/DEPLOYMENT.md). The production frontend uses `client/.env.production` for the public API origin and Google OAuth Web client ID; neither value is a secret. The API’s `CLIENT_URL` must allow the exact frontend origin. Keep private database, JWT, and Cloudinary credentials in the hosting provider’s environment settings, never in Git.

## Quality checks

```bash
cd client && npm ci && npm run lint && npm run build && npm audit --audit-level=high
cd ../server && npm ci && npm test && npm audit --audit-level=high
```

The Indian thali homepage visual, soft-focus kitchen backdrop, and ten house-recipe photos are original project-created imagery. Community recipe photos are supplied by recipe authors.

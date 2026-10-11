# Arshiya’s Kitchen

A responsive recipe-sharing and weekly meal-planning app built with React, Express, MongoDB, and JWT authentication.

## What’s included

- Account registration and login with bcrypt-hashed passwords and expiring JWTs
- Recipe publishing, editing, and deletion with category, ingredient, and text search; paginated results
- Image uploads through Cloudinary in production or small MongoDB-backed data URLs during local development
- Favorites and a seven-day meal planner
- One review per account per recipe, with aggregate star ratings
- Administrator tools for member and recipe moderation
- Persisted light/dark themes, responsive navigation, route-level code splitting, metadata, and accessible forms
- Security headers, request limits, validation, sanitized inputs, and rate limiting

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- MongoDB (local or Atlas)
- Cloudinary is optional for local use and recommended for production image storage

## Run locally

1. Clone the repository and install each app’s dependencies:

   ```bash
   git clone https://github.com/Chetanmalage/recipe-meal-planner.git
   cd recipe-meal-planner
   ```

2. Configure the API:

   ```bash
   cd server
   npm ci
   cp .env.example .env
   ```

   Set `MONGO_URI` and replace the `JWT_SECRET` placeholder with a random value of at least 32 characters in `server/.env` (generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`). For local-only image storage, leave the blank Cloudinary variables empty. For production, add all three Cloudinary credentials.

3. Start the API in one terminal:

   ```bash
   cd server
   npm run dev
   ```

4. Start the web client in another terminal:

   ```bash
   cd client
   npm ci
   npm run dev
   ```

   Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Vite proxies `/api` requests to `http://localhost:5000`.

## First administrator

Register the account that should administer the app, then from the `server` directory promote that exact email against the configured database:

```bash
ADMIN_EMAIL=you@example.com npm run admin:promote
```

The script does not create an account or expose a public role-changing endpoint.

## Environment variables

See `server/.env.example` and `client/.env.example`. For split deployments, set `CLIENT_URL` to the allowed frontend origin(s), comma-separated, and set `VITE_API_URL` to the deployed API base path (for example `https://api.example.com/api`). Keep `.env` files out of version control.

## Deployment notes

- Deploy the API as a long-running Node service (Render, Railway, or equivalent) with `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` configured.
- Deploy `client` as a static Vite site. Configure the frontend API URL for the hosted API and set the API’s allowed client origin.
- Use Cloudinary in production; local fallback images are stored in MongoDB and are intended only for small development uploads.
- The API health endpoint is `GET /api/health`.

## Quality checks

```bash
cd client && npm run lint && npm run build
cd ../server && npm test && npm audit --omit=dev --audit-level=high
```

## Image credit

The homepage’s shared-meal photograph (`client/public/images/community-table.jpg`) was sourced from [Unsplash](https://unsplash.com/license) through image search. User-uploaded recipe images are provided by recipe authors.

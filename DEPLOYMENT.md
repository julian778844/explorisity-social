# Explorisity Deployment Guide

This project is now prepared for a 3-service deployment:

- Frontend: Vercel
- Backend: Render
- Database: Supabase or Neon Postgres

## 1. Database

Create a Postgres database in Supabase or Neon.

Copy the connection string. It should look like:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

Then push the database schema:

```bash
corepack enable
pnpm install --frozen-lockfile
DATABASE_URL="your_database_url" pnpm --filter @workspace/db push
```

## 2. Backend on Render

Create a Render Web Service connected to your GitHub repo.

Use these settings:

```txt
Root Directory: leave blank
Build Command: corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server build
Start Command: pnpm --filter @workspace/api-server start
Health Check Path: /api/healthz
```

Environment variables:

```env
NODE_ENV=production
PORT=10000
SESSION_SECRET=generate-a-long-random-secret
DATABASE_URL=your_supabase_or_neon_database_url
CORS_ORIGINS=https://your-vercel-domain.vercel.app,https://explorisity.com,https://www.explorisity.com
```

After deployment, your backend URL will look like:

```txt
https://explorisity-api.onrender.com
```

Your API base URL is:

```txt
https://explorisity-api.onrender.com/api
```

## 3. Frontend on Vercel

Create a Vercel project connected to the same GitHub repo.

Use these settings:

```txt
Framework Preset: Vite
Root Directory: artifacts/unimatch
Install Command: cd ../.. && corepack enable && pnpm install --frozen-lockfile
Build Command: cd ../.. && pnpm --filter @workspace/unimatch build
Output Directory: dist/public
```

Environment variables:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
BASE_PATH=/
```

## 4. Important cookie note

Because the frontend and backend are on different domains, the backend uses production cookies with:

```txt
SameSite=None
Secure=true
```

This is required for login sessions to work across Vercel and Render.

## 5. Local development

Backend:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
# Fill DATABASE_URL and SESSION_SECRET
PORT=5000 SESSION_SECRET=test DATABASE_URL="your_database_url" CORS_ORIGINS=http://localhost:5173 pnpm --filter @workspace/api-server dev
```

Frontend:

```bash
cp artifacts/unimatch/.env.example artifacts/unimatch/.env
pnpm --filter @workspace/unimatch dev
```

Open:

```txt
http://localhost:5173
```

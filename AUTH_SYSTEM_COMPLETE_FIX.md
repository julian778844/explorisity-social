# Explorisity Complete Auth Fix

## What was broken

- Render/Vercel are on different domains, so browser session cookies can fail or disappear.
- Express 5 crashes on `app.options("*")` or `app.get("*")` style routes.
- Signup/login could succeed but `/api/auth/me` returned `null`, sending users back to the sign-in page.
- The login form did not support `@username` style identifiers cleanly.
- Forgot password was only a concept, not routed.
- The homepage had the academic hero component file, but it was not mounted on the start page.

## What this patch fixes

- Adds a signed auth token fallback while keeping secure server sessions.
- Signup automatically logs the user in and returns `authToken`.
- Login returns `authToken` and keeps the user inside the account after refresh.
- `/api/auth/me` checks both the session cookie and the Authorization Bearer token.
- Protected API routes now recognize the signed auth token.
- Post creation keeps using the authenticated user ID, so posts belong to the logged-in user.
- Passwords are hashed with bcrypt before database storage.
- Login checks the bcrypt password hash.
- Adds forgot password API scaffold and frontend modal.
- Adds a welcome pop-up after sign-in/sign-up.
- Adds academic campus imagery and design to the homepage.
- Removes Express 5 wildcard route crash risk.

## Required deployment steps

1. Copy this package into your GitHub Desktop repo.
2. Commit and push.
3. In Neon, run:
   `lib/db/migrations/9999_auth_system_complete.sql`
4. Render: Clear build cache & deploy.
5. Vercel: Redeploy without cache.
6. Test with a new account.

## Environment variables to confirm

Render:
- DATABASE_URL
- SESSION_SECRET
- NODE_ENV=production
- CORS_ORIGINS=https://explorisity-social.vercel.app
- FRONTEND_URL=https://explorisity-social.vercel.app

Vercel:
- VITE_API_URL=https://explorisity-social-1.onrender.com/api

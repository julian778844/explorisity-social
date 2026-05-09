
# Hotfix: Signup and Social First Home

## What changed

1. Backend CORS now accepts both CORS_ORIGINS and FRONTEND_URL.
2. Frontend API errors now explain when the server cannot be reached.
3. Homepage now puts student profiles, communities, rankings, and activity first.
4. Compare is still included but moved into a smaller supporting section.
5. Added a clear "Sign in to make your profile" button.
6. Added Chance Me route to the app router.

## Immediate Render settings

In Render, add or confirm:

CORS_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app

Then redeploy backend.

## Immediate Vercel settings

In Vercel, confirm:

VITE_API_URL=https://explorisity-social-1.onrender.com/api

Then redeploy frontend.

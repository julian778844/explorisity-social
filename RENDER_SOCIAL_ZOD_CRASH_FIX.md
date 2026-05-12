# Render Crash Fix: social.ts Zod partial issue

## Error fixed

Render was crashing with:

TypeError: postInputSchema.partial is not a function

## Root cause

`postInputSchema` was created with `.refine()`.
In Zod, `.refine()` wraps the object schema, so `.partial()` is no longer available on that refined schema.

## Fix

Created:

- `postBaseSchema`
- `postInputSchema = postBaseSchema.refine(...)`
- `postUpdateSchema = postBaseSchema.partial().refine(...)`

This lets post creation and post editing validate images correctly without crashing the backend.

## Deploy

1. Copy files into GitHub Desktop repo.
2. Commit.
3. Push origin.
4. Render: Clear build cache and deploy.
5. Vercel redeploy only if frontend files changed.

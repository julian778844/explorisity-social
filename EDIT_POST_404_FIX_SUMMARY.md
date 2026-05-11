# Edit Post 404 Fix

## Problem

Editing a post was returning 404 because the frontend calls:

PATCH /api/social/posts/:id

but the backend route was missing, not registered, or not deployed correctly.

## Fix

This hotfix guarantees:

- artifacts/api-server/src/routes/social.ts includes PATCH /posts/:id
- artifacts/api-server/src/routes/index.ts registers socialRouter at /api/social
- Only the post owner can edit a post
- Post title/body/category/link/image can be updated
- Post image URLs/data are preserved or updated correctly
- Likes and comments routes remain visible and working

## SQL

Run this migration in Neon:

lib/db/migrations/10003_edit_post_404_fix.sql

## Deploy

1. Copy ZIP contents into GitHub Desktop repo
2. Commit
3. Push origin
4. Run Neon migration
5. Render: Clear build cache and deploy
6. Vercel: Redeploy without cache

## Test

1. Log in
2. Create a post
3. Click Edit
4. Change the text
5. Save changes
6. Confirm the post updates without 404

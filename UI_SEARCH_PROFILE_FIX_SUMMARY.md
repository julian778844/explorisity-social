# Explorisity UI, Search, Explore Feed, and Profile Picture Fix

## Inspected project areas

Frontend:
- `artifacts/unimatch/src/App.tsx`
- `artifacts/unimatch/src/components/Nav.tsx`
- `artifacts/unimatch/src/components/GlobalSearch.tsx`
- `artifacts/unimatch/src/pages/HomePage.tsx`
- `artifacts/unimatch/src/pages/ProfilePage.tsx`
- `artifacts/unimatch/src/lib/api.ts`

Backend:
- `artifacts/api-server/src/routes/search.ts`
- `artifacts/api-server/src/routes/social.ts`
- `artifacts/api-server/src/routes/upload.ts`
- `lib/db/src/schema/users.ts`
- `lib/api-zod/src/auth.ts`

## What was broken

1. Search existed, but it was not mounted visibly in the top navigation or sidebar.
2. The search result links for schools were not consistently routed to real school pages.
3. There was no full Search page.
4. There was no dedicated Explore feed page for real posts and opportunities.
5. Homepage student activity/opportunity areas had placeholder-style content instead of real database posts.
6. The Student Journey visual depended on fragile external imagery or was not clearly mounted as a reliable local asset.
7. Profile picture upload was only color/avatar based and did not persist an uploaded image.
8. Backend upload route was a placeholder and did not save the image to the signed-in user.
9. Database schema did not include `avatar_url`.

## What was fixed

### Search
- Added a visible top search bar on desktop.
- Added a mobile search bar/search icon.
- Added a Search tab in the sidebar.
- Added a full `/search` page.
- Search can return:
  - users
  - schools
  - posts
  - opportunities
  - communities

### Explore feed
- Added `/explore`.
- Explore shows real posts from the database.
- Opportunities filter uses real `job`, `event`, and `promotion` posts.
- If there are no posts, it shows:
  - “No posts yet. Be the first to share something.”
- No fake users or bot posts were added.

### Homepage
- Added reliable local academic images:
  - `public/student-journey-campus.svg`
  - `public/academic-network-hero.svg`
- Fixed the Student Journey visual with a local image path.
- Added Opportunities section with a real “See More” button to `/explore?filter=opportunities`.
- Removed fake feed-style content and connected opportunity cards to real posts.

### Profile picture upload
- Added actual upload button in profile edit mode.
- Added file type validation:
  - PNG
  - JPG/JPEG
  - WEBP
- Added 2MB size validation.
- Added backend `/api/upload/avatar` route.
- Saves the image to the logged-in user.
- Updates `/api/auth/me`.
- Persists after refresh, logout, and login.
- Added `avatar_url` database column.

## Required database step

Run this migration in Neon:

`lib/db/migrations/10000_ui_search_profile_fixes.sql`

## Required deploy steps

1. Copy this package into GitHub Desktop repo.
2. Commit.
3. Push origin.
4. Run the migration in Neon.
5. Render: Clear build cache and deploy.
6. Vercel: Redeploy without cache.

## Test checklist

- Login/signup.
- Top search bar is visible.
- Sidebar Search tab appears.
- Search page works.
- Search users/schools/posts/opportunities.
- Student Journey image loads on homepage.
- Opportunities See More goes to Explore.
- Explore shows empty state with no posts.
- Create a real post in Social.
- Confirm the post appears in Explore.
- Edit profile.
- Upload profile picture.
- Refresh.
- Logout/login.
- Confirm profile picture still appears.

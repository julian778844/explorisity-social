# Explorisity Notifications System Install Instructions

This patch adds the real notifications system.

## Files added

Backend:
- artifacts/api-server/src/routes/notifications.ts

Frontend:
- artifacts/unimatch/src/pages/NotificationsPage.tsx
- artifacts/unimatch/src/components/NotificationBell.tsx
- artifacts/unimatch/src/lib/notificationsApiPatch.ts

Database:
- lib/db/migrations/10004_notifications_system.sql

## Required manual wiring

### 1. Register backend route

Open:

artifacts/api-server/src/routes/index.ts

Add import:

import notificationsRouter from "./notifications";

Add route:

router.use("/notifications", notificationsRouter);

### 2. Add API methods

Open:

artifacts/unimatch/src/lib/api.ts

Copy the types and methods from:

artifacts/unimatch/src/lib/notificationsApiPatch.ts

Paste them into api.ts.

### 3. Add frontend route

Open:

artifacts/unimatch/src/App.tsx

Add import:

import NotificationsPage from "@/pages/NotificationsPage";

Add route:

<Route path="/notifications" component={NotificationsPage} />

### 4. Add bell to navbar

Open your navbar component, likely:

artifacts/unimatch/src/components/Nav.tsx

Add import:

import NotificationBell from "@/components/NotificationBell";

Place this near Messages/profile icons:

<NotificationBell />

## Optional backend integration

To create notifications from actions, import:

import { createNotification } from "./notifications";

Then call it after:
- follow user
- like post
- comment on post
- send message
- message request

Example:

await createNotification({
  userId: postOwnerId,
  actorUserId: req.session.userId!,
  type: "post_like",
  title: "New like",
  body: "Someone liked your post.",
  href: `/profile/${actorUsername}`,
});

## Required Neon SQL

Run:

lib/db/migrations/10004_notifications_system.sql

## Deploy

1. Copy patch files into repo.
2. Wire the route/API/navbar.
3. Commit.
4. Push origin.
5. Run Neon migration.
6. Render: Clear build cache and deploy.
7. Vercel: Redeploy without cache.

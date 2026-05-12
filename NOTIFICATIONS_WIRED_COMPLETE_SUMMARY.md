# Explorisity Notifications Wired Complete

## This package does the wiring for you

No separate install guide is needed.

## Added and wired

Backend:
- `artifacts/api-server/src/routes/notifications.ts`
- Registered in `artifacts/api-server/src/routes/index.ts`
- Notifications are created for:
  - new follows
  - post likes
  - post comments
  - direct messages/message requests

Frontend:
- `artifacts/unimatch/src/components/NotificationBell.tsx`
- Bell icon added to `Nav.tsx`
- `/notifications` route added in `App.tsx`
- `NotificationsPage.tsx` added
- Notification API methods added to `api.ts`

Database:
- `lib/db/migrations/10004_notifications_system.sql`

## Required Neon SQL

Run:

`lib/db/migrations/10004_notifications_system.sql`

## Deploy

1. Copy this ZIP into your GitHub Desktop repo.
2. Commit.
3. Push origin.
4. Run the SQL migration in Neon.
5. Render: Clear build cache and deploy.
6. Vercel: Redeploy without cache.

## Test

- Log in.
- Check the notification bell in the navbar.
- Follow another user.
- Like/comment on a post from another account.
- Send a message.
- Open `/notifications`.
- Confirm notifications show with unread badges and timestamps.

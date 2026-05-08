# Explorisity Social Features Added

This build adds the first full social layer for Explorisity.

## Included

- Student follow and unfollow
- School communities
- Join community endpoint
- Student feed posts
- Post categories: promotion, job, event, general
- Direct messages
- Group chats
- Message sending and reading
- Frontend social page at `/social`
- Navigation link for Social Communities

## Backend routes

All new backend routes are under:

```txt
/api/social
```

Important routes:

```txt
GET    /api/social/users
POST   /api/social/users/:id/follow
DELETE /api/social/users/:id/follow
GET    /api/social/user-follows
GET    /api/social/communities
POST   /api/social/communities
POST   /api/social/communities/:id/join
GET    /api/social/posts
POST   /api/social/posts
GET    /api/social/conversations
POST   /api/social/conversations/dm
POST   /api/social/conversations/group
GET    /api/social/conversations/:id/messages
POST   /api/social/conversations/:id/messages
```

## Database setup

Run this SQL in Supabase, Neon, or your Postgres database before using the social features:

```txt
lib/db/migrations/0001_social_features.sql
```

## Current messaging behavior

Messaging is functional but uses short polling on the frontend. That means the message window refreshes every 5 seconds.

For a more advanced production version, upgrade later to:

- Socket.io
- WebSockets
- Push notifications
- Read receipts
- Typing indicators
- Moderation/reporting tools

## Notes

This is not end-to-end encrypted messaging yet. It is normal app messaging where messages are stored in Postgres.

# Explorisity Direct Messaging System

## Added

### Frontend
- Messages icon in the top navigation
- Unread message badge
- `/messages` page
- Inbox tab
- Message Requests tab
- Conversation search
- Conversation list with:
  - other user avatar
  - display name
  - username
  - last message preview
  - timestamp with timezone
  - unread count
  - message request label
- Chat thread UI with:
  - profile link
  - chat bubbles
  - mobile back button
  - message input
  - disabled send button for empty messages
  - immediate UI refresh after send
- Message button on public user profiles
- Empty states for no messages
- Mobile-friendly layout

### Backend
- New `/api/messages` routes:
  - `GET /summary`
  - `GET /conversations`
  - `POST /dm`
  - `GET /conversations/:id/messages`
  - `POST /conversations/:id/messages`
  - `POST /conversations/:id/read`
  - `POST /requests/:id/accept`
  - `POST /requests/:id/decline`
- Auth protection on all sensitive routes
- Users can only read conversations they belong to
- Users cannot message themselves
- Direct messages persist in the database
- Conversations are reused to avoid duplicates

### Message requests
- Mutual followers go to Inbox
- Non-mutual messages become Message Requests
- Users can accept or decline message requests
- Accepted requests move into Inbox
- Declined requests are hidden/blocked from that request flow

### Notifications
- Message notifications table added
- New direct message notifications
- New message request notifications
- Message request accepted notification

## Database migration

Run this in Neon:

`lib/db/migrations/10003_direct_messaging_system.sql`

## Deploy steps

1. Copy the ZIP contents into your GitHub Desktop repo.
2. Commit.
3. Push origin.
4. Run the Neon migration:
   `lib/db/migrations/10003_direct_messaging_system.sql`
5. Render: Clear build cache and deploy.
6. Vercel: Redeploy without cache.

## Testing checklist

1. Sign in as user A.
2. Visit user B profile.
3. Click Message.
4. Send a message.
5. Confirm it appears immediately.
6. Refresh and confirm it persists.
7. Sign in as user B.
8. Confirm unread badge appears.
9. Confirm message appears in Inbox or Requests depending on follow relationship.
10. Accept a message request.
11. Confirm it moves into Inbox.
12. Open the conversation and confirm unread count clears.
13. Test mobile layout.

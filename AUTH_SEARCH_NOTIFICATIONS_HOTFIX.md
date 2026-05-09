# Auth, Search, and Notification Hotfix

This patch stabilizes signup/login and prepares Explorisity for student notifications.

## Fixed

- CORS now allows your Vercel frontend reliably.
- `/api/health` and `/api/healthz` both work.
- Signup saves username, password hash, display name, email, phone, and notification preferences.
- Login accepts username or email.
- Search route can return students, schools, and communities.
- Backend route registration includes search, upload, engagement, Chance Me, journey, academic bio, and social rankings.

## Database

Run these SQL files in Neon, in this order if the tables do not already exist:

1. `lib/db/migrations/0000_core_auth_schema.sql`
2. `lib/db/migrations/0001_social_features.sql`
3. `lib/db/migrations/0002_student_network_features.sql`
4. `lib/db/migrations/0003_auth_notification_fields.sql`

## Email and SMS

This patch stores notification preferences. To actually send emails/SMS later, connect:

- Email: Resend, SendGrid, or Postmark
- SMS: Twilio

Do not put provider secrets in the frontend. Add them only to Render environment variables.

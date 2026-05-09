# Welcome + Forgot Password Update

## Added

- Welcome to Explorisity pop-up after sign in or sign up
- Feature summary pop-up:
  - explore universities
  - internships
  - scholarships
  - jobs
  - events
  - communities
  - networking
- Auth flow now keeps the user inside the account after successful login/signup
- Forgot password modal
- Forgot password API scaffold
- Password reset database table migration

## Files Added

- artifacts/unimatch/src/components/WelcomeToExplorisityModal.tsx
- artifacts/unimatch/src/components/ForgotPasswordModal.tsx
- artifacts/api-server/src/routes/passwordReset.ts
- lib/db/migrations/0004_password_reset_and_welcome.sql

## Important route registration

Register this route in the Express app if not already wired:

import passwordResetRouter from "./routes/passwordReset";

app.use("/api/auth", passwordResetRouter);

## Production note

The forgot password route currently returns a secure success response.
To send real reset emails/SMS, connect Resend, SendGrid, Twilio, or similar.

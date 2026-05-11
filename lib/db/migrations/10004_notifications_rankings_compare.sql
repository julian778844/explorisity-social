-- Notifications and comment reply support

ALTER TABLE post_comments
  ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS post_comments_parent_idx ON post_comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_actor_idx ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS notifications_post_idx ON notifications(post_id);
CREATE INDEX IF NOT EXISTS notifications_comment_idx ON notifications(comment_id);

CREATE UNIQUE INDEX IF NOT EXISTS notifications_dedupe_uidx
  ON notifications (
    recipient_id,
    actor_id,
    type,
    COALESCE(post_id, 0),
    COALESCE(comment_id, 0)
  );

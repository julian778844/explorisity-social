-- Interactive follower tools, privacy controls, and profile personalization support

ALTER TABLE users ADD COLUMN IF NOT EXISTS show_followers BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_following BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pinned_follower_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS user_follows_created_at_idx ON user_follows(created_at);
CREATE INDEX IF NOT EXISTS user_follows_follower_following_idx ON user_follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS user_follows_following_follower_idx ON user_follows(following_id, follower_id);

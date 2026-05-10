-- Explorisity UI/search/profile fixes

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at);
CREATE INDEX IF NOT EXISTS posts_title_idx ON posts(title);
CREATE INDEX IF NOT EXISTS posts_category_created_idx ON posts(category, created_at);
CREATE INDEX IF NOT EXISTS communities_name_idx ON communities(name);

-- Ensure the app can store sessions if cookie sessions are used.
CREATE TABLE IF NOT EXISTS user_sessions (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  CONSTRAINT user_sessions_pkey PRIMARY KEY (sid)
);
CREATE INDEX IF NOT EXISTS IDX_user_sessions_expire ON user_sessions (expire);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  bio TEXT,
  email VARCHAR(254),
  avatar_color VARCHAR(7) NOT NULL DEFAULT '#7c3aed',
  instagram VARCHAR(200),
  linkedin VARCHAR(200),
  facebook VARCHAR(200),
  twitter VARCHAR(200),
  tiktok VARCHAR(200),
  youtube VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_username_lower_idx ON users(username);

CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_type VARCHAR(16) NOT NULL,
  school_id VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS follows_user_school_uidx ON follows(user_id, school_type, school_id);
CREATE INDEX IF NOT EXISTS follows_user_idx ON follows(user_id);

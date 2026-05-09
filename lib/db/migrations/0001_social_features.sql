CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_follows_uidx ON user_follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_idx ON user_follows(following_id);

CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  school_type VARCHAR(16) NOT NULL,
  school_id VARCHAR(80) NOT NULL,
  name VARCHAR(140) NOT NULL,
  description TEXT,
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS communities_school_uidx ON communities(school_type, school_id);
CREATE INDEX IF NOT EXISTS communities_school_idx ON communities(school_type, school_id);

CREATE TABLE IF NOT EXISTS community_members (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(24) NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_members_uidx ON community_members(community_id, user_id);
CREATE INDEX IF NOT EXISTS community_members_user_idx ON community_members(user_id);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  category VARCHAR(24) NOT NULL DEFAULT 'general',
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS posts_community_idx ON posts(community_id);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  type VARCHAR(16) NOT NULL DEFAULT 'dm',
  name VARCHAR(140),
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS conversations_community_idx ON conversations(community_id);

CREATE TABLE IF NOT EXISTS conversation_members (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS conversation_members_uidx ON conversation_members(conversation_id, user_id);
CREATE INDEX IF NOT EXISTS conversation_members_user_idx ON conversation_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);

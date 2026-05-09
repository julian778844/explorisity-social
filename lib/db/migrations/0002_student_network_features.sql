-- Student networking feature layer for Explorisity

ALTER TABLE users ADD COLUMN IF NOT EXISTS gpa TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sat_score TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS act_score TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mcat_score TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lsat_score TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gmat_score TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intended_major TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS career_goal TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS demographic_background TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_academic_bio BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS student_journey_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  school_id INTEGER,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chance_me_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  school_id INTEGER,
  gpa TEXT,
  test_type TEXT,
  test_score TEXT,
  intended_major TEXT,
  country TEXT,
  demographic_background TEXT,
  estimate_category TEXT,
  estimate_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_social_rankings (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL,
  ranking_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  week_start DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

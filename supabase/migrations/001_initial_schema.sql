-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('school', 'business', 'community')),
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  region      TEXT,
  user_type   TEXT CHECK (user_type IN ('individual', 'school', 'business', 'community')),
  group_id    UUID REFERENCES groups(id) ON DELETE SET NULL,
  points      INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE actions_library (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  co2_saved_kg    DECIMAL(10,2) NOT NULL,
  money_saved_nzd DECIMAL(10,2) NOT NULL,
  points          INTEGER NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_actions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_id  UUID REFERENCES actions_library(id) NOT NULL,
  logged_at  TIMESTAMPTZ DEFAULT NOW(),
  notes      TEXT
);

CREATE TABLE challenges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  group_id    UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_participants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- ─── Functions & Triggers ────────────────────────────────────────────────────

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Award points when an action is logged
CREATE OR REPLACE FUNCTION award_action_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET points = points + (SELECT points FROM actions_library WHERE id = NEW.action_id)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_action_logged
  AFTER INSERT ON user_actions
  FOR EACH ROW EXECUTE FUNCTION award_action_points();

-- ─── Row-Level Security ───────────────────────────────────────────────────────

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions_library     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Public read users"        ON users FOR SELECT USING (true);
CREATE POLICY "Own insert"               ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Own update"               ON users FOR UPDATE USING (auth.uid() = id);

-- groups
CREATE POLICY "Public read groups"       ON groups FOR SELECT USING (true);
CREATE POLICY "Auth insert groups"       ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update groups"      ON groups FOR UPDATE USING (auth.uid() = admin_id);

-- actions_library (read-only for all)
CREATE POLICY "Public read actions"      ON actions_library FOR SELECT USING (true);

-- user_actions
CREATE POLICY "Read own actions"         ON user_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own actions"       ON user_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- challenges
CREATE POLICY "Public read challenges"   ON challenges FOR SELECT USING (true);
CREATE POLICY "Auth insert challenges"   ON challenges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- challenge_participants
CREATE POLICY "Public read participants" ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "Join challenge"           ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Seed Data ────────────────────────────────────────────────────────────────

INSERT INTO actions_library (name, category, co2_saved_kg, money_saved_nzd, points, description) VALUES
  ('Walked instead of short car trip', 'Transport',  1.2,  2.50, 10, 'Skip the car for trips under 2km and walk instead'),
  ('Used reusable shopping bag',       'Waste',      0.1,  0.20,  5, 'Bring your own bag to the supermarket or shops'),
  ('Reduced electricity use today',    'Energy',     0.8,  1.50,  8, 'Turned off lights and used less heating or cooling'),
  ('Saved water (short shower)',       'Water',      0.3,  0.80,  6, 'Kept your shower under 4 minutes'),
  ('Reduced food waste',               'Food',       0.5,  3.00,  8, 'Used up leftovers or planned meals to avoid waste'),
  ('Planted a tree',                   'Nature',    20.0,  0.00, 50, 'Every tree captures CO₂ for a lifetime — great mahi!'),
  ('Took public transport',            'Transport',  2.1,  4.00, 15, 'Bus, train or ferry instead of a private car'),
  ('Composted food scraps',            'Waste',      0.4,  1.00,  7, 'Kept organic waste out of landfill'),
  ('Brought own coffee cup',           'Waste',      0.1,  0.50,  5, 'Avoided a single-use cup at your café'),
  ('Hung washing instead of dryer',    'Energy',     0.6,  1.20,  7, 'Air dried your clothes on a line or rack');

-- Sample active challenge
INSERT INTO challenges (title, description, start_date, end_date, is_active) VALUES
  (
    'May Low-Carbon Week',
    'Log at least 5 climate actions this week and help NZ reach 500kg CO₂ saved together!',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    true
  );

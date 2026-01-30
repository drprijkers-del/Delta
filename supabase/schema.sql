-- Pink Pollos Delta - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Admin users (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'scrum_master' CHECK (role IN ('super_admin', 'scrum_master')),
  password_hash TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  expected_team_size SMALLINT DEFAULT NULL, -- Optional: expected number of team members for participation %
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for team ownership queries
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- Invite links (token_hash stored, never raw token)
CREATE TABLE IF NOT EXISTS invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants (team members via share link)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  nickname TEXT,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, device_id)
);

-- Mood entries
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  mood SMALLINT NOT NULL CHECK (mood >= 1 AND mood <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  entry_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(participant_id, entry_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invite_links_team_id ON invite_links(team_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_token_hash ON invite_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);
CREATE INDEX IF NOT EXISTS idx_participants_device_id ON participants(device_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_team_id ON mood_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_entry_date ON mood_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current admin user ID
CREATE OR REPLACE FUNCTION get_admin_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin users policies
-- Super admin can see all, others only themselves
CREATE POLICY "View admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    is_super_admin()
    OR email = auth.jwt() ->> 'email'
  );

-- Super admin can delete non-super admins
CREATE POLICY "Super admin can delete admin_users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (is_super_admin() AND role != 'super_admin');

-- Allow insert for auto-registration (via service role)
CREATE POLICY "Service can insert admin_users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Teams policies
-- Owners see their own teams, super admin sees all
CREATE POLICY "Owners can manage their teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    is_super_admin()
    OR owner_id = get_admin_user_id()
  )
  WITH CHECK (
    is_super_admin()
    OR owner_id = get_admin_user_id()
  );

CREATE POLICY "Public can read teams by slug"
  ON teams FOR SELECT
  TO anon
  USING (TRUE);

-- Invite links policies
-- Filter by team ownership
CREATE POLICY "Admins can manage their invite_links"
  ON invite_links FOR ALL
  TO authenticated
  USING (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = invite_links.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  )
  WITH CHECK (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = invite_links.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  );

CREATE POLICY "Public can read active invite_links"
  ON invite_links FOR SELECT
  TO anon
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Participants policies
-- Filter by team ownership
CREATE POLICY "Admins can view their participants"
  ON participants FOR SELECT
  TO authenticated
  USING (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = participants.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  );

CREATE POLICY "Public can insert participants via RPC"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (TRUE);

CREATE POLICY "Public can read own participant"
  ON participants FOR SELECT
  TO anon
  USING (TRUE);

-- Mood entries policies
-- Filter by team ownership
CREATE POLICY "Admins can view their mood_entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = mood_entries.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  );

CREATE POLICY "Public can insert mood_entries via RPC"
  ON mood_entries FOR INSERT
  TO anon
  WITH CHECK (TRUE);

CREATE POLICY "Public can read team mood_entries"
  ON mood_entries FOR SELECT
  TO anon
  USING (TRUE);

-- ============================================
-- RPC FUNCTIONS (for public actions)
-- ============================================

-- Validate invite token and return team info
CREATE OR REPLACE FUNCTION validate_invite_token(p_token_hash TEXT)
RETURNS TABLE (
  team_id UUID,
  team_slug TEXT,
  team_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.slug, t.name
  FROM invite_links il
  JOIN teams t ON t.id = il.team_id
  WHERE il.token_hash = p_token_hash
    AND il.is_active = TRUE
    AND (il.expires_at IS NULL OR il.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get or create participant
CREATE OR REPLACE FUNCTION get_or_create_participant(
  p_team_id UUID,
  p_device_id TEXT,
  p_nickname TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_participant_id UUID;
BEGIN
  -- Try to find existing participant
  SELECT id INTO v_participant_id
  FROM participants
  WHERE team_id = p_team_id AND device_id = p_device_id;

  -- If not found, create new
  IF v_participant_id IS NULL THEN
    INSERT INTO participants (team_id, device_id, nickname)
    VALUES (p_team_id, p_device_id, p_nickname)
    RETURNING id INTO v_participant_id;
  ELSE
    -- Update nickname if provided
    IF p_nickname IS NOT NULL THEN
      UPDATE participants
      SET nickname = p_nickname
      WHERE id = v_participant_id;
    END IF;
  END IF;

  RETURN v_participant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit mood check-in
CREATE OR REPLACE FUNCTION submit_mood_checkin(
  p_team_id UUID,
  p_participant_id UUID,
  p_mood SMALLINT,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_entry_id UUID;
  v_already_checked_in BOOLEAN;
BEGIN
  -- Check if already checked in today
  SELECT EXISTS (
    SELECT 1 FROM mood_entries
    WHERE participant_id = p_participant_id
      AND entry_date = CURRENT_DATE
  ) INTO v_already_checked_in;

  IF v_already_checked_in THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Already checked in today'
    );
  END IF;

  -- Insert mood entry
  INSERT INTO mood_entries (team_id, participant_id, mood, comment, entry_date)
  VALUES (p_team_id, p_participant_id, p_mood, p_comment, CURRENT_DATE)
  RETURNING id INTO v_entry_id;

  RETURN json_build_object(
    'success', TRUE,
    'entry_id', v_entry_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team mood stats for today
CREATE OR REPLACE FUNCTION get_team_mood_stats(p_team_id UUID)
RETURNS JSON AS $$
DECLARE
  v_avg_mood NUMERIC;
  v_total_entries INTEGER;
  v_mood_distribution JSON;
BEGIN
  -- Get today's stats
  SELECT
    AVG(mood)::NUMERIC(3,2),
    COUNT(*)::INTEGER
  INTO v_avg_mood, v_total_entries
  FROM mood_entries
  WHERE team_id = p_team_id
    AND entry_date = CURRENT_DATE;

  -- Get mood distribution
  SELECT json_object_agg(mood, count)
  INTO v_mood_distribution
  FROM (
    SELECT mood, COUNT(*)::INTEGER as count
    FROM mood_entries
    WHERE team_id = p_team_id
      AND entry_date = CURRENT_DATE
    GROUP BY mood
  ) sub;

  RETURN json_build_object(
    'average_mood', COALESCE(v_avg_mood, 0),
    'total_entries', COALESCE(v_total_entries, 0),
    'distribution', COALESCE(v_mood_distribution, '{}'::JSON)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get participant streak
CREATE OR REPLACE FUNCTION get_participant_streak(p_participant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_has_entry BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM mood_entries
      WHERE participant_id = p_participant_id
        AND entry_date = v_current_date
    ) INTO v_has_entry;

    EXIT WHEN NOT v_has_entry;

    v_streak := v_streak + 1;
    v_current_date := v_current_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team trend (last 7 days)
CREATE OR REPLACE FUNCTION get_team_trend(p_team_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(day_data ORDER BY entry_date)
    FROM (
      SELECT
        entry_date,
        json_build_object(
          'date', entry_date,
          'average', ROUND(AVG(mood)::NUMERIC, 2),
          'count', COUNT(*)
        ) as day_data
      FROM mood_entries
      WHERE team_id = p_team_id
        AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY entry_date
    ) sub
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute on RPC functions to anon
GRANT EXECUTE ON FUNCTION validate_invite_token TO anon;
GRANT EXECUTE ON FUNCTION get_or_create_participant TO anon;
GRANT EXECUTE ON FUNCTION submit_mood_checkin TO anon;
GRANT EXECUTE ON FUNCTION get_team_mood_stats TO anon;
GRANT EXECUTE ON FUNCTION get_participant_streak TO anon;
GRANT EXECUTE ON FUNCTION get_team_trend TO anon;

-- ============================================
-- MIGRATION: Multi-tenant support
-- Run this section for existing deployments
-- ============================================

-- Add new columns if they don't exist (for migrations)
DO $$
BEGIN
  -- Add role column to admin_users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'scrum_master' CHECK (role IN ('super_admin', 'scrum_master'));
  END IF;

  -- Add password_hash column to admin_users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN password_hash TEXT;
  END IF;

  -- Add last_login_at column to admin_users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;

  -- Add owner_id column to teams
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE teams ADD COLUMN owner_id UUID REFERENCES admin_users(id) ON DELETE CASCADE;
  END IF;

  -- Add expected_team_size column to teams
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'expected_team_size'
  ) THEN
    ALTER TABLE teams ADD COLUMN expected_team_size SMALLINT DEFAULT NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- ============================================
-- SEED: Super Admin
-- Password: 1234 (bcrypt hash)
-- ============================================

-- Insert or update super admin
-- Note: The password hash below is bcrypt hash of "1234"
INSERT INTO admin_users (email, role, password_hash)
VALUES (
  'dennis@pinkpollos.com',
  'super_admin',
  '$2b$10$KIfUG2PHs0YrEDyWsHUN1O2OVVfdRxjMCBdpuetuvkAAlGewbikcC'
)
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  password_hash = '$2b$10$KIfUG2PHs0YrEDyWsHUN1O2OVVfdRxjMCBdpuetuvkAAlGewbikcC';

-- ============================================
-- DELTA SCHEMA
-- Time-boxed Agile intervention tool
-- ============================================

-- Delta session angles (the lens for the intervention)
DO $$ BEGIN
  CREATE TYPE delta_angle AS ENUM (
    'scrum',
    'flow',
    'ownership',
    'collaboration',
    'technical_excellence'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Delta session status
DO $$ BEGIN
  CREATE TYPE delta_status AS ENUM (
    'draft',      -- Created but not started
    'active',     -- Accepting responses
    'closed'      -- Completed, synthesized
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Delta sessions (one per intervention)
CREATE TABLE IF NOT EXISTS delta_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Session identity
  session_code TEXT UNIQUE NOT NULL,  -- Short code for public link: /d/[code]
  angle TEXT NOT NULL,                 -- Using TEXT for flexibility, validated in app
  title TEXT,                          -- Optional custom title

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),

  -- Outcome (set when closed)
  focus_area TEXT,                     -- The ONE thing to focus on
  experiment TEXT,                     -- The ONE experiment to run
  experiment_owner TEXT,               -- Who owns it
  followup_date DATE,                  -- When to check back

  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Delta responses (anonymous team input)
CREATE TABLE IF NOT EXISTS delta_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES delta_sessions(id) ON DELETE CASCADE,

  -- Response data
  answers JSONB NOT NULL,              -- { "statement_id": score, ... }
  device_id TEXT NOT NULL,             -- Anonymous tracking

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One response per device per session
  UNIQUE(session_id, device_id)
);

-- Indexes for Delta
CREATE INDEX IF NOT EXISTS idx_delta_sessions_team_id ON delta_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_delta_sessions_code ON delta_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_delta_sessions_status ON delta_sessions(status);
CREATE INDEX IF NOT EXISTS idx_delta_responses_session_id ON delta_responses(session_id);

-- ============================================
-- DELTA RLS POLICIES
-- ============================================

ALTER TABLE delta_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delta_responses ENABLE ROW LEVEL SECURITY;

-- Session policies (admins manage their team's sessions)
CREATE POLICY "Admins can manage their delta_sessions"
  ON delta_sessions FOR ALL
  TO authenticated
  USING (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = delta_sessions.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  )
  WITH CHECK (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = delta_sessions.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  );

-- Public can read active sessions by code (for participation)
CREATE POLICY "Public can read active delta_sessions"
  ON delta_sessions FOR SELECT
  TO anon
  USING (status = 'active');

-- Response policies (admins view, public inserts)
CREATE POLICY "Admins can view their delta_responses"
  ON delta_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM delta_sessions ds
      JOIN teams t ON t.id = ds.team_id
      WHERE ds.id = delta_responses.session_id
      AND (is_super_admin() OR t.owner_id = get_admin_user_id())
    )
  );

CREATE POLICY "Public can insert delta_responses"
  ON delta_responses FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM delta_sessions
      WHERE id = session_id AND status = 'active'
    )
  );

CREATE POLICY "Public can read own delta_response"
  ON delta_responses FOR SELECT
  TO anon
  USING (TRUE);

-- ============================================
-- DELTA RPC FUNCTIONS
-- ============================================

-- Validate session code and return session info
CREATE OR REPLACE FUNCTION validate_delta_session(p_session_code TEXT)
RETURNS TABLE (
  session_id UUID,
  team_name TEXT,
  angle TEXT,
  title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ds.id, t.name, ds.angle, ds.title
  FROM delta_sessions ds
  JOIN teams t ON t.id = ds.team_id
  WHERE ds.session_code = p_session_code
    AND ds.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit delta response
CREATE OR REPLACE FUNCTION submit_delta_response(
  p_session_id UUID,
  p_device_id TEXT,
  p_answers JSONB
)
RETURNS JSON AS $$
DECLARE
  v_response_id UUID;
  v_session_status TEXT;
  v_already_responded BOOLEAN;
BEGIN
  -- Check session is active
  SELECT status INTO v_session_status
  FROM delta_sessions
  WHERE id = p_session_id;

  IF v_session_status IS NULL THEN
    RETURN json_build_object('success', FALSE, 'error', 'Session not found');
  END IF;

  IF v_session_status != 'active' THEN
    RETURN json_build_object('success', FALSE, 'error', 'Session is not active');
  END IF;

  -- Check if already responded
  SELECT EXISTS (
    SELECT 1 FROM delta_responses
    WHERE session_id = p_session_id AND device_id = p_device_id
  ) INTO v_already_responded;

  IF v_already_responded THEN
    RETURN json_build_object('success', FALSE, 'error', 'Already responded', 'already_responded', TRUE);
  END IF;

  -- Insert response
  INSERT INTO delta_responses (session_id, device_id, answers)
  VALUES (p_session_id, p_device_id, p_answers)
  RETURNING id INTO v_response_id;

  RETURN json_build_object('success', TRUE, 'response_id', v_response_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get session response count
CREATE OR REPLACE FUNCTION get_delta_response_count(p_session_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM delta_responses
    WHERE session_id = p_session_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get session responses for synthesis (admin only, called via service role)
CREATE OR REPLACE FUNCTION get_delta_responses(p_session_id UUID)
RETURNS TABLE (
  answers JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT dr.answers, dr.created_at
  FROM delta_responses dr
  WHERE dr.session_id = p_session_id
  ORDER BY dr.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate unique session code
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-char alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));

    -- Check if exists
    SELECT EXISTS (
      SELECT 1 FROM delta_sessions WHERE session_code = v_code
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on Delta functions
GRANT EXECUTE ON FUNCTION validate_delta_session TO anon;
GRANT EXECUTE ON FUNCTION submit_delta_response TO anon;
GRANT EXECUTE ON FUNCTION get_delta_response_count TO anon;
GRANT EXECUTE ON FUNCTION get_delta_responses TO authenticated;
GRANT EXECUTE ON FUNCTION generate_session_code TO authenticated;

-- ============================================================================
-- BACKLOG ITEMS & RELEASE NOTES
-- Shared between Delta and Pulse, managed by Super Admin
-- ============================================================================

-- Product types for backlog items and release notes
CREATE TYPE product_type AS ENUM ('delta', 'pulse', 'shared');

-- Backlog categories
CREATE TYPE backlog_category AS ENUM ('ux', 'statements', 'analytics', 'integration', 'features');

-- Backlog status
CREATE TYPE backlog_status AS ENUM ('review', 'exploring', 'decided');

-- Backlog decision (when status = decided)
CREATE TYPE backlog_decision AS ENUM ('building', 'not_doing');

-- Backlog items table
CREATE TABLE backlog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product product_type NOT NULL DEFAULT 'delta',
  category backlog_category NOT NULL,
  status backlog_status NOT NULL DEFAULT 'review',
  decision backlog_decision,

  -- Multilingual content
  title_nl TEXT NOT NULL,
  title_en TEXT NOT NULL,
  source_nl TEXT NOT NULL,
  source_en TEXT NOT NULL,
  our_take_nl TEXT NOT NULL,
  our_take_en TEXT NOT NULL,
  rationale_nl TEXT,
  rationale_en TEXT,

  -- Dates
  reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  decided_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure decision is set when status is 'decided'
  CONSTRAINT decision_required_when_decided CHECK (
    (status = 'decided' AND decision IS NOT NULL) OR
    (status != 'decided' AND decision IS NULL)
  )
);

-- Release notes table
CREATE TABLE release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product product_type NOT NULL DEFAULT 'delta',
  version TEXT NOT NULL,

  -- Multilingual content
  title_nl TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_nl TEXT NOT NULL,
  description_en TEXT NOT NULL,

  -- What changed (list of changes as JSON array)
  changes JSONB NOT NULL DEFAULT '[]',

  -- Dates
  released_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_backlog_items_product ON backlog_items(product);
CREATE INDEX idx_backlog_items_status ON backlog_items(status);
CREATE INDEX idx_backlog_items_category ON backlog_items(category);
CREATE INDEX idx_release_notes_product ON release_notes(product);
CREATE INDEX idx_release_notes_released_at ON release_notes(released_at DESC);

-- Enable RLS
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backlog_items
-- Public can view all items (for the backlog page)
CREATE POLICY "backlog_items_public_read" ON backlog_items
  FOR SELECT
  USING (true);

-- Only super_admin can insert/update/delete
CREATE POLICY "backlog_items_super_admin_insert" ON backlog_items
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "backlog_items_super_admin_update" ON backlog_items
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "backlog_items_super_admin_delete" ON backlog_items
  FOR DELETE
  USING (is_super_admin());

-- RLS Policies for release_notes
-- Public can view all release notes
CREATE POLICY "release_notes_public_read" ON release_notes
  FOR SELECT
  USING (true);

-- Only super_admin can insert/update/delete
CREATE POLICY "release_notes_super_admin_insert" ON release_notes
  FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "release_notes_super_admin_update" ON release_notes
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "release_notes_super_admin_delete" ON release_notes
  FOR DELETE
  USING (is_super_admin());

-- Grant permissions
GRANT SELECT ON backlog_items TO anon;
GRANT SELECT ON backlog_items TO authenticated;
GRANT ALL ON backlog_items TO authenticated;

GRANT SELECT ON release_notes TO anon;
GRANT SELECT ON release_notes TO authenticated;
GRANT ALL ON release_notes TO authenticated;

-- Updated_at trigger for backlog_items
CREATE TRIGGER update_backlog_items_updated_at
  BEFORE UPDATE ON backlog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Updated_at trigger for release_notes
CREATE TRIGGER update_release_notes_updated_at
  BEFORE UPDATE ON release_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

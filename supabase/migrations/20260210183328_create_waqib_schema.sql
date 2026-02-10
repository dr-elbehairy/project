/*
  # WAQIB Platform - Complete Database Schema

  1. New Tables
    - `universities` - Stores university information
      - `id` (uuid, primary key)
      - `name` (text) - University name
      - `country` (text) - Country location
      - `type` (text) - public/private
      - `size` (text) - small/medium/large
      - `created_at` (timestamptz)

    - `profiles` - Extended user profiles linked to auth.users
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (text) - admin/university_user/reviewer
      - `university_id` (uuid, nullable, references universities)
      - `full_name` (text)
      - `contact_person` (text)
      - `onboarding_completed` (boolean)
      - `created_at` (timestamptz)

    - `programs` - Academic programs
      - `id` (uuid, primary key)
      - `university_id` (uuid, references universities)
      - `name` (text)
      - `name_ar` (text) - Arabic name
      - `degree_level` (text)
      - `discipline` (text)
      - `mode` (text) - teaching/research/hybrid
      - `description` (text)
      - `status` (text) - active/archived/draft
      - `created_at` (timestamptz)

    - `courses` - Courses within programs
      - `id` (uuid, primary key)
      - `program_id` (uuid, references programs)
      - `code` (text)
      - `title` (text)
      - `title_ar` (text) - Arabic title
      - `description` (text)
      - `credits` (integer)
      - `level` (text) - basic/applied/advanced
      - `semester` (integer)
      - `category` (text) - core/elective
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `skill_library` - Master skill library
      - `id` (uuid, primary key)
      - `name` (text)
      - `name_ar` (text)
      - `cluster` (text) - market_skills/core_academic/future_skills/soft_skills
      - `description` (text)
      - `source` (text) - CC2020/CS2023/ABET/WEF/OECD
      - `keywords` (text[]) - Keywords for matching
      - `weight_default` (numeric)
      - `created_at` (timestamptz)

    - `benchmark_universities` - Reference benchmark universities
      - `id` (uuid, primary key)
      - `name` (text)
      - `country` (text)
      - `ranking_source` (text) - QS/Shanghai/GlobalTop5/SectorLeaders
      - `discipline` (text)
      - `skill_profile_json` (jsonb)
      - `created_at` (timestamptz)

    - `scoring_weights` - Configurable scoring weights
      - `id` (uuid, primary key)
      - `name` (text)
      - `market_skills_weight` (numeric)
      - `core_skills_weight` (numeric)
      - `future_skills_weight` (numeric)
      - `soft_skills_weight` (numeric)
      - `wai_top_weight` (numeric)
      - `is_default` (boolean)
      - `created_at` (timestamptz)

    - `analyses` - Analysis runs
      - `id` (uuid, primary key)
      - `program_id` (uuid, references programs)
      - `created_by` (uuid, references auth.users)
      - `benchmark_source` (text)
      - `benchmark_university_id` (uuid, nullable)
      - `program_mode` (text)
      - `status` (text) - pending/completed/failed
      - `created_at` (timestamptz)

    - `analysis_results` - Results from analysis runs
      - `id` (uuid, primary key)
      - `analysis_id` (uuid, references analyses)
      - `wai_score` (numeric)
      - `market_skills_score` (numeric)
      - `core_skills_score` (numeric)
      - `future_skills_score` (numeric)
      - `soft_skills_score` (numeric)
      - `coverage_score_json` (jsonb)
      - `gap_summary_json` (jsonb)
      - `redundancy_score` (numeric)
      - `theory_practice_ratio` (jsonb)
      - `depth_profile_json` (jsonb)
      - `created_at` (timestamptz)

    - `recommendations` - Generated recommendations
      - `id` (uuid, primary key)
      - `analysis_id` (uuid, references analyses)
      - `type` (text)
      - `title` (text)
      - `title_ar` (text)
      - `description` (text)
      - `priority` (text)
      - `linked_skill_ids` (uuid[])
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated access based on role and university ownership
*/

-- Universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'public',
  size text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'university_user',
  university_id uuid REFERENCES universities(id),
  full_name text NOT NULL DEFAULT '',
  contact_person text NOT NULL DEFAULT '',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  degree_level text NOT NULL DEFAULT 'bachelor',
  discipline text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'teaching',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  code text NOT NULL DEFAULT '',
  title text NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  credits integer NOT NULL DEFAULT 3,
  level text NOT NULL DEFAULT 'basic',
  semester integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'core',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Skill library table
CREATE TABLE IF NOT EXISTS skill_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  cluster text NOT NULL DEFAULT 'core_academic',
  description text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'CC2020',
  keywords text[] DEFAULT '{}',
  weight_default numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skill_library ENABLE ROW LEVEL SECURITY;

-- Benchmark universities table
CREATE TABLE IF NOT EXISTS benchmark_universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL DEFAULT '',
  ranking_source text NOT NULL DEFAULT 'QS',
  discipline text NOT NULL DEFAULT '',
  skill_profile_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_universities ENABLE ROW LEVEL SECURITY;

-- Scoring weights table
CREATE TABLE IF NOT EXISTS scoring_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Default',
  market_skills_weight numeric NOT NULL DEFAULT 30,
  core_skills_weight numeric NOT NULL DEFAULT 20,
  future_skills_weight numeric NOT NULL DEFAULT 10,
  soft_skills_weight numeric NOT NULL DEFAULT 10,
  wai_top_weight numeric NOT NULL DEFAULT 40,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scoring_weights ENABLE ROW LEVEL SECURITY;

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  benchmark_source text NOT NULL DEFAULT 'QS',
  benchmark_university_id uuid REFERENCES benchmark_universities(id),
  program_mode text NOT NULL DEFAULT 'teaching',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  wai_score numeric NOT NULL DEFAULT 0,
  market_skills_score numeric NOT NULL DEFAULT 0,
  core_skills_score numeric NOT NULL DEFAULT 0,
  future_skills_score numeric NOT NULL DEFAULT 0,
  soft_skills_score numeric NOT NULL DEFAULT 0,
  coverage_score_json jsonb NOT NULL DEFAULT '{}',
  gap_summary_json jsonb NOT NULL DEFAULT '[]',
  redundancy_score numeric NOT NULL DEFAULT 0,
  theory_practice_ratio jsonb NOT NULL DEFAULT '{}',
  depth_profile_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'missing_skill',
  title text NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  linked_skill_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- UNIVERSITIES policies
CREATE POLICY "Authenticated users can view universities"
  ON universities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert universities"
  ON universities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update universities"
  ON universities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "University users can insert own university"
  ON universities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'university_user'
    )
  );

-- PROGRAMS policies
CREATE POLICY "Users can view programs of their university"
  ON programs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR university_id = programs.university_id)
    )
  );

CREATE POLICY "University users can insert programs"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND university_id = programs.university_id
    )
  );

CREATE POLICY "University users can update own programs"
  ON programs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND university_id = programs.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND university_id = programs.university_id
    )
  );

CREATE POLICY "University users can delete own programs"
  ON programs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND university_id = programs.university_id
    )
  );

CREATE POLICY "Admins can manage all programs"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all programs"
  ON programs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete all programs"
  ON programs FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- COURSES policies
CREATE POLICY "Users can view courses of their programs"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      JOIN profiles pr ON pr.id = auth.uid()
      WHERE p.id = courses.program_id AND (pr.role = 'admin' OR pr.university_id = p.university_id)
    )
  );

CREATE POLICY "University users can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs p
      JOIN profiles pr ON pr.id = auth.uid()
      WHERE p.id = courses.program_id AND pr.university_id = p.university_id
    )
  );

CREATE POLICY "University users can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      JOIN profiles pr ON pr.id = auth.uid()
      WHERE p.id = courses.program_id AND (pr.role = 'admin' OR pr.university_id = p.university_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs p
      JOIN profiles pr ON pr.id = auth.uid()
      WHERE p.id = courses.program_id AND (pr.role = 'admin' OR pr.university_id = p.university_id)
    )
  );

CREATE POLICY "University users can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      JOIN profiles pr ON pr.id = auth.uid()
      WHERE p.id = courses.program_id AND (pr.role = 'admin' OR pr.university_id = p.university_id)
    )
  );

-- SKILL LIBRARY policies
CREATE POLICY "Authenticated users can view skills"
  ON skill_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert skills"
  ON skill_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update skills"
  ON skill_library FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete skills"
  ON skill_library FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- BENCHMARK UNIVERSITIES policies
CREATE POLICY "Authenticated users can view benchmarks"
  ON benchmark_universities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert benchmarks"
  ON benchmark_universities FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update benchmarks"
  ON benchmark_universities FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete benchmarks"
  ON benchmark_universities FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SCORING WEIGHTS policies
CREATE POLICY "Authenticated users can view scoring weights"
  ON scoring_weights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert scoring weights"
  ON scoring_weights FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update scoring weights"
  ON scoring_weights FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ANALYSES policies
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM programs p
      JOIN profiles pr ON pr.id = auth.uid()
      WHERE p.id = analyses.program_id AND pr.university_id = p.university_id
    )
  );

CREATE POLICY "Authenticated users can insert analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ANALYSIS RESULTS policies
CREATE POLICY "Users can view analysis results"
  ON analysis_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM analyses a
      WHERE a.id = analysis_results.analysis_id AND (
        a.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
        EXISTS (
          SELECT 1 FROM programs p
          JOIN profiles pr ON pr.id = auth.uid()
          WHERE p.id = a.program_id AND pr.university_id = p.university_id
        )
      )
    )
  );

CREATE POLICY "System can insert analysis results"
  ON analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analyses a WHERE a.id = analysis_results.analysis_id AND a.created_by = auth.uid()
    )
  );

-- RECOMMENDATIONS policies
CREATE POLICY "Users can view recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM analyses a
      WHERE a.id = recommendations.analysis_id AND (
        a.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
        EXISTS (
          SELECT 1 FROM programs p
          JOIN profiles pr ON pr.id = auth.uid()
          WHERE p.id = a.program_id AND pr.university_id = p.university_id
        )
      )
    )
  );

CREATE POLICY "System can insert recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analyses a WHERE a.id = recommendations.analysis_id AND a.created_by = auth.uid()
    )
  );

-- Create a function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, onboarding_completed)
  VALUES (NEW.id, NEW.email, 'university_user', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Insert default scoring weights
INSERT INTO scoring_weights (name, market_skills_weight, core_skills_weight, future_skills_weight, soft_skills_weight, wai_top_weight, is_default)
VALUES ('Default Weights', 30, 20, 10, 10, 40, true)
ON CONFLICT DO NOTHING;

/*
# AI-Powered Learning Platform Schema

This migration creates a comprehensive learning platform with:

1. New Tables
   - `user_profiles` - Enhanced user profiles with learning preferences
   - `chapters` - Dynamic chapter management per class
   - `diagnostic_tests` - Chapter-specific diagnostic tests
   - `diagnostic_results` - Test results and analysis
   - `learning_roadmaps` - AI-generated personalized roadmaps
   - `study_content` - Personalized study materials
   - `practice_questions` - AI-generated practice questions
   - `user_progress` - Detailed progress tracking
   - `regular_assessments` - Interval-based tests
   - `learning_analytics` - Comprehensive analytics

2. Security
   - RLS enabled on all tables
   - User-specific access policies

3. Features
   - Dynamic chapter unlocking
   - AI-powered content generation
   - Continuous progress analysis
   - Personalized roadmap updates
*/

-- Enhanced user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  class_level integer NOT NULL CHECK (class_level >= 1 AND class_level <= 12),
  current_chapter_id text,
  total_coins integer DEFAULT 0,
  total_questions_solved integer DEFAULT 0,
  total_correct_answers integer DEFAULT 0,
  overall_accuracy decimal(5,2) DEFAULT 0,
  learning_preferences jsonb DEFAULT '{}',
  unlocked_chapters text[] DEFAULT '{}',
  completed_chapters text[] DEFAULT '{}',
  avatar_id integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dynamic chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id text PRIMARY KEY,
  class_level integer NOT NULL CHECK (class_level >= 1 AND class_level <= 12),
  chapter_name text NOT NULL,
  chapter_number integer NOT NULL,
  description text,
  prerequisite_concepts text[] DEFAULT '{}',
  learning_objectives text[] DEFAULT '{}',
  estimated_duration_hours integer DEFAULT 10,
  unlock_requirements jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_level, chapter_number)
);

-- Diagnostic tests table
CREATE TABLE IF NOT EXISTS diagnostic_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id text NOT NULL REFERENCES chapters(id),
  test_name text NOT NULL,
  prerequisite_concepts text[] NOT NULL,
  total_questions integer DEFAULT 15,
  time_limit_minutes integer DEFAULT 30,
  difficulty_distribution jsonb DEFAULT '{"easy": 40, "medium": 40, "hard": 20}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Diagnostic results table
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text NOT NULL REFERENCES chapters(id),
  test_id uuid NOT NULL REFERENCES diagnostic_tests(id),
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  score_percentage decimal(5,2) NOT NULL,
  time_taken_minutes integer NOT NULL,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  knowledge_gaps text[] DEFAULT '{}',
  prerequisite_gaps text[] DEFAULT '{}',
  difficulty_analysis jsonb DEFAULT '{}',
  ai_analysis text,
  completed_at timestamptz DEFAULT now()
);

-- Learning roadmaps table
CREATE TABLE IF NOT EXISTS learning_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text NOT NULL REFERENCES chapters(id),
  diagnostic_result_id uuid REFERENCES diagnostic_results(id),
  roadmap_data jsonb NOT NULL,
  focus_areas text[] NOT NULL,
  improvement_plan text[] NOT NULL,
  estimated_completion_days integer DEFAULT 14,
  current_step integer DEFAULT 0,
  total_steps integer NOT NULL,
  completion_percentage decimal(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Study content table
CREATE TABLE IF NOT EXISTS study_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text NOT NULL REFERENCES chapters(id),
  roadmap_id uuid REFERENCES learning_roadmaps(id),
  content_type text NOT NULL, -- explanation, example, practice, summary
  topic text NOT NULL,
  difficulty_level text NOT NULL, -- beginner, intermediate, advanced
  content_data jsonb NOT NULL,
  ai_generated_content text NOT NULL,
  personalization_factors jsonb DEFAULT '{}',
  usage_count integer DEFAULT 0,
  effectiveness_rating decimal(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Practice questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text NOT NULL REFERENCES chapters(id),
  roadmap_id uuid REFERENCES learning_roadmaps(id),
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice',
  options jsonb,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  difficulty text NOT NULL,
  concept text NOT NULL,
  personalization_level text DEFAULT 'standard', -- basic, standard, advanced
  ai_generation_prompt text,
  times_attempted integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User progress tracking table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text NOT NULL REFERENCES chapters(id),
  roadmap_id uuid REFERENCES learning_roadmaps(id),
  concept text NOT NULL,
  mastery_level decimal(3,2) DEFAULT 0, -- 0.0 to 1.0
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  last_practiced_at timestamptz,
  improvement_trend text DEFAULT 'stable', -- improving, stable, declining
  next_review_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chapter_id, concept)
);

-- Regular assessments table
CREATE TABLE IF NOT EXISTS regular_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text NOT NULL REFERENCES chapters(id),
  assessment_type text NOT NULL, -- weekly, concept_check, progress_test
  questions_data jsonb NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  score_percentage decimal(5,2) NOT NULL,
  time_taken_minutes integer NOT NULL,
  concepts_tested text[] NOT NULL,
  performance_analysis jsonb DEFAULT '{}',
  ai_feedback text,
  roadmap_updates jsonb DEFAULT '{}',
  completed_at timestamptz DEFAULT now()
);

-- Learning analytics table
CREATE TABLE IF NOT EXISTS learning_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id text,
  analytics_type text NOT NULL, -- daily, weekly, chapter, overall
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metrics jsonb NOT NULL,
  insights text,
  recommendations text[] DEFAULT '{}',
  trend_analysis jsonb DEFAULT '{}',
  ai_insights text,
  created_at timestamptz DEFAULT now()
);

-- Question attempts tracking
CREATE TABLE IF NOT EXISTS question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid,
  chapter_id text REFERENCES chapters(id),
  question_text text NOT NULL,
  user_answer text,
  correct_answer text NOT NULL,
  is_correct boolean NOT NULL,
  attempt_number integer DEFAULT 1,
  time_taken_seconds integer DEFAULT 0,
  hint_used boolean DEFAULT false,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
  session_id uuid,
  attempted_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE regular_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for chapters (public read)
CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for diagnostic_tests (public read)
CREATE POLICY "Anyone can read diagnostic tests"
  ON diagnostic_tests FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for diagnostic_results
CREATE POLICY "Users can read own diagnostic results"
  ON diagnostic_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic results"
  ON diagnostic_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_roadmaps
CREATE POLICY "Users can read own roadmaps"
  ON learning_roadmaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps"
  ON learning_roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps"
  ON learning_roadmaps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_content
CREATE POLICY "Users can read own study content"
  ON study_content FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study content"
  ON study_content FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for practice_questions
CREATE POLICY "Users can read own practice questions"
  ON practice_questions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice questions"
  ON practice_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for regular_assessments
CREATE POLICY "Users can read own assessments"
  ON regular_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON regular_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_analytics
CREATE POLICY "Users can read own analytics"
  ON learning_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON learning_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for question_attempts
CREATE POLICY "Users can read own question attempts"
  ON question_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question attempts"
  ON question_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_class_level ON user_profiles(class_level);
CREATE INDEX IF NOT EXISTS idx_chapters_class_level ON chapters(class_level, chapter_number);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user_chapter ON diagnostic_results(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_user_id ON learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_chapter ON user_progress(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_regular_assessments_user_id ON regular_assessments(user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default chapters for different classes
INSERT INTO chapters (id, class_level, chapter_name, chapter_number, description, prerequisite_concepts, learning_objectives) VALUES
-- Class 6
('class6_ch1', 6, 'Knowing Our Numbers', 1, 'Understanding large numbers, place value, and number operations', '{"basic_arithmetic", "place_value", "number_recognition"}', '{"read_large_numbers", "compare_numbers", "round_numbers"}'),
('class6_ch2', 6, 'Whole Numbers', 2, 'Properties and operations with whole numbers', '{"basic_addition", "basic_subtraction", "number_line"}', '{"whole_number_properties", "number_line_operations", "patterns"}'),
('class6_ch3', 6, 'Playing with Numbers', 3, 'Factors, multiples, divisibility rules', '{"multiplication_tables", "division_basics"}', '{"find_factors", "find_multiples", "divisibility_rules"}'),

-- Class 7
('class7_ch1', 7, 'Integers', 1, 'Understanding positive and negative numbers', '{"whole_numbers", "number_line", "basic_operations"}', '{"integer_operations", "number_line_with_negatives", "real_world_applications"}'),
('class7_ch2', 7, 'Fractions and Decimals', 2, 'Operations with fractions and decimals', '{"basic_fractions", "decimal_notation", "equivalent_fractions"}', '{"fraction_operations", "decimal_operations", "conversion_between_forms"}'),
('class7_ch3', 7, 'Data Handling', 3, 'Collection, organization and interpretation of data', '{"basic_counting", "simple_graphs"}', '{"data_collection", "bar_graphs", "pie_charts", "mean_median_mode"}'),

-- Class 8
('class8_ch1', 8, 'Rational Numbers', 1, 'Understanding and operations with rational numbers', '{"integers", "fractions", "decimals"}', '{"rational_number_operations", "number_line_representation", "properties"}'),
('class8_ch2', 8, 'Linear Equations in One Variable', 2, 'Solving linear equations', '{"basic_algebra", "integers", "fractions"}', '{"solve_linear_equations", "word_problems", "verification"}'),
('class8_ch3', 8, 'Understanding Quadrilaterals', 3, 'Properties of quadrilaterals', '{"basic_geometry", "angles", "triangles"}', '{"quadrilateral_properties", "angle_sum", "special_quadrilaterals"}'),

-- Class 9
('class9_ch1', 9, 'Number Systems', 1, 'Real numbers, rational and irrational numbers', '{"rational_numbers", "decimals", "square_roots"}', '{"classify_real_numbers", "operations_with_surds", "rationalization"}'),
('class9_ch2', 9, 'Polynomials', 2, 'Understanding polynomials and their operations', '{"algebraic_expressions", "linear_equations"}', '{"polynomial_operations", "factorization", "remainder_theorem"}'),
('class9_ch3', 9, 'Coordinate Geometry', 3, 'Cartesian plane and coordinate systems', '{"number_line", "basic_geometry", "plotting_points"}', '{"coordinate_plane", "distance_formula", "section_formula"}'),

-- Class 10
('class10_ch1', 10, 'Real Numbers', 1, 'Euclids division lemma, fundamental theorem of arithmetic', '{"number_systems", "factors_multiples", "prime_factorization"}', '{"euclids_algorithm", "fundamental_theorem", "decimal_expansions"}'),
('class10_ch2', 10, 'Polynomials', 2, 'Polynomials and their zeros', '{"class9_polynomials", "factorization", "algebraic_identities"}', '{"relationship_between_zeros_coefficients", "division_algorithm"}'),
('class10_ch3', 10, 'Pair of Linear Equations in Two Variables', 3, 'Systems of linear equations', '{"linear_equations_one_variable", "coordinate_geometry"}', '{"graphical_method", "substitution_method", "elimination_method"}')

ON CONFLICT (id) DO NOTHING;

-- Insert diagnostic tests for chapters
INSERT INTO diagnostic_tests (chapter_id, test_name, prerequisite_concepts) VALUES
('class6_ch1', 'Numbers Foundation Test', '{"counting", "basic_arithmetic", "place_value"}'),
('class6_ch3', 'Factors and Multiples Readiness', '{"multiplication_tables", "division_basics", "number_patterns"}'),
('class7_ch1', 'Integer Readiness Test', '{"whole_numbers", "number_line", "basic_operations"}'),
('class8_ch1', 'Rational Numbers Foundation', '{"integers", "fractions", "decimals", "number_line"}'),
('class9_ch1', 'Number Systems Readiness', '{"rational_numbers", "square_roots", "decimal_operations"}'),
('class10_ch1', 'Real Numbers Foundation', '{"number_systems", "prime_factorization", "hcf_lcm"}')
ON CONFLICT DO NOTHING;
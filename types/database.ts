export type UserRole = 'admin' | 'university_user' | 'reviewer';
export type ProgramMode = 'teaching' | 'research' | 'hybrid';
export type ProgramStatus = 'active' | 'archived' | 'draft';
export type CourseLevel = 'basic' | 'applied' | 'advanced';
export type CourseCategory = 'core' | 'elective';
export type SkillCluster = 'market_skills' | 'core_academic' | 'future_skills' | 'soft_skills';
export type AnalysisStatus = 'pending' | 'completed' | 'failed';
export type BenchmarkSource = 'QS' | 'Shanghai' | 'GlobalTop5' | 'SectorLeaders';
export type RecommendationType = 'micro_module' | 'missing_skill' | 'certification' | 'curriculum_change';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface University {
  id: string;
  name: string;
  country: string;
  type: string;
  size: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  university_id: string | null;
  full_name: string;
  contact_person: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  university_id: string;
  name: string;
  name_ar: string;
  degree_level: string;
  discipline: string;
  mode: ProgramMode;
  description: string;
  status: ProgramStatus;
  created_at: string;
}

export interface Course {
  id: string;
  program_id: string;
  code: string;
  title: string;
  title_ar: string;
  description: string;
  credits: number;
  level: CourseLevel;
  semester: number;
  category: CourseCategory;
  is_active: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  name_ar: string;
  cluster: SkillCluster;
  description: string;
  source: string;
  keywords: string[];
  weight_default: number;
  created_at: string;
}

export interface BenchmarkUniversity {
  id: string;
  name: string;
  country: string;
  ranking_source: BenchmarkSource;
  discipline: string;
  skill_profile_json: Record<string, number>;
  created_at: string;
}

export interface ScoringWeights {
  id: string;
  name: string;
  market_skills_weight: number;
  core_skills_weight: number;
  future_skills_weight: number;
  soft_skills_weight: number;
  wai_top_weight: number;
  is_default: boolean;
  created_at: string;
}

export interface Analysis {
  id: string;
  program_id: string;
  created_by: string;
  benchmark_source: BenchmarkSource;
  benchmark_university_id: string | null;
  program_mode: ProgramMode;
  status: AnalysisStatus;
  university_name?: string;
  discipline_name?: string;
  model?: string;
  filename?: string;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  analysis_id: string;
  wai_score: number;
  market_skills_score: number;
  core_skills_score: number;
  future_skills_score: number;
  soft_skills_score: number;
  coverage_score_json: Record<string, number>;
  gap_summary_json: GapItem[];
  redundancy_score: number;
  theory_practice_ratio: { theory: number; practice: number };
  depth_profile_json: Record<string, number>;
  created_at: string;
}

export interface GapItem {
  skill_id: string;
  skill_name: string;
  cluster: SkillCluster;
  coverage: number;
  benchmark_expected: number;
  gap: number;
}

export interface Recommendation {
  id: string;
  analysis_id: string;
  type: RecommendationType;
  title: string;
  title_ar: string;
  description: string;
  priority: Priority;
  linked_skill_ids: string[];
  created_at: string;
}

export interface AnalysisWithRelations extends Analysis {
  program?: Program;
  analysis_results?: AnalysisResult[];
  recommendations?: Recommendation[];
}

export interface ProgramWithCourses extends Program {
  courses?: Course[];
  university?: University;
}

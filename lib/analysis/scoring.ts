import type { Course, Skill, ScoringWeights, BenchmarkUniversity, GapItem, ProgramMode, SkillCluster } from '@/types/database';
import { buildProgramSkillVector, detectRedundancy } from './skill-extraction';
import { cosineSimilarity, computeCoverageByCluster } from './similarity';

export interface AnalysisInput {
  courses: Course[];
  skills: Skill[];
  benchmark: BenchmarkUniversity;
  weights: ScoringWeights;
  programMode: ProgramMode;
}

export interface AnalysisOutput {
  waiScore: number;
  marketSkillsScore: number;
  coreSkillsScore: number;
  futureSkillsScore: number;
  softSkillsScore: number;
  coverageScoreJson: Record<string, number>;
  gapSummaryJson: GapItem[];
  redundancyScore: number;
  theoryPracticeRatio: { theory: number; practice: number };
  depthProfileJson: Record<string, number>;
  redundantCourses: { course1: string; course2: string; overlap: number }[];
}

function getModeMultipliers(mode: ProgramMode) {
  switch (mode) {
    case 'research':
      return { theory: 1.2, practice: 0.8, future: 1.3, market: 0.7 };
    case 'hybrid':
      return { theory: 1.0, practice: 1.0, future: 1.1, market: 0.9 };
    case 'teaching':
    default:
      return { theory: 0.8, practice: 1.2, future: 0.9, market: 1.3 };
  }
}

export function runAnalysis(input: AnalysisInput): AnalysisOutput {
  const { courses, skills, benchmark, weights, programMode } = input;
  const activeCourses = courses.filter(c => c.is_active);
  const modeMultipliers = getModeMultipliers(programMode);

  const programVector = buildProgramSkillVector(activeCourses, skills);
  const benchmarkVector = benchmark.skill_profile_json;

  const overallSimilarity = cosineSimilarity(programVector, benchmarkVector);
  const coverageByCluster = computeCoverageByCluster(programVector, skills);

  const marketSkillsRaw = coverageByCluster['market_skills'] || 0;
  const coreSkillsRaw = coverageByCluster['core_academic'] || 0;
  const futureSkillsRaw = coverageByCluster['future_skills'] || 0;
  const softSkillsRaw = coverageByCluster['soft_skills'] || 0;

  const marketSkillsScore = Math.min(Math.round(marketSkillsRaw * modeMultipliers.market), 100);
  const coreSkillsScore = Math.min(Math.round(coreSkillsRaw), 100);
  const futureSkillsScore = Math.min(Math.round(futureSkillsRaw * modeMultipliers.future), 100);
  const softSkillsScore = Math.min(Math.round(softSkillsRaw), 100);

  const totalWeight =
    weights.market_skills_weight +
    weights.core_skills_weight +
    weights.future_skills_weight +
    weights.soft_skills_weight;

  const clusterComposite =
    (marketSkillsScore * weights.market_skills_weight +
      coreSkillsScore * weights.core_skills_weight +
      futureSkillsScore * weights.future_skills_weight +
      softSkillsScore * weights.soft_skills_weight) /
    totalWeight;

  const similarityComponent = overallSimilarity * 100;
  const waiScore = Math.round(
    (clusterComposite * (100 - weights.wai_top_weight) +
      similarityComponent * weights.wai_top_weight) /
    100
  );

  const gaps = computeGaps(programVector, benchmarkVector, skills);
  const redundantCourses = detectRedundancy(activeCourses, skills);
  const redundancyScore = redundantCourses.length > 0
    ? Math.round(redundantCourses.reduce((sum, r) => sum + r.overlap, 0) / redundantCourses.length * 100)
    : 0;

  const depthProfile = computeDepthProfile(activeCourses);
  const theoryPracticeRatio = computeTheoryPracticeRatio(activeCourses);

  return {
    waiScore: Math.max(0, Math.min(100, waiScore)),
    marketSkillsScore,
    coreSkillsScore,
    futureSkillsScore,
    softSkillsScore,
    coverageScoreJson: coverageByCluster,
    gapSummaryJson: gaps,
    redundancyScore,
    theoryPracticeRatio,
    depthProfileJson: depthProfile,
    redundantCourses,
  };
}

function computeGaps(
  programVector: Record<string, number>,
  benchmarkVector: Record<string, number>,
  skills: Skill[]
): GapItem[] {
  const gaps: GapItem[] = [];

  for (const skill of skills) {
    const coverage = programVector[skill.id] || 0;
    const expected = benchmarkVector[skill.id] || 0;

    if (expected > 0 && coverage < expected * 0.7) {
      gaps.push({
        skill_id: skill.id,
        skill_name: skill.name,
        cluster: skill.cluster as SkillCluster,
        coverage: Math.round(coverage * 100),
        benchmark_expected: Math.round(expected * 100),
        gap: Math.round((expected - coverage) * 100),
      });
    }
  }

  return gaps.sort((a, b) => b.gap - a.gap).slice(0, 20);
}

function computeDepthProfile(courses: Course[]): Record<string, number> {
  const profile: Record<string, number> = { basic: 0, applied: 0, advanced: 0 };
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  if (totalCredits === 0) return { basic: 33, applied: 34, advanced: 33 };

  for (const course of courses) {
    profile[course.level] = (profile[course.level] || 0) + course.credits;
  }

  return {
    basic: Math.round((profile.basic / totalCredits) * 100),
    applied: Math.round((profile.applied / totalCredits) * 100),
    advanced: Math.round((profile.advanced / totalCredits) * 100),
  };
}

function computeTheoryPracticeRatio(courses: Course[]): { theory: number; practice: number } {
  let theoryCredits = 0;
  let practiceCredits = 0;

  for (const course of courses) {
    if (course.level === 'basic' || course.category === 'core') {
      theoryCredits += course.credits * 0.7;
      practiceCredits += course.credits * 0.3;
    } else if (course.level === 'applied') {
      theoryCredits += course.credits * 0.4;
      practiceCredits += course.credits * 0.6;
    } else {
      theoryCredits += course.credits * 0.5;
      practiceCredits += course.credits * 0.5;
    }
  }

  const total = theoryCredits + practiceCredits;
  if (total === 0) return { theory: 50, practice: 50 };

  return {
    theory: Math.round((theoryCredits / total) * 100),
    practice: Math.round((practiceCredits / total) * 100),
  };
}

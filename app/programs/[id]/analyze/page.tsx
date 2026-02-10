'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/db/auth-context';
import { supabase } from '@/lib/db/supabase-client';
import { runAnalysis } from '@/lib/analysis/scoring';
import { extractSkillsFromCourse } from '@/lib/analysis/skill-extraction';
import { generateRecommendations } from '@/lib/recommendations/engine';
import type {
  BenchmarkSource,
  ProgramMode,
  Skill,
  Course,
  BenchmarkUniversity,
  ScoringWeights,
  SkillCluster,
  Program,
} from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BENCHMARK_SOURCES: { value: BenchmarkSource; label: string }[] = [
  { value: 'QS', label: 'QS World University Rankings' },
  { value: 'Shanghai', label: 'Shanghai Ranking (ARWU)' },
  { value: 'GlobalTop5', label: 'Global Top 5' },
  { value: 'SectorLeaders', label: 'Sector Leaders' },
];

const PROGRAM_MODES: { value: ProgramMode; label: string }[] = [
  { value: 'teaching', label: 'تدريسي' },
  { value: 'research', label: 'بحثي' },
  { value: 'hybrid', label: 'مختلط' },
];

const CLUSTER_LABELS: Record<SkillCluster, string> = {
  market_skills: 'مهارات السوق',
  core_academic: 'المهارات الأكاديمية',
  future_skills: 'مهارات المستقبل',
  soft_skills: 'المهارات الناعمة',
};

const STEPS = [
  { id: 1, title: 'مصدر المقارنة والنمط' },
  { id: 2, title: 'مراجعة المهارات' },
  { id: 3, title: 'تأكيد وتشغيل' },
];

interface SkillPreview {
  skillId: string;
  skillName: string;
  skillNameAr: string;
  cluster: SkillCluster;
  score: number;
}

export default function AnalyzeWizardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const programId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [benchmarkSource, setBenchmarkSource] = useState<BenchmarkSource>('QS');
  const [programMode, setProgramMode] = useState<ProgramMode>('teaching');
  const [degreeLevel, setDegreeLevel] = useState<string>('bachelor');
  const [analysisGoal, setAnalysisGoal] = useState<string>('academic');
  const [benchmarkUniversities, setBenchmarkUniversities] = useState<BenchmarkUniversity[]>([]);
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('');
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skillPreviews, setSkillPreviews] = useState<SkillPreview[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  useEffect(() => {
    if (benchmarkSource) {
      fetchBenchmarkUniversities();
    }
  }, [benchmarkSource]);

  async function fetchProgram() {
    try {
      const [{ data: progData, error: fetchError }, { data: settingsData }] = await Promise.all([
        supabase
          .from('programs')
          .select('*')
          .eq('id', programId)
          .single(),
        supabase
          .from('platform_settings')
          .select('default_degree_level, default_analysis_goal')
          .single()
      ]);

      if (fetchError) throw fetchError;
      setProgram(progData);

      if (progData?.mode) {
        setProgramMode(progData.mode as ProgramMode);
      }

      if (settingsData) {
        setDegreeLevel(settingsData.default_degree_level || 'bachelor');
        setAnalysisGoal(settingsData.default_analysis_goal || 'academic');
      }
    } catch {
      setError('فشل في تحميل بيانات البرنامج أو الإعدادات');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBenchmarkUniversities() {
    setLoadingBenchmarks(true);
    try {
      const { data } = await supabase
        .from('benchmark_universities')
        .select('*')
        .eq('ranking_source', benchmarkSource)
        .order('name');

      setBenchmarkUniversities(data || []);
      setSelectedBenchmarkId('');
    } catch {
      setBenchmarkUniversities([]);
    } finally {
      setLoadingBenchmarks(false);
    }
  }

  async function fetchSkillsAndCourses() {
    setLoadingSkills(true);
    try {
      const [skillsRes, coursesRes] = await Promise.all([
        supabase.from('skill_library').select('*').order('cluster'),
        supabase.from('courses').select('*').eq('program_id', programId).eq('is_active', true),
      ]);

      const fetchedSkills = skillsRes.data || [];
      const fetchedCourses = coursesRes.data || [];
      setSkills(fetchedSkills);
      setCourses(fetchedCourses);

      const previews: SkillPreview[] = [];
      const skillScoreMap = new Map<string, number>();

      for (const course of fetchedCourses) {
        const extracted = extractSkillsFromCourse(course, fetchedSkills);
        for (const { skillId, score } of extracted) {
          const current = skillScoreMap.get(skillId) || 0;
          skillScoreMap.set(skillId, Math.min(current + score, 1.0));
        }
      }

      skillScoreMap.forEach((score, skillId) => {
        const skill = fetchedSkills.find((s) => s.id === skillId);
        if (skill && score > 0) {
          previews.push({
            skillId: skill.id,
            skillName: skill.name,
            skillNameAr: skill.name_ar,
            cluster: skill.cluster,
            score,
          });
        }
      });

      setSkillPreviews(previews.sort((a, b) => b.score - a.score));
    } catch {
      setError('فشل في تحميل المهارات والمقررات');
    } finally {
      setLoadingSkills(false);
    }
  }

  async function handleNext() {
    if (currentStep === 1) {
      if (!selectedBenchmarkId) {
        setError('يرجى اختيار جامعة مرجعية');
        return;
      }
      setError(null);
      await fetchSkillsAndCourses();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setError(null);
      setCurrentStep(3);
    }
  }

  function handlePrevious() {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  async function handleRunAnalysis() {
    if (!user || !program) return;
    setRunning(true);
    setRunError(null);

    try {
      const { data: analysisRecord, error: insertError } = await supabase
        .from('analyses')
        .insert({
          program_id: programId,
          created_by: user.id,
          benchmark_source: benchmarkSource,
          benchmark_university_id: selectedBenchmarkId,
          program_mode: programMode,
          degree_level: degreeLevel,
          analysis_goal: analysisGoal,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError || !analysisRecord) throw insertError || new Error('فشل في إنشاء التحليل');

      const selectedBenchmark = benchmarkUniversities.find((b) => b.id === selectedBenchmarkId);
      if (!selectedBenchmark) throw new Error('لم يتم العثور على الجامعة المرجعية');

      const { data: weightsData } = await supabase
        .from('scoring_weights')
        .select('*')
        .eq('is_default', true)
        .single();

      if (!weightsData) throw new Error('لم يتم العثور على أوزان التقييم الافتراضية');

      const analysisOutput = runAnalysis({
        courses,
        skills,
        benchmark: selectedBenchmark,
        weights: weightsData as ScoringWeights,
        programMode,
      });

      const { error: resultsError } = await supabase.from('analysis_results').insert({
        analysis_id: analysisRecord.id,
        wai_score: analysisOutput.waiScore,
        market_skills_score: analysisOutput.marketSkillsScore,
        core_skills_score: analysisOutput.coreSkillsScore,
        future_skills_score: analysisOutput.futureSkillsScore,
        soft_skills_score: analysisOutput.softSkillsScore,
        coverage_score_json: analysisOutput.coverageScoreJson,
        gap_summary_json: analysisOutput.gapSummaryJson,
        redundancy_score: analysisOutput.redundancyScore,
        theory_practice_ratio: analysisOutput.theoryPracticeRatio,
        depth_profile_json: analysisOutput.depthProfileJson,
      });

      if (resultsError) throw resultsError;

      const recommendations = generateRecommendations({
        analysisId: analysisRecord.id,
        gaps: analysisOutput.gapSummaryJson,
        skills,
        waiScore: analysisOutput.waiScore,
      });

      if (recommendations.length > 0) {
        const { error: recsError } = await supabase
          .from('recommendations')
          .insert(recommendations);
        if (recsError) throw recsError;
      }

      await supabase
        .from('analyses')
        .update({ status: 'completed' })
        .eq('id', analysisRecord.id);

      router.push(`/analyses/${analysisRecord.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء التحليل';
      setRunError(message);

      try {
        await supabase
          .from('analyses')
          .update({ status: 'failed' })
          .eq('program_id', programId)
          .eq('status', 'pending');
      } catch {
        // silent
      }
    } finally {
      setRunning(false);
    }
  }

  const selectedBenchmark = benchmarkUniversities.find((b) => b.id === selectedBenchmarkId);

  const groupedSkills = skillPreviews.reduce(
    (acc, sp) => {
      if (!acc[sp.cluster]) acc[sp.cluster] = [];
      acc[sp.cluster].push(sp);
      return acc;
    },
    {} as Record<SkillCluster, SkillPreview[]>
  );

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">تحليل البرنامج</h1>
            <p className="text-sm text-muted-foreground">
              {program?.name_ar || program?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${currentStep > step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-sm ${currentStep >= step.id
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
                  }`}
              >
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className="mx-2 h-px w-12 bg-border" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>مصدر المقارنة ونمط البرنامج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">مصدر التصنيف المرجعي</Label>
                <RadioGroup
                  value={benchmarkSource}
                  onValueChange={(val) => setBenchmarkSource(val as BenchmarkSource)}
                  className="grid grid-cols-2 gap-3"
                >
                  {BENCHMARK_SOURCES.map((src) => (
                    <div
                      key={src.value}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <RadioGroupItem value={src.value} id={`src-${src.value}`} />
                      <Label htmlFor={`src-${src.value}`} className="cursor-pointer">
                        {src.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">نمط البرنامج</Label>
                <RadioGroup
                  value={programMode}
                  onValueChange={(val) => setProgramMode(val as ProgramMode)}
                  className="flex gap-4"
                >
                  {PROGRAM_MODES.map((mode) => (
                    <div
                      key={mode.value}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <RadioGroupItem value={mode.value} id={`mode-${mode.value}`} />
                      <Label htmlFor={`mode-${mode.value}`} className="cursor-pointer">
                        {mode.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">مستوى الشهادة</Label>
                  <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">بكالوريوس</SelectItem>
                      <SelectItem value="master">ماجستير</SelectItem>
                      <SelectItem value="doctorate">دكتوراه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">هدف التحليل</Label>
                  <Select value={analysisGoal} onValueChange={setAnalysisGoal}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر الهدف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">أكاديمي</SelectItem>
                      <SelectItem value="professional">مهني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">الجامعة المرجعية</Label>
                {loadingBenchmarks ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedBenchmarkId}
                    onValueChange={setSelectedBenchmarkId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر جامعة مرجعية" />
                    </SelectTrigger>
                    <SelectContent>
                      {benchmarkUniversities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>
                          {uni.name} - {uni.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {benchmarkUniversities.length === 0 && !loadingBenchmarks && (
                  <p className="text-sm text-muted-foreground">
                    لا توجد جامعات مرجعية لهذا المصدر
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>المهارات المكتشفة</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSkills ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : skillPreviews.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  لم يتم اكتشاف مهارات. تأكد من إضافة مقررات للبرنامج.
                </p>
              ) : (
                <div className="space-y-6">
                  {(Object.keys(groupedSkills) as SkillCluster[]).map((cluster) => (
                    <div key={cluster}>
                      <h3 className="mb-3 text-lg font-semibold">
                        {CLUSTER_LABELS[cluster]}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المهارة</TableHead>
                            <TableHead className="text-right">المهارة (عربي)</TableHead>
                            <TableHead className="text-right">الدرجة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedSkills[cluster].map((sp) => (
                            <TableRow key={sp.skillId}>
                              <TableCell>{sp.skillName}</TableCell>
                              <TableCell>{sp.skillNameAr}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${Math.round(sp.score * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {Math.round(sp.score * 100)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    تم اكتشاف {skillPreviews.length} مهارة من {courses.length} مقرر
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ملخص التحليل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">البرنامج</p>
                    <p className="font-semibold">
                      {program?.name_ar || program?.name}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">نمط البرنامج</p>
                    <p className="font-semibold">
                      {PROGRAM_MODES.find((m) => m.value === programMode)?.label}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">مصدر التصنيف</p>
                    <p className="font-semibold">
                      {BENCHMARK_SOURCES.find((s) => s.value === benchmarkSource)?.label}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">الجامعة المرجعية</p>
                    <p className="font-semibold">
                      {selectedBenchmark?.name} - {selectedBenchmark?.country}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">مستوى الشهادة</p>
                    <p className="font-semibold">
                      {degreeLevel === 'bachelor' ? 'بكالوريوس' : degreeLevel === 'master' ? 'ماجستير' : 'دكتوراه'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">هدف التحليل</p>
                    <p className="font-semibold">
                      {analysisGoal === 'academic' ? 'أكاديمي' : 'مهني'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">المهارات المكتشفة</p>
                    <p className="font-semibold">{skillPreviews.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">المقررات النشطة</p>
                    <p className="font-semibold">{courses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {runError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{runError}</AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleRunAnalysis}
              disabled={running}
            >
              {running ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Play className="ml-2 h-5 w-5" />
                  تشغيل التحليل
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || running}
          >
            <ChevronRight className="ml-2 h-4 w-4" />
            السابق
          </Button>
          {currentStep < 3 && (
            <Button onClick={handleNext} disabled={running}>
              التالي
              <ChevronLeft className="mr-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

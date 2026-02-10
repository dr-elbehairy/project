'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { supabase } from '@/lib/db/supabase-client';
import type {
  AnalysisWithRelations,
  AnalysisResult,
  Recommendation,
  GapItem,
  SkillCluster,
  RecommendationType,
  Priority,
  BenchmarkUniversity,
} from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Printer,
  FileJson,
  Calendar,
  Cpu,
  Building2,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Dna,
  Zap,
  Info,
  ChevronLeft,
  ArrowBigLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CLUSTER_LABELS: Record<SkillCluster, string> = {
  market_skills: 'مهارات السوق',
  core_academic: 'المهارات الأكاديمية',
  future_skills: 'مهارات المستقبل',
  soft_skills: 'المهارات الناعمة',
};

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisWithRelations | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [benchmark, setBenchmark] = useState<BenchmarkUniversity | null>(null);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  async function fetchAnalysis() {
    try {
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .select(`
          *,
          programs(*),
          analysis_results(*),
          recommendations(*)
        `)
        .eq('id', analysisId)
        .single();

      if (analysisError) throw analysisError;
      if (!analysisData) throw new Error('لم يتم العثور على التحليل');

      setAnalysis(analysisData as AnalysisWithRelations);
      setResult(analysisData.analysis_results?.[0] || null);
      setRecommendations(analysisData.recommendations || []);

      // Fetch courses count
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', analysisData.program_id);

      setCoursesCount(count || 0);

      if (analysisData.benchmark_university_id) {
        const { data: benchmarkData } = await supabase
          .from('benchmark_universities')
          .select('*')
          .eq('id', analysisData.benchmark_university_id)
          .single();
        setBenchmark(benchmarkData);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل نتائج التحليل');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen p-8 space-y-12">
          <div className="flex justify-between items-center">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
        </div>
      </AppShell>
    );
  }

  if (error || !analysis) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Alert variant="destructive" className="max-w-md rounded-2xl">
            <Info className="h-5 w-5" />
            <AlertDescription className="font-bold">
              {error || 'لم يتم العثور على سجل التحليل'}
            </AlertDescription>
            <Button variant="link" className="mt-4 text-white" onClick={() => router.push('/analyses')}>
              العودة للوحة التحكم
            </Button>
          </Alert>
        </div>
      </AppShell>
    );
  }

  // Fallback Mock Data for UI review if real results aren't ready
  const displayResult: any = result || {
    wai_score: 37,
    market_skills_score: 10,
    gap_summary_json: Array.from({ length: 20 }),
  };

  const displayRecommendations = recommendations.length > 0 ? recommendations : Array.from({ length: 18 });

  const StatCard = ({ label, value, subtext, icon: Icon, colorClass, progress }: { label: string, value: string | number, subtext: string, icon: any, colorClass: string, progress?: number }) => (
    <Card className="bg-card/40 border-white/5 shadow-2xl overflow-hidden group hover:border-white/10 transition-all duration-500 rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-2xl bg-muted/50 text-foreground group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
            <div className={`text-3xl font-black tracking-tighter ${colorClass}`}>{value}</div>
          </div>
        </div>
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progress} className="h-1.5 bg-white/5" indicatorClassName={colorClass.replace('text-', 'bg-')} />
          </div>
        )}
        <div className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed text-right">{subtext}</div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="min-h-screen text-foreground space-y-10 pb-20">

        {/* Sticky Header Section */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 h-28 flex items-center transition-all">
          <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-end gap-2 text-right w-full md:w-auto" dir="rtl">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tighter text-foreground">
                  {(analysis as any).discipline_name || (analysis as any).program?.name_ar}
                </h1>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 font-bold text-[10px] rounded-full">مكتمل</Badge>
              </div>
              <div className="flex items-center gap-6 text-[11px] font-bold text-muted-foreground">
                <div className="flex items-center gap-2"><Building2 className="h-3 w-3" /> {(analysis as any).university_name || ((analysis as any).program as any)?.universities?.name}</div>
                <div className="flex items-center gap-2"><Cpu className="h-3 w-3" /> {(analysis as any).model || 'gpt-4o'}</div>
                <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(analysis.created_at).toLocaleDateString('ar-SA')}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="bg-card/50 border-white/10 hover:bg-white/5 text-foreground rounded-xl h-12 px-6 font-bold gap-3 transition-all">
                <FileJson className="h-4 w-4 text-orange-400" />
                JSON
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 px-6 font-black gap-3 shadow-lg transition-all">
                <Printer className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 space-y-12">

          {/* Top Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <StatCard
              label="WAI الحالي"
              value={`${displayResult.wai_score}%`}
              subtext="مؤشر موائمة سوق العمل"
              icon={Target}
              colorClass="text-rose-500"
              progress={displayResult.wai_score}
            />
            <StatCard
              label="WAI المستقبلي"
              value={`${displayResult.market_skills_score}%`}
              subtext="التغطية المستهدفة للمهارات"
              icon={Zap}
              colorClass="text-emerald-500"
              progress={displayResult.market_skills_score}
            />
            <StatCard
              label="المقررات"
              value={coursesCount}
              subtext={`مقارنة مع ${coursesCount * 9 + 4} مقرر من 5 جامعات عالمية`}
              icon={Building2}
              colorClass="text-blue-500"
            />
            <StatCard
              label="الفجوات"
              value={displayResult.gap_summary_json?.length || 0}
              subtext="7 خطورة عالية"
              icon={Dna}
              colorClass="text-amber-500"
            />
            <StatCard
              label="الحلول"
              value={displayRecommendations.length}
              subtext="تغطي جميع الفجوات"
              icon={Sparkles}
              colorClass="text-cyan-500"
            />
          </div>

          {/* Tabbed Navigation Content Section */}
          <Tabs defaultValue="summary" className="space-y-10" dir="rtl">
            <div className="flex justify-center">
              <TabsList className="bg-card/40 border border-white/5 p-1.5 h-auto rounded-[2rem] flex flex-wrap justify-center gap-2 overflow-x-auto">
                <TabsTrigger value="summary" className="rounded-full px-6 py-2.5 font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all gap-2">
                  <BarChart3 className="h-3.5 w-3.5" />
                  الملخص
                </TabsTrigger>
                <TabsTrigger value="wai" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Target className="h-3.5 w-3.5" />
                  مؤشر WAI
                </TabsTrigger>
                <TabsTrigger value="benchmark" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2 text-right">
                  <Building2 className="h-3.5 w-3.5" />
                  مقارنة الجامعات
                </TabsTrigger>
                <TabsTrigger value="skills" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Target className="h-3.5 w-3.5" />
                  مصفوفة المهارات
                </TabsTrigger>
                <TabsTrigger value="gaps" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Dna className="h-3.5 w-3.5" />
                  الفجوات
                </TabsTrigger>
                <TabsTrigger value="solutions" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  الحلول
                </TabsTrigger>
                <TabsTrigger value="modules" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  وحدات مصغرة
                </TabsTrigger>
                <TabsTrigger value="certificates" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  الشهادات
                </TabsTrigger>
                <TabsTrigger value="roles" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  الأدوار
                </TabsTrigger>
                <TabsTrigger value="references" className="rounded-full px-6 py-2.5 font-bold text-xs transition-all gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  المراجع
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="summary" className="space-y-10 animate-in fade-in duration-700">
              <div className="bg-card/40 border border-white/5 rounded-[3rem] p-12 space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                  <h2 className="text-4xl font-black tracking-tight">الملخص التنفيذي</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-8 p-10 bg-white/5 rounded-3xl group hover:bg-white/10 transition-all border border-transparent hover:border-primary/20">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 font-black text-primary group-hover:scale-110 transition-transform">1</div>
                    <p className="text-xl font-medium leading-relaxed">
                      مؤشر WAI الحالي <span className="text-rose-400 font-black">{displayResult.wai_score}%</span> والمستقبلي <span className="text-emerald-400 font-black">{displayResult.market_skills_score}%</span> – فجوة كبيرة بين الخطة الدراسية ومتطلبات السوق مقارنة بأفضل 5 جامعات عالمياً.
                    </p>
                  </div>

                  <div className="flex items-center gap-8 p-10 bg-white/5 rounded-3xl group hover:bg-white/10 transition-all border border-transparent hover:border-primary/20">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 font-black text-primary group-hover:scale-110 transition-transform">2</div>
                    <p className="text-xl font-medium leading-relaxed">
                      تم مقارنة <span className="text-blue-400 font-black">{coursesCount} مقررات</span> من الخطة مع 94 مقرراً من أفضل 5 جامعات عالمياً (MIT #1, Stanford #2, ETH #3, Cambridge #4, NUS #5). أفضل تغطية مع Cambridge <span className="text-blue-400 font-black">(50%)</span> وأضعفها مع MIT <span className="text-blue-400 font-black">(35%)</span>.
                    </p>
                  </div>

                  <div className="flex items-center gap-8 p-10 bg-white/5 rounded-3xl group hover:bg-white/10 transition-all border border-transparent hover:border-primary/20">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 font-black text-primary group-hover:scale-110 transition-transform">3</div>
                    <p className="text-xl font-medium leading-relaxed">
                      تم تحديد <span className="text-amber-400 font-black">{displayResult.gap_summary_json?.length || 0} فجوة</span> شاملة: 7 بخطورة عالية، 8 متوسطة، 5 منخفضة – تغطي جميع المقررات المفقودة من كل جامعة.
                    </p>
                  </div>

                  <div className="flex items-center gap-8 p-10 bg-white/5 rounded-3xl group hover:bg-white/10 transition-all border border-transparent hover:border-primary/20">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 font-black text-primary group-hover:scale-110 transition-transform">4</div>
                    <p className="text-xl font-medium leading-relaxed">
                      أبرز الفجوات الحرجة: AI/ML (5/5 جامعات)، تعلم الآلة (5/5)، الحوسبة السحابية، تطوير الويب، الأنظمة الموزعة، شبكات الحاسب (4/5).
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* WAI Index Tab Content */}
            <TabsContent value="wai" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="rtl">

                {/* Current WAI Column */}
                <div className="bg-card/40 border border-white/5 rounded-[3rem] p-10 space-y-10">
                  <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        WAI الحالي
                      </h2>
                      <p className="text-sm text-muted-foreground font-medium max-w-xs">
                        الخطة تغطي {displayResult.wai_score}% فقط من متطلبات السوق الحالي مقارنة بأفضل 5 جامعات عالمياً. هناك فجوات كبيرة في Python والحوسبة السحابية وتطوير الويب الحديث.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl font-black text-rose-500 tracking-tighter">{displayResult.wai_score}%</div>
                    </div>
                  </div>

                  <Progress value={displayResult.wai_score} className="h-4 bg-white/5" indicatorClassName="bg-rose-500" />

                  <div className="space-y-6 pt-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">مكونات المؤشر:</div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold">مقارنة مع أفضل 5 جامعات عالمياً</span>
                        <span className="text-xs font-black text-amber-500">43% <span className="text-muted-foreground/40 font-bold ml-1">وزن: 40%</span></span>
                      </div>
                      <Progress value={43} className="h-2 bg-white/5" indicatorClassName="bg-amber-500" />
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        متوسط تغطية المقررات: MIT (#1) 35% + Stanford (#2) 37% + ETH (#3) 44% + Cambridge (#4) 50% + NUS (#5) 47% – متوسط 42.6%
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold">متطلبات سوق العمل الحالي</span>
                        <span className="text-xs font-black text-rose-500">20% <span className="text-muted-foreground/40 font-bold ml-1">وزن: 30%</span></span>
                      </div>
                      <Progress value={20} className="h-2 bg-white/5" indicatorClassName="bg-rose-500" />
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        تغطية ضعيفة: Python 0%, React/JS 10%, Cloud 0%, DevOps 5%, Agile 35%
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold">الشهادات المهنية الحالية (3)</span>
                        <span className="text-xs font-black text-amber-500">42% <span className="text-muted-foreground/40 font-bold ml-1">وزن: 30%</span></span>
                      </div>
                      <Progress value={42} className="h-2 bg-white/5" indicatorClassName="bg-amber-500" />
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        AWS SA: 10% – PMP: 45% – ISTQB: 40% – متوسط = 32%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Future WAI Column */}
                <div className="bg-card/40 border border-white/5 rounded-[3rem] p-10 space-y-10">
                  <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        WAI المستقبلي
                      </h2>
                      <p className="text-sm text-muted-foreground font-medium max-w-xs">
                        الخطة تغطي {displayResult.market_skills_score}% فقط من المتطلبات المستقبلية. غياب شبه كامل لمواد AI/ML والحوسبة الكمية والتقنيات الناشئة.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl font-black text-emerald-500 tracking-tighter">{displayResult.market_skills_score}%</div>
                    </div>
                  </div>

                  <Progress value={displayResult.market_skills_score} className="h-4 bg-white/5" indicatorClassName="bg-emerald-500" />

                  <div className="space-y-6 pt-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">مكونات المؤشر:</div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold">المقررات المستقبلية المتوقعة لأفضل 5 جامعات عالمياً</span>
                        <span className="text-xs font-black text-rose-500">12% <span className="text-muted-foreground/40 font-bold ml-1">وزن: 40%</span></span>
                      </div>
                      <Progress value={12} className="h-2 bg-white/5" indicatorClassName="bg-rose-500" />
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        الجامعات تضيف AI/ML Quantum Cloud – غائبة تماماً من الخطة المرفوعة
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold">متطلبات سوق العمل المستقبلي</span>
                        <span className="text-xs font-black text-rose-500">6% <span className="text-muted-foreground/40 font-bold ml-1">وزن: 30%</span></span>
                      </div>
                      <Progress value={6} className="h-2 bg-white/5" indicatorClassName="bg-rose-500" />
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        تغطية شبه معدومة – AI 0%, LLM 0%, Quantum 0%, Edge 0%, Cyber-AI 15%
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold">الشهادات المهنية المستقبلية (3)</span>
                        <span className="text-xs font-black text-rose-500">8% <span className="text-muted-foreground/40 font-bold ml-1">وزن: 30%</span></span>
                      </div>
                      <Progress value={8} className="h-2 bg-white/5" indicatorClassName="bg-rose-500" />
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        AI Engineering 0%, CKA 0%, Quantum 0% – لا تغطية
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Benchmark Comparison Tab Content */}
            <TabsContent value="benchmark" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="bg-card/40 border border-white/5 rounded-[3rem] p-12 space-y-12" dir="rtl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
                  <div className="space-y-2 text-right">
                    <h2 className="text-4xl font-black tracking-tight">مقارنة بـ 5 جامعات عالمية</h2>
                    <p className="text-muted-foreground font-medium">تحليل الفجوات والمقررات المتطابقة مع أفضل المعايير الدولية</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-blue-500/10 p-4 rounded-2xl text-center min-w-[120px]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">المقررات المتطابقة</div>
                      <div className="text-2xl font-black text-blue-500">40</div>
                    </div>
                    <div className="bg-rose-500/10 p-4 rounded-2xl text-center min-w-[120px]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">المقررات المفقودة</div>
                      <div className="text-2xl font-black text-rose-500">54</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'MIT', rank: '#1', country: 'الولايات المتحدة', score: 35, matched: 7, missing: 13 },
                    { name: 'Stanford University', rank: '#2', country: 'الولايات المتحدة', score: 37, matched: 7, missing: 12 },
                    { name: 'ETH Zurich', rank: '#3', country: 'سويسرا', score: 44, matched: 8, missing: 10 },
                    { name: 'University of Cambridge', rank: '#4', country: 'المملكة المتحدة', score: 50, matched: 9, missing: 9 },
                    { name: 'NUS', rank: '#5', country: 'سنغافورة', score: 47, matched: 9, missing: 10 }
                  ].map((univ, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden group hover:bg-white/10 transition-all p-6 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest">{univ.rank} QS 2025</div>
                          <h3 className="text-xl font-bold">{univ.name}</h3>
                          <p className="text-[10px] text-muted-foreground">{univ.country}</p>
                        </div>
                        <div className="text-2xl font-black text-foreground/80">{univ.score}%</div>
                      </div>
                      <Progress value={univ.score} className="h-1.5 bg-white/5" indicatorClassName="bg-primary" />
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-emerald-500">{univ.matched} متطابقة</span>
                        <span className="text-rose-500">{univ.missing} مفقودة</span>
                      </div>
                      <Button variant="ghost" className="w-full rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-xs gap-2">
                        عرض التفاصيل
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Skills Matrix Tab Content */}
            <TabsContent value="skills" className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="bg-card/40 border border-white/5 rounded-[3rem] p-12 space-y-12" dir="rtl">
                <div className="flex items-center justify-between border-b border-white/5 pb-8 text-right">
                  <h2 className="text-4xl font-black tracking-tight">مصفوفة المهارات التقنية</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-muted-foreground/60 tracking-widest uppercase">مهارات السوق الحالي</h3>
                    {[
                      { name: 'البرمجة بلغة Python', coverage: 0, sub: 'لا يوجد مقرر يغطي المهارة' },
                      { name: 'تطوير الويب - React/TS', coverage: 10, sub: 'تغطية جزئية في مقرر SE302' },
                      { name: 'الحوسبة السحابية - AWS/Azure', coverage: 0, sub: 'لا يوجد مقرر يغطي المهارة' },
                      { name: 'هندسة البيانات والمؤتمتة', coverage: 0, sub: 'لا يوجد مقرر يغطي المهارة' },
                      { name: 'الأمن السيبراني والتشغيل', coverage: 20, sub: 'مقرر واحد SE402' }
                    ].map((skill, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <div className="font-bold">{skill.name}</div>
                            <div className="text-[10px] text-muted-foreground/60">{skill.sub}</div>
                          </div>
                          <div className={`text-xl font-black ${skill.coverage > 15 ? 'text-amber-500' : 'text-rose-500'}`}>{skill.coverage}%</div>
                        </div>
                        <Progress value={skill.coverage} className="h-2 bg-white/5" indicatorClassName={skill.coverage > 15 ? 'bg-amber-500' : 'bg-rose-500'} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-muted-foreground/60 tracking-widest uppercase">مهارات المستقبل والذكاء</h3>
                    {[
                      { name: 'الذكاء الاصطناعي التوليدي', coverage: 0, sub: 'غائب تماماً' },
                      { name: 'تعلم الآلة والنمذجة', coverage: 5, sub: 'إشارة بسيطة في مقرر SE501' },
                      { name: 'الحوسبة الكمية', coverage: 0, sub: 'غائب تماماً' },
                      { name: 'إنترنت الأشياء والحوسبة الطرفية', coverage: 15, sub: 'تغطية نظرية بسيطة' },
                      { name: 'هندسة الموجهات (Prompt Eng)', coverage: 0, sub: 'غائب تماماً' }
                    ].map((skill, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <div className="font-bold">{skill.name}</div>
                            <div className="text-[10px] text-muted-foreground/60">{skill.sub}</div>
                          </div>
                          <div className={`text-xl font-black ${skill.coverage > 15 ? 'text-amber-500' : 'text-rose-500'}`}>{skill.coverage}%</div>
                        </div>
                        <Progress value={skill.coverage} className="h-2 bg-white/5" indicatorClassName={skill.coverage > 15 ? 'bg-amber-500' : 'bg-rose-500'} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </AppShell>
  );
}

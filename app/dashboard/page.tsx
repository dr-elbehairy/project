'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/db/auth-context';
import { supabase } from '@/lib/db/supabase-client';
import type { Program, Analysis, AnalysisResult } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  BookOpen,
  Activity,
  TrendingUp,
  AlertTriangle,
  Building2,
  GraduationCap,
  Users,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

const TEAL_600 = '#0d9488';
const TEAL_500 = '#14b8a6';
const TEAL_400 = '#2dd4bf';
const GOLD_500 = '#eab308';
const GOLD_400 = '#facc15';

const CLUSTER_COLORS: Record<string, string> = {
  market_skills: TEAL_600,
  core_academic: TEAL_400,
  future_skills: GOLD_500,
  soft_skills: '#f97316',
};

const CLUSTER_LABELS: Record<string, string> = {
  market_skills: 'مهارات السوق',
  core_academic: 'المهارات الأكاديمية',
  future_skills: 'مهارات المستقبل',
  soft_skills: 'المهارات الناعمة',
};

interface DemoProgram {
  id: string;
  name_ar: string;
  wai_score: number;
}

interface DemoAnalysis {
  id: string;
  program_name: string;
  wai_score: number;
  status: string;
  created_at: string;
}

interface AdminUniversity {
  name: string;
  wai_avg: number;
  programs_count: number;
}

interface AdminDiscipline {
  name: string;
  risk_level: string;
  avg_wai: number;
}

const DEMO_PROGRAMS: DemoProgram[] = [
  { id: '1', name_ar: 'علوم الحاسب', wai_score: 78 },
  { id: '2', name_ar: 'الهندسة الكهربائية', wai_score: 65 },
  { id: '3', name_ar: 'إدارة الأعمال', wai_score: 82 },
  { id: '4', name_ar: 'الطب البشري', wai_score: 91 },
  { id: '5', name_ar: 'القانون', wai_score: 55 },
];

const DEMO_COVERAGE = [
  { cluster: 'market_skills', label: 'مهارات السوق', coverage: 72 },
  { cluster: 'core_academic', label: 'المهارات الأكاديمية', coverage: 88 },
  { cluster: 'future_skills', label: 'مهارات المستقبل', coverage: 45 },
  { cluster: 'soft_skills', label: 'المهارات الناعمة', coverage: 60 },
];

const DEMO_ANALYSES: DemoAnalysis[] = [
  { id: '1', program_name: 'علوم الحاسب', wai_score: 78, status: 'completed', created_at: '2024-12-01T10:00:00Z' },
  { id: '2', program_name: 'الهندسة الكهربائية', wai_score: 65, status: 'completed', created_at: '2024-11-28T14:30:00Z' },
  { id: '3', program_name: 'إدارة الأعمال', wai_score: 82, status: 'completed', created_at: '2024-11-25T09:15:00Z' },
];

const DEMO_ADMIN_UNIVERSITIES: AdminUniversity[] = [
  { name: 'جامعة الملك سعود', wai_avg: 85, programs_count: 42 },
  { name: 'جامعة الملك فهد', wai_avg: 81, programs_count: 38 },
  { name: 'جامعة أم القرى', wai_avg: 76, programs_count: 35 },
  { name: 'جامعة الملك عبدالعزيز', wai_avg: 73, programs_count: 40 },
  { name: 'جامعة الإمام', wai_avg: 69, programs_count: 28 },
];

const DEMO_ADMIN_DISCIPLINES: AdminDiscipline[] = [
  { name: 'العلوم الإنسانية', risk_level: 'high', avg_wai: 42 },
  { name: 'الفنون الجميلة', risk_level: 'high', avg_wai: 45 },
  { name: 'اللغة العربية', risk_level: 'medium', avg_wai: 55 },
  { name: 'التاريخ', risk_level: 'medium', avg_wai: 52 },
  { name: 'الفلسفة', risk_level: 'high', avg_wai: 38 },
];

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-6">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function getRiskLabel(wai: number): { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (wai >= 75) return { text: 'منخفض', variant: 'default' };
  if (wai >= 50) return { text: 'متوسط', variant: 'secondary' };
  return { text: 'مرتفع', variant: 'destructive' };
}

function UniversityDashboard({
  programs,
  waiData,
  coverageData,
  recentAnalyses,
  programsCount,
  latestAnalysisDate,
  avgWai,
  riskIndex,
}: {
  programs: DemoProgram[];
  waiData: DemoProgram[];
  coverageData: typeof DEMO_COVERAGE;
  recentAnalyses: DemoAnalysis[];
  programsCount: number;
  latestAnalysisDate: string;
  avgWai: number;
  riskIndex: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          value={programsCount}
          label="عدد البرامج"
          color={TEAL_600}
        />
        <StatCard
          icon={Activity}
          value={latestAnalysisDate}
          label="آخر تحليل"
          color={TEAL_500}
        />
        <StatCard
          icon={TrendingUp}
          value={`${avgWai}%`}
          label="متوسط WAI"
          color={GOLD_500}
        />
        <StatCard
          icon={AlertTriangle}
          value={riskIndex}
          label="مؤشر المخاطر"
          color="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع مؤشر WAI حسب البرنامج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={waiData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name_ar"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'WAI']}
                    contentStyle={{ direction: 'rtl', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                  />
                  <Bar dataKey="wai_score" radius={[0, 4, 4, 0]}>
                    {waiData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.wai_score >= 75 ? TEAL_500 : entry.wai_score >= 50 ? GOLD_500 : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">تغطية المهارات حسب المجموعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={coverageData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={130}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'التغطية']}
                    contentStyle={{ direction: 'rtl', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                  />
                  <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                    {coverageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CLUSTER_COLORS[entry.cluster] || TEAL_500}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">التحليلات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              لا توجد تحليلات بعد
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">البرنامج</TableHead>
                  <TableHead className="text-right">مؤشر WAI</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAnalyses.map((analysis) => {
                  const risk = getRiskLabel(analysis.wai_score);
                  return (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">{analysis.program_name}</TableCell>
                      <TableCell>
                        <span className="font-bold" style={{ color: analysis.wai_score >= 75 ? TEAL_600 : analysis.wai_score >= 50 ? GOLD_500 : '#ef4444' }}>
                          {analysis.wai_score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'}>
                          {analysis.status === 'completed' ? 'مكتمل' : analysis.status === 'pending' ? 'قيد التنفيذ' : 'فشل'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({
  universities,
  disciplines,
  totalUniversities,
  totalPrograms,
  nationalAvgWai,
}: {
  universities: AdminUniversity[];
  disciplines: AdminDiscipline[];
  totalUniversities: number;
  totalPrograms: number;
  nationalAvgWai: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          value={totalUniversities}
          label="عدد الجامعات"
          color={TEAL_600}
        />
        <StatCard
          icon={GraduationCap}
          value={totalPrograms}
          label="عدد البرامج"
          color={TEAL_500}
        />
        <StatCard
          icon={TrendingUp}
          value={`${nationalAvgWai}%`}
          label="المتوسط الوطني WAI"
          color={GOLD_500}
        />
        <StatCard
          icon={Users}
          value={disciplines.filter((d) => d.risk_level === 'high').length}
          label="تخصصات عالية المخاطر"
          color="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أعلى الجامعات حسب WAI</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الجامعة</TableHead>
                  <TableHead className="text-right">متوسط WAI</TableHead>
                  <TableHead className="text-right">عدد البرامج</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((uni, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{uni.name}</TableCell>
                    <TableCell>
                      <span className="font-bold" style={{ color: uni.wai_avg >= 75 ? TEAL_600 : GOLD_500 }}>
                        {uni.wai_avg}%
                      </span>
                    </TableCell>
                    <TableCell>{uni.programs_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">التخصصات الأكثر خطورة</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">التخصص</TableHead>
                  <TableHead className="text-right">مستوى المخاطر</TableHead>
                  <TableHead className="text-right">متوسط WAI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplines.map((disc, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{disc.name}</TableCell>
                    <TableCell>
                      <Badge variant={disc.risk_level === 'high' ? 'destructive' : 'secondary'}>
                        {disc.risk_level === 'high' ? 'مرتفع' : 'متوسط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold" style={{ color: disc.avg_wai >= 50 ? GOLD_500 : '#ef4444' }}>
                        {disc.avg_wai}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<DemoProgram[]>([]);
  const [waiData, setWaiData] = useState<DemoProgram[]>([]);
  const [coverageData, setCoverageData] = useState<typeof DEMO_COVERAGE>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<DemoAnalysis[]>([]);
  const [programsCount, setProgramsCount] = useState(0);
  const [latestAnalysisDate, setLatestAnalysisDate] = useState('--');
  const [avgWai, setAvgWai] = useState(0);
  const [riskIndex, setRiskIndex] = useState('--');

  const [adminUniversities, setAdminUniversities] = useState<AdminUniversity[]>([]);
  const [adminDisciplines, setAdminDisciplines] = useState<AdminDiscipline[]>([]);
  const [adminTotalUniversities, setAdminTotalUniversities] = useState(0);
  const [adminTotalPrograms, setAdminTotalPrograms] = useState(0);
  const [adminNationalAvgWai, setAdminNationalAvgWai] = useState(0);

  const isAdmin = isDemo ? false : profile?.role === 'admin';

  useEffect(() => {
    if (isDemo) {
      loadDemoData();
      return;
    }
    if (authLoading) return;
    if (!profile) return;

    if (profile.role === 'admin') {
      loadAdminData();
    } else {
      loadUniversityData();
    }
  }, [isDemo, authLoading, profile]);

  function loadDemoData() {
    setPrograms(DEMO_PROGRAMS);
    setWaiData(DEMO_PROGRAMS);
    setCoverageData(DEMO_COVERAGE);
    setRecentAnalyses(DEMO_ANALYSES);
    setProgramsCount(DEMO_PROGRAMS.length);
    setLatestAnalysisDate('2024/12/01');
    setAvgWai(74);
    const highRisk = DEMO_PROGRAMS.filter((p) => p.wai_score < 50).length;
    setRiskIndex(highRisk > 0 ? `${highRisk} برامج` : 'منخفض');
    setLoading(false);
  }

  async function loadUniversityData() {
    try {
      const universityId = profile?.university_id;
      if (!universityId) {
        setLoading(false);
        return;
      }

      const { data: programsData } = await supabase
        .from('programs')
        .select('*')
        .eq('university_id', universityId);

      const fetchedPrograms: Program[] = programsData || [];
      setProgramsCount(fetchedPrograms.length);

      const { data: analysesData } = await supabase
        .from('analyses')
        .select('*, analysis_results(*)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      const analyses: (Analysis & { analysis_results: AnalysisResult[] })[] = analysesData || [];

      const relevantAnalyses = analyses.filter((a) =>
        fetchedPrograms.some((p) => p.id === a.program_id)
      );

      if (relevantAnalyses.length > 0) {
        setLatestAnalysisDate(
          new Date(relevantAnalyses[0].created_at).toLocaleDateString('ar-SA')
        );
      }

      const waiScores: number[] = [];
      const programWaiMap: Record<string, number> = {};

      relevantAnalyses.forEach((a) => {
        if (a.analysis_results && a.analysis_results.length > 0) {
          const result = a.analysis_results[0];
          waiScores.push(result.wai_score);
          programWaiMap[a.program_id] = result.wai_score;
        }
      });

      const averageWai =
        waiScores.length > 0
          ? Math.round(waiScores.reduce((sum, s) => sum + s, 0) / waiScores.length)
          : 0;
      setAvgWai(averageWai);

      const highRiskCount = waiScores.filter((s) => s < 50).length;
      setRiskIndex(highRiskCount > 0 ? `${highRiskCount} برامج` : 'منخفض');

      const waiChartData: DemoProgram[] = fetchedPrograms.map((p) => ({
        id: p.id,
        name_ar: p.name_ar || p.name,
        wai_score: programWaiMap[p.id] || 0,
      }));
      setWaiData(waiChartData);

      const clusterTotals: Record<string, { sum: number; count: number }> = {
        market_skills: { sum: 0, count: 0 },
        core_academic: { sum: 0, count: 0 },
        future_skills: { sum: 0, count: 0 },
        soft_skills: { sum: 0, count: 0 },
      };

      relevantAnalyses.forEach((a) => {
        if (a.analysis_results && a.analysis_results.length > 0) {
          const r = a.analysis_results[0];
          clusterTotals.market_skills.sum += r.market_skills_score;
          clusterTotals.market_skills.count += 1;
          clusterTotals.core_academic.sum += r.core_skills_score;
          clusterTotals.core_academic.count += 1;
          clusterTotals.future_skills.sum += r.future_skills_score;
          clusterTotals.future_skills.count += 1;
          clusterTotals.soft_skills.sum += r.soft_skills_score;
          clusterTotals.soft_skills.count += 1;
        }
      });

      const coverageChartData = Object.entries(clusterTotals).map(([cluster, data]) => ({
        cluster,
        label: CLUSTER_LABELS[cluster] || cluster,
        coverage: data.count > 0 ? Math.round(data.sum / data.count) : 0,
      }));
      setCoverageData(coverageChartData);

      const recentList: DemoAnalysis[] = relevantAnalyses.slice(0, 5).map((a) => {
        const prog = fetchedPrograms.find((p) => p.id === a.program_id);
        const wai = a.analysis_results?.[0]?.wai_score || 0;
        return {
          id: a.id,
          program_name: prog?.name_ar || prog?.name || '--',
          wai_score: wai,
          status: a.status,
          created_at: a.created_at,
        };
      });
      setRecentAnalyses(recentList);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    try {
      const { data: unis } = await supabase.from('universities').select('*');
      const { data: progs } = await supabase.from('programs').select('*');
      const { data: analysesData } = await supabase
        .from('analyses')
        .select('*, analysis_results(*), programs!inner(university_id, discipline)')
        .eq('status', 'completed');

      const universities = unis || [];
      const allPrograms: Program[] = progs || [];
      const analyses: any[] = analysesData || [];

      setAdminTotalUniversities(universities.length);
      setAdminTotalPrograms(allPrograms.length);

      const uniWaiMap: Record<string, { sum: number; count: number; name: string; programs: number }> = {};
      universities.forEach((u: any) => {
        uniWaiMap[u.id] = { sum: 0, count: 0, name: u.name, programs: allPrograms.filter((p) => p.university_id === u.id).length };
      });

      const discWaiMap: Record<string, { sum: number; count: number }> = {};
      let totalWai = 0;
      let totalWaiCount = 0;

      analyses.forEach((a: any) => {
        if (a.analysis_results && a.analysis_results.length > 0) {
          const wai = a.analysis_results[0].wai_score;
          totalWai += wai;
          totalWaiCount += 1;

          const uniId = a.programs?.university_id;
          if (uniId && uniWaiMap[uniId]) {
            uniWaiMap[uniId].sum += wai;
            uniWaiMap[uniId].count += 1;
          }

          const disc = a.programs?.discipline;
          if (disc) {
            if (!discWaiMap[disc]) discWaiMap[disc] = { sum: 0, count: 0 };
            discWaiMap[disc].sum += wai;
            discWaiMap[disc].count += 1;
          }
        }
      });

      setAdminNationalAvgWai(totalWaiCount > 0 ? Math.round(totalWai / totalWaiCount) : 0);

      const sortedUnis = Object.values(uniWaiMap)
        .filter((u) => u.count > 0)
        .map((u) => ({
          name: u.name,
          wai_avg: Math.round(u.sum / u.count),
          programs_count: u.programs,
        }))
        .sort((a, b) => b.wai_avg - a.wai_avg)
        .slice(0, 10);
      setAdminUniversities(sortedUnis.length > 0 ? sortedUnis : DEMO_ADMIN_UNIVERSITIES);

      const sortedDisc = Object.entries(discWaiMap)
        .map(([name, data]) => ({
          name,
          avg_wai: Math.round(data.sum / data.count),
          risk_level: Math.round(data.sum / data.count) < 50 ? 'high' : 'medium',
        }))
        .sort((a, b) => a.avg_wai - b.avg_wai)
        .slice(0, 10);
      setAdminDisciplines(sortedDisc.length > 0 ? sortedDisc : DEMO_ADMIN_DISCIPLINES);
    } catch {
      setAdminUniversities(DEMO_ADMIN_UNIVERSITIES);
      setAdminDisciplines(DEMO_ADMIN_DISCIPLINES);
      setAdminNationalAvgWai(72);
      setAdminTotalUniversities(5);
      setAdminTotalPrograms(183);
    } finally {
      setLoading(false);
    }
  }

  if (isDemo) {
    return (
      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="mb-6 flex items-center gap-3">
          <BarChart3 className="h-7 w-7" style={{ color: TEAL_600 }} />
          <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
          <Badge variant="outline" className="mr-auto">وضع تجريبي</Badge>
        </div>
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <UniversityDashboard
            programs={programs}
            waiData={waiData}
            coverageData={coverageData}
            recentAnalyses={recentAnalyses}
            programsCount={programsCount}
            latestAnalysisDate={latestAnalysisDate}
            avgWai={avgWai}
            riskIndex={riskIndex}
          />
        )}
      </div>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7" style={{ color: TEAL_600 }} />
          <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
        </div>

        {loading || authLoading ? (
          <DashboardSkeleton />
        ) : isAdmin ? (
          <AdminDashboard
            universities={adminUniversities}
            disciplines={adminDisciplines}
            totalUniversities={adminTotalUniversities}
            totalPrograms={adminTotalPrograms}
            nationalAvgWai={adminNationalAvgWai}
          />
        ) : (
          <UniversityDashboard
            programs={programs}
            waiData={waiData}
            coverageData={coverageData}
            recentAnalyses={recentAnalyses}
            programsCount={programsCount}
            latestAnalysisDate={latestAnalysisDate}
            avgWai={avgWai}
            riskIndex={riskIndex}
          />
        )}
      </div>
    </AppShell>
  );
}

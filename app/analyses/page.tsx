'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/db/auth-context';
import { supabase } from '@/lib/db/supabase-client';
import type { AnalysisStatus } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  FileSearch,
  Plus,
  Calendar,
  Cpu,
  FileText,
  Building2,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  Loader2,
  Trash2
} from 'lucide-react';

interface AnalysisRow {
  id: string;
  university_name: string;
  discipline_name: string;
  status: AnalysisStatus;
  created_at: string;
  model: string;
  filename: string;
  wai_current: number | null;
  wai_future: number | null;
  gaps_count: number;
}

export default function AnalysesPage() {
  const { profile, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = {
    total: analyses.length,
    completed: analyses.filter(a => a.status === 'completed').length,
    pending: analyses.filter(a => a.status === 'pending').length,
    failed: analyses.filter(a => a.status === 'failed').length,
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAnalyses();
  }, [authLoading]);

  async function fetchAnalyses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
                    id,
                    status,
                    created_at,
                    university_name,
                    discipline_name,
                    degree_level,
                    analysis_goal,
                    model,
                    filename,
                    analysis_results(wai_score, market_skills_score),
                    recommendations(id),
                    programs(name_ar, name, university_id, universities(name))
                `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows: AnalysisRow[] = (data || []).map((item: any) => {
        const results = item.analysis_results?.[0];
        const recoCount = item.recommendations?.length || 0;
        const prog = item.programs;

        return {
          id: item.id,
          university_name: item.university_name || prog?.universities?.name || 'جامعة غير معروفة',
          discipline_name: item.discipline_name || prog?.name_ar || prog?.name || 'تخصص غير معروف',
          status: item.status,
          created_at: item.created_at,
          model: item.model || 'gpt-4o',
          filename: item.filename || 'study_plan.pdf',
          wai_current: results?.wai_score ?? 0,
          wai_future: results?.market_skills_score ?? 0,
          gaps_count: recoCount,
        };
      });

      setAnalyses(rows);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا التحليل؟')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`حدث خطأ أثناء الحذف: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(new Date(dateStr));
  }

  const StatCard = ({ label, value, colorClass, icon: Icon }: { label: string, value: number, colorClass: string, icon: any }) => (
    <Card className="bg-card border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-500">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="h-16 w-16" />
        </div>
        <div className="space-y-1 relative z-10">
          <div className={`text-4xl font-extrabold tracking-tighter ${colorClass} group-hover:scale-105 transition-transform duration-500 origin-left`}>
            {value}
          </div>
          <div className="text-muted-foreground font-semibold text-xs uppercase tracking-widest">{label}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="min-h-screen text-foreground space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1 text-primary text-xs font-bold uppercase tracking-widest">
              <BarChart3 className="h-3 w-3" />
              نظرة عامة
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground">
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground text-lg font-medium">إدارة ومتابعة جميع عمليات التحليل الأكاديمي</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="h-14 bg-background border-border text-foreground hover:bg-muted font-bold gap-3 rounded-2xl px-8"
            >
              <Play className="h-5 w-5 text-rose-500 fill-rose-500" />
              عرض تجريبي
            </Button>
            <Button
              asChild
              className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg rounded-2xl px-8 transition-all gap-3"
            >
              <Link href="/analyses/new">
                <Plus className="h-6 w-6" />
                تحليل جديد
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="إجمالي التحليلات" value={stats.total} colorClass="text-blue-600" icon={BarChart3} />
          <StatCard label="المكتملة بنجاح" value={stats.completed} colorClass="text-emerald-600" icon={CheckCircle2} />
          <StatCard label="تحت المعالجة" value={stats.pending} colorClass="text-amber-600" icon={Clock} />
          <StatCard label="عمليات فاشلة" value={stats.failed} colorClass="text-rose-600" icon={AlertCircle} />
        </div>

        {/* Main List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold text-muted-foreground">التحليلات الأخيرة</h2>
            <div className="text-sm font-medium text-muted-foreground/60">مرتبة حسب الأحدث</div>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-3xl" />
            ))
          ) : analyses.length === 0 ? (
            <Card className="bg-card border-dashed border-border rounded-3xl p-20 text-center">
              <CardContent className="space-y-6">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FileSearch className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-muted-foreground">لا توجد سجلات</h3>
                  <p className="text-muted-foreground/60">ابدأ أول عملية تحليل لرفع البيانات هنا</p>
                </div>
                <Button asChild variant="outline" className="text-muted-foreground">
                  <Link href="/analyses/new">ابدأ الآن</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="bg-card border-border hover:border-primary/40 transition-all duration-500 rounded-3xl overflow-hidden group shadow-sm">
                  <CardContent className="p-0">
                    <div className="p-8 md:p-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-10">

                      <div className="flex-1 space-y-8 text-right" dir="rtl">
                        {/* Meta: Title & Status */}
                        <div className="flex items-center justify-start gap-6">
                          <h3 className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors text-foreground">
                            {analysis.discipline_name}
                          </h3>
                          <Badge variant="outline" className={`
                                                        rounded-2xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest
                                                        ${analysis.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                              analysis.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-600 border-rose-500/20'}
                                                    `}>
                            {analysis.status === 'completed' ? 'مكتمل' :
                              analysis.status === 'pending' ? 'قيد التحليل' : 'خطأ في التنفيذ'}
                          </Badge>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          <div className="space-y-1.5 order-4 lg:order-none">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">تاريخ التحليل</span>
                            </div>
                            <div className="text-sm font-bold text-foreground/80">{formatDate(analysis.created_at)}</div>
                          </div>
                          <div className="space-y-1.5 order-3 lg:order-none">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Cpu className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">نموذج الذكاء</span>
                            </div>
                            <div className="text-sm font-bold text-foreground/80">{analysis.model}</div>
                          </div>
                          <div className="space-y-1.5 order-2 lg:order-none">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">الملف المرفوع</span>
                            </div>
                            <div className="text-sm font-bold text-foreground/80 truncate max-w-[120px]">{analysis.filename}</div>
                          </div>
                          <div className="space-y-1.5 order-1 lg:order-none">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">الجهة التعليمية</span>
                            </div>
                            <div className="text-sm font-bold text-foreground/80">{analysis.university_name}</div>
                          </div>
                        </div>

                        {/* Scores Visualization */}
                        <div className="flex flex-wrap items-center gap-10 pt-6 border-t border-border">
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">مؤشر WAI الحالي</div>
                            <div className="text-2xl font-black text-emerald-600">{analysis.wai_current}%</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">WAI المستهدف</div>
                            <div className="text-2xl font-black text-blue-600">{analysis.wai_future}%</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">الفجوات المكتشفة</div>
                            <div className="text-2xl font-black text-amber-600">{analysis.gaps_count}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="lg:pr-10 lg:border-l lg:border-border flex flex-col justify-center gap-4">
                        <Button
                          asChild
                          disabled={analysis.status !== 'completed'}
                          className="group/btn h-16 w-full lg:w-48 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl transition-all duration-300 gap-3 shadow-md"
                        >
                          <Link href={`/analyses/${analysis.id}`}>
                            عرض التقرير
                            <ChevronLeft className="h-5 w-5 group-hover/btn:-translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(analysis.id)}
                          disabled={deletingId === analysis.id}
                          className="h-12 w-full lg:w-48 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all gap-2"
                        >
                          {deletingId === analysis.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="lg:hidden text-xs font-bold">حذف التحليل</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

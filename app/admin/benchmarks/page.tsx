'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { supabase } from '@/lib/db/supabase-client';
import type { BenchmarkUniversity, BenchmarkSource } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Landmark, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SOURCE_OPTIONS: { value: BenchmarkSource; label: string }[] = [
  { value: 'QS', label: 'QS World University Rankings' },
  { value: 'Shanghai', label: 'Shanghai Ranking (ARWU)' },
  { value: 'GlobalTop5', label: 'Global Top 5' },
  { value: 'SectorLeaders', label: 'Sector Leaders' },
];

interface BenchmarkForm {
  name: string;
  country: string;
  ranking_source: BenchmarkSource;
  discipline: string;
  skill_profile_json: string;
}

const EMPTY_FORM: BenchmarkForm = {
  name: '',
  country: '',
  ranking_source: 'QS',
  discipline: '',
  skill_profile_json: '{}',
};

export default function AdminBenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<BenchmarkUniversity | null>(null);
  const [form, setForm] = useState<BenchmarkForm>(EMPTY_FORM);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBenchmark, setDeletingBenchmark] = useState<BenchmarkUniversity | null>(null);

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  async function fetchBenchmarks() {
    try {
      const { data, error: fetchError } = await supabase
        .from('benchmark_universities')
        .select('*')
        .order('ranking_source')
        .order('name');

      if (fetchError) throw fetchError;
      setBenchmarks(data || []);
    } catch {
      setError('فشل في تحميل الجامعات المرجعية');
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingBenchmark(null);
    setForm(EMPTY_FORM);
    setJsonError(null);
    setDialogOpen(true);
  }

  function openEditDialog(benchmark: BenchmarkUniversity) {
    setEditingBenchmark(benchmark);
    setForm({
      name: benchmark.name,
      country: benchmark.country,
      ranking_source: benchmark.ranking_source,
      discipline: benchmark.discipline,
      skill_profile_json: JSON.stringify(benchmark.skill_profile_json, null, 2),
    });
    setJsonError(null);
    setDialogOpen(true);
  }

  function openDeleteDialog(benchmark: BenchmarkUniversity) {
    setDeletingBenchmark(benchmark);
    setDeleteDialogOpen(true);
  }

  function validateJson(value: string): boolean {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch {
      setJsonError('صيغة JSON غير صحيحة');
      return false;
    }
  }

  async function handleSave() {
    if (!validateJson(form.skill_profile_json)) return;

    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      country: form.country,
      ranking_source: form.ranking_source,
      discipline: form.discipline,
      skill_profile_json: JSON.parse(form.skill_profile_json),
    };

    try {
      if (editingBenchmark) {
        const { error: updateError } = await supabase
          .from('benchmark_universities')
          .update(payload)
          .eq('id', editingBenchmark.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('benchmark_universities')
          .insert(payload);
        if (insertError) throw insertError;
      }

      setDialogOpen(false);
      await fetchBenchmarks();
    } catch {
      setError(
        editingBenchmark
          ? 'فشل في تحديث الجامعة المرجعية'
          : 'فشل في إضافة الجامعة المرجعية'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingBenchmark) return;

    try {
      const { error: deleteError } = await supabase
        .from('benchmark_universities')
        .delete()
        .eq('id', deletingBenchmark.id);
      if (deleteError) throw deleteError;

      setDeleteDialogOpen(false);
      setDeletingBenchmark(null);
      await fetchBenchmarks();
    } catch {
      setError('فشل في حذف الجامعة المرجعية');
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">الجامعات المرجعية</h1>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة جامعة
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : benchmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Landmark className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">
                  لا توجد جامعات مرجعية
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الدولة</TableHead>
                    <TableHead className="text-right">مصدر التصنيف</TableHead>
                    <TableHead className="text-right">التخصص</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarks.map((benchmark) => (
                    <TableRow key={benchmark.id}>
                      <TableCell className="font-medium">{benchmark.name}</TableCell>
                      <TableCell>{benchmark.country}</TableCell>
                      <TableCell>{benchmark.ranking_source}</TableCell>
                      <TableCell>{benchmark.discipline}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(benchmark)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(benchmark)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingBenchmark ? 'تعديل الجامعة المرجعية' : 'إضافة جامعة مرجعية'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدولة</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>مصدر التصنيف</Label>
                  <Select
                    value={form.ranking_source}
                    onValueChange={(val) =>
                      setForm({ ...form, ranking_source: val as BenchmarkSource })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>التخصص</Label>
                  <Input
                    value={form.discipline}
                    onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملف المهارات (JSON)</Label>
                <Textarea
                  value={form.skill_profile_json}
                  onChange={(e) => {
                    setForm({ ...form, skill_profile_json: e.target.value });
                    if (jsonError) validateJson(e.target.value);
                  }}
                  rows={8}
                  dir="ltr"
                  className="font-mono text-sm"
                  placeholder='{"skill_id_1": 0.8, "skill_id_2": 0.6}'
                />
                {jsonError && (
                  <p className="text-sm text-destructive">{jsonError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name || !form.country}
              >
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingBenchmark ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف الجامعة المرجعية</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف &quot;{deletingBenchmark?.name}&quot;؟
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

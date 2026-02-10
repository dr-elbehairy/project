'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { supabase } from '@/lib/db/supabase-client';
import type { Skill, SkillCluster } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CLUSTER_OPTIONS: { value: SkillCluster; label: string }[] = [
  { value: 'market_skills', label: 'مهارات السوق' },
  { value: 'core_academic', label: 'المهارات الأكاديمية' },
  { value: 'future_skills', label: 'مهارات المستقبل' },
  { value: 'soft_skills', label: 'المهارات الناعمة' },
];

const CLUSTER_LABELS: Record<SkillCluster, string> = {
  market_skills: 'مهارات السوق',
  core_academic: 'المهارات الأكاديمية',
  future_skills: 'مهارات المستقبل',
  soft_skills: 'المهارات الناعمة',
};

interface SkillForm {
  name: string;
  name_ar: string;
  cluster: SkillCluster;
  description: string;
  source: string;
  keywords: string;
  weight_default: number;
}

const EMPTY_FORM: SkillForm = {
  name: '',
  name_ar: '',
  cluster: 'market_skills',
  description: '',
  source: '',
  keywords: '',
  weight_default: 1.0,
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCluster, setFilterCluster] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState<SkillForm>(EMPTY_FORM);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    try {
      const { data, error: fetchError } = await supabase
        .from('skill_library')
        .select('*')
        .order('cluster')
        .order('name');

      if (fetchError) throw fetchError;
      setSkills(data || []);
    } catch {
      setError('فشل في تحميل مكتبة المهارات');
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingSkill(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(skill: Skill) {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      name_ar: skill.name_ar,
      cluster: skill.cluster,
      description: skill.description,
      source: skill.source,
      keywords: skill.keywords.join(', '),
      weight_default: skill.weight_default,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(skill: Skill) {
    setDeletingSkill(skill);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      name_ar: form.name_ar,
      cluster: form.cluster,
      description: form.description,
      source: form.source,
      keywords: form.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      weight_default: form.weight_default,
    };

    try {
      if (editingSkill) {
        const { error: updateError } = await supabase
          .from('skill_library')
          .update(payload)
          .eq('id', editingSkill.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('skill_library')
          .insert(payload);
        if (insertError) throw insertError;
      }

      setDialogOpen(false);
      await fetchSkills();
    } catch {
      setError(editingSkill ? 'فشل في تحديث المهارة' : 'فشل في إضافة المهارة');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingSkill) return;

    try {
      const { error: deleteError } = await supabase
        .from('skill_library')
        .delete()
        .eq('id', deletingSkill.id);
      if (deleteError) throw deleteError;

      setDeleteDialogOpen(false);
      setDeletingSkill(null);
      await fetchSkills();
    } catch {
      setError('فشل في حذف المهارة');
    }
  }

  const filteredSkills =
    filterCluster === 'all'
      ? skills
      : skills.filter((s) => s.cluster === filterCluster);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">مكتبة المهارات</h1>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة مهارة
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-3">
          <Label>تصفية حسب المجموعة:</Label>
          <Select value={filterCluster} onValueChange={setFilterCluster}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {CLUSTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredSkills.length} مهارة
          </span>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">
                  لا توجد مهارات
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">المجموعة</TableHead>
                    <TableHead className="text-right">المصدر</TableHead>
                    <TableHead className="text-right">الوزن</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{skill.name_ar || skill.name}</p>
                          {skill.name_ar && (
                            <p className="text-xs text-muted-foreground">
                              {skill.name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CLUSTER_LABELS[skill.cluster]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {skill.source}
                      </TableCell>
                      <TableCell>{skill.weight_default}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(skill)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(skill)}
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
                {editingSkill ? 'تعديل المهارة' : 'إضافة مهارة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الاسم (إنجليزي)</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الاسم (عربي)</Label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>المجموعة</Label>
                <Select
                  value={form.cluster}
                  onValueChange={(val) =>
                    setForm({ ...form, cluster: val as SkillCluster })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLUSTER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>المصدر</Label>
                  <Input
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوزن الافتراضي</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={form.weight_default}
                    onChange={(e) =>
                      setForm({ ...form, weight_default: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الكلمات المفتاحية (مفصولة بفاصلة)</Label>
                <Textarea
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  rows={2}
                  dir="ltr"
                  placeholder="keyword1, keyword2, keyword3"
                />
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
                disabled={saving || !form.name || !form.cluster}
              >
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingSkill ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف المهارة</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف المهارة &quot;{deletingSkill?.name_ar || deletingSkill?.name}&quot;؟
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

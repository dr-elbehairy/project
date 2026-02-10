'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/db/auth-context';
import { supabase } from '@/lib/db/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function NewProgramPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [mode, setMode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim() && nameAr.trim() && degreeLevel && discipline.trim() && mode;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !profile?.university_id) return;

    setSubmitting(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('programs')
        .insert({
          university_id: profile.university_id,
          name: name.trim(),
          name_ar: nameAr.trim(),
          degree_level: degreeLevel,
          discipline: discipline.trim(),
          mode,
          description: description.trim(),
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      if (data) {
        router.push(`/programs/${data.id}`);
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/programs">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">إضافة برنامج جديد</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">بيانات البرنامج</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">اسم البرنامج</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Computer Science"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم البرنامج بالعربي</Label>
                <Input
                  id="nameAr"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="علوم الحاسب"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degreeLevel">المستوى الدراسي</Label>
                <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                  <SelectTrigger id="degreeLevel">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">بكالوريوس</SelectItem>
                    <SelectItem value="master">ماجستير</SelectItem>
                    <SelectItem value="doctorate">دكتوراه</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline">التخصص</Label>
                <Input
                  id="discipline"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  placeholder="مثال: علوم الحاسب، الهندسة الكهربائية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">نمط البرنامج</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="اختر النمط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">تدريسي</SelectItem>
                    <SelectItem value="research">بحثي</SelectItem>
                    <SelectItem value="hybrid">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للبرنامج الأكاديمي..."
                  rows={4}
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={!isValid || submitting}>
                  {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حفظ البرنامج
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href="/programs">إلغاء</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

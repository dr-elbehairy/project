'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/db/auth-context';
import { supabase } from '@/lib/db/supabase-client';
import type { Program, Course, CourseLevel, CourseCategory } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowRight,
  Plus,
  Loader2,
  BookOpen,
  GraduationCap,
  Play,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

const MODE_MAP: Record<string, string> = {
  teaching: 'تدريسي',
  research: 'بحثي',
  hybrid: 'مختلط',
};

const DEGREE_MAP: Record<string, string> = {
  bachelor: 'بكالوريوس',
  master: 'ماجستير',
  doctorate: 'دكتوراه',
};

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'نشط', variant: 'default' },
  draft: { label: 'مسودة', variant: 'secondary' },
  archived: { label: 'مؤرشف', variant: 'outline' },
};

const LEVEL_MAP: Record<CourseLevel, string> = {
  basic: 'أساسي',
  applied: 'تطبيقي',
  advanced: 'متقدم',
};

const CATEGORY_MAP: Record<CourseCategory, string> = {
  core: 'إجباري',
  elective: 'اختياري',
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.id as string;
  const { profile, loading: authLoading } = useAuth();

  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTitleAr, setCourseTitleAr] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseLevel, setCourseLevel] = useState<string>('basic');
  const [courseSemester, setCourseSemester] = useState('1');
  const [courseCategory, setCourseCategory] = useState<string>('core');
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseError, setCourseError] = useState('');

  const fetchData = useCallback(async () => {
    if (!programId) return;
    try {
      const [programResult, coursesResult] = await Promise.all([
        supabase.from('programs').select('*').eq('id', programId).single(),
        supabase
          .from('courses')
          .select('*')
          .eq('program_id', programId)
          .order('semester', { ascending: true })
          .order('code', { ascending: true }),
      ]);

      if (programResult.data) setProgram(programResult.data);
      setCourses(coursesResult.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  function resetCourseForm() {
    setCourseCode('');
    setCourseTitle('');
    setCourseTitleAr('');
    setCourseDescription('');
    setCourseCredits('3');
    setCourseLevel('basic');
    setCourseSemester('1');
    setCourseCategory('core');
    setCourseError('');
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim()) return;

    setCourseSubmitting(true);
    setCourseError('');

    try {
      const { error: insertError } = await supabase.from('courses').insert({
        program_id: programId,
        code: courseCode.trim(),
        title: courseTitle.trim(),
        title_ar: courseTitleAr.trim(),
        description: courseDescription.trim(),
        credits: parseInt(courseCredits, 10) || 3,
        level: courseLevel,
        semester: parseInt(courseSemester, 10) || 1,
        category: courseCategory,
        is_active: true,
      });

      if (insertError) {
        setCourseError(insertError.message);
        return;
      }

      setDialogOpen(false);
      resetCourseForm();
      await fetchData();
    } catch {
      setCourseError('حدث خطأ غير متوقع');
    } finally {
      setCourseSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/programs">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">
            {loading ? 'تحميل...' : program?.name_ar || program?.name || 'البرنامج'}
          </h1>
        </div>

        {loading || authLoading ? (
          <DetailSkeleton />
        ) : !program ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg text-muted-foreground">لم يتم العثور على البرنامج</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {program.name_ar || program.name}
                    </CardTitle>
                    {program.name_ar && program.name && (
                      <CardDescription className="mt-1" dir="ltr">
                        {program.name}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={STATUS_MAP[program.status]?.variant || 'secondary'}>
                    {STATUS_MAP[program.status]?.label || program.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Layers className="h-4 w-4" />
                      المستوى الدراسي
                    </div>
                    <p className="font-medium">
                      {DEGREE_MAP[program.degree_level] || program.degree_level}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      التخصص
                    </div>
                    <p className="font-medium">{program.discipline}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      النمط
                    </div>
                    <p className="font-medium">
                      {MODE_MAP[program.mode] || program.mode}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      تاريخ الإنشاء
                    </div>
                    <p className="font-medium">
                      {new Date(program.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                {program.description && (
                  <div className="mt-6 rounded-md bg-muted/50 p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">المقررات الدراسية</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetCourseForm();
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة مقرر
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <p className="mb-2 font-medium text-muted-foreground">
                      لا توجد مقررات بعد
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      أضف المقررات الدراسية لتحليل البرنامج
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetCourseForm();
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة مقرر
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الرمز</TableHead>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">الساعات</TableHead>
                        <TableHead className="text-right">المستوى</TableHead>
                        <TableHead className="text-right">الفصل</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono text-sm" dir="ltr">
                            {course.code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {course.title_ar || course.title}
                          </TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell>
                            {LEVEL_MAP[course.level as CourseLevel] || course.level}
                          </TableCell>
                          <TableCell>{course.semester}</TableCell>
                          <TableCell>
                            <Badge
                              variant={course.category === 'core' ? 'default' : 'outline'}
                            >
                              {CATEGORY_MAP[course.category as CourseCategory] || course.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={course.is_active ? 'default' : 'secondary'}>
                              {course.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href={`/programs/${programId}/analyze`}>
                  <Play className="ml-2 h-4 w-4" />
                  تشغيل تحليل المواءمة
                </Link>
              </Button>
            </div>
          </>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة مقرر جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المقرر الدراسي
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">رمز المقرر</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="CS101"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseTitle">عنوان المقرر</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Introduction to Computer Science"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseTitleAr">العنوان بالعربي</Label>
                <Input
                  id="courseTitleAr"
                  value={courseTitleAr}
                  onChange={(e) => setCourseTitleAr(e.target.value)}
                  placeholder="مقدمة في علوم الحاسب"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseDescription">الوصف</Label>
                <Textarea
                  id="courseDescription"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="وصف المقرر..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCredits">الساعات المعتمدة</Label>
                  <Input
                    id="courseCredits"
                    type="number"
                    min="1"
                    max="12"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseSemester">الفصل</Label>
                  <Input
                    id="courseSemester"
                    type="number"
                    min="1"
                    max="12"
                    value={courseSemester}
                    onChange={(e) => setCourseSemester(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseLevel">المستوى</Label>
                <Select value={courseLevel} onValueChange={setCourseLevel}>
                  <SelectTrigger id="courseLevel">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">أساسي</SelectItem>
                    <SelectItem value="applied">تطبيقي</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseCategory">النوع</Label>
                <Select value={courseCategory} onValueChange={setCourseCategory}>
                  <SelectTrigger id="courseCategory">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">إجباري</SelectItem>
                    <SelectItem value="elective">اختياري</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {courseError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {courseError}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={!courseCode.trim() || !courseTitle.trim() || courseSubmitting}
                >
                  {courseSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  إضافة المقرر
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

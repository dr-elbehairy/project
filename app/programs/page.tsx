'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/db/auth-context';
import { supabase } from '@/lib/db/supabase-client';
import type { Program, ProgramStatus, ProgramMode } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, GraduationCap, ExternalLink, BookOpen } from 'lucide-react';

const STATUS_MAP: Record<ProgramStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'نشط', variant: 'default' },
  draft: { label: 'مسودة', variant: 'secondary' },
  archived: { label: 'مؤرشف', variant: 'outline' },
};

const MODE_MAP: Record<ProgramMode, string> = {
  teaching: 'تدريسي',
  research: 'بحثي',
  hybrid: 'مختلط',
};

const DEGREE_MAP: Record<string, string> = {
  bachelor: 'بكالوريوس',
  master: 'ماجستير',
  doctorate: 'دكتوراه',
};

function ProgramsTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export default function ProgramsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile?.university_id) {
      setLoading(false);
      return;
    }
    fetchPrograms();
  }, [authLoading, profile]);

  async function fetchPrograms() {
    try {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('university_id', profile!.university_id!)
        .order('created_at', { ascending: false });

      setPrograms(data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">البرامج الأكاديمية</h1>
          </div>
          <Button asChild>
            <Link href="/programs/new">
              <Plus className="ml-2 h-4 w-4" />
              إضافة برنامج
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading || authLoading ? (
              <div className="p-6">
                <ProgramsTableSkeleton />
              </div>
            ) : programs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-2 text-lg font-medium text-muted-foreground">
                  لا توجد برامج بعد
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  ابدأ بإضافة برنامجك الأكاديمي الأول
                </p>
                <Button asChild>
                  <Link href="/programs/new">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة برنامج
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">المستوى</TableHead>
                    <TableHead className="text-right">التخصص</TableHead>
                    <TableHead className="text-right">النمط</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => {
                    const status = STATUS_MAP[program.status as ProgramStatus] || STATUS_MAP.draft;
                    return (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/programs/${program.id}`}
                            className="text-primary hover:underline"
                          >
                            {program.name_ar || program.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {DEGREE_MAP[program.degree_level] || program.degree_level}
                        </TableCell>
                        <TableCell>{program.discipline}</TableCell>
                        <TableCell>
                          {MODE_MAP[program.mode as ProgramMode] || program.mode}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/programs/${program.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
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
    </AppShell>
  );
}

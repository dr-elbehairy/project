'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/db/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.push('/auth/login');
      return;
    }

    if (
      profile.role === 'university_user' &&
      !profile.onboarding_completed
    ) {
      router.push('/onboarding');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={profile.role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          collapsed ? 'mr-[72px]' : 'mr-[280px]'
        )}
      >
        <Topbar
          userName={profile.full_name || profile.email}
          userRole={profile.role}
          universityName=""
          onLogout={handleLogout}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

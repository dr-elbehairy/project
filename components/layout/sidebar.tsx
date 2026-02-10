'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  BookOpen,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  role: string | undefined;
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  {
    label: '\u0644\u0648\u062D\u0629 \u0627\u0644\u0642\u064A\u0627\u062F\u0629',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: '\u0627\u0644\u0628\u0631\u0627\u0645\u062C',
    href: '/programs',
    icon: GraduationCap,
  },
  {
    label: '\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A',
    href: '/analyses',
    icon: BarChart3,
  },
];

const adminNavItems = [
  {
    label: '\u0627\u0644\u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u0645\u0647\u0627\u0631\u064A\u0629',
    href: '/admin/skills',
    icon: BookOpen,
  },
  {
    label: '\u0627\u0644\u062C\u0627\u0645\u0639\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629',
    href: '/admin/benchmarks',
    icon: Building2,
  },
  {
    label: '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const showAdmin = role === 'admin';

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed top-0 right-0 z-40 h-screen border-l bg-card transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b px-4 h-16 shrink-0',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                و
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-foreground">
                  واكب
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  منصة موائمة المناهج
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                و
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground',
              collapsed && 'absolute -left-3 top-5 z-50 rounded-full border bg-card shadow-sm h-6 w-6'
            )}
          >
            {collapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="left" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}

          {showAdmin && (
            <>
              <div
                className={cn(
                  'pt-4 pb-2',
                  collapsed ? 'px-0' : 'px-3'
                )}
              >
                {!collapsed ? (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    الإدارة
                  </span>
                ) : (
                  <div className="mx-auto h-px w-6 bg-border" />
                )}
              </div>
              {adminNavItems.map((item) => {
                const active = isActive(item.href);
                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-0'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="left" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </>
          )}
        </nav>

        <div
          className={cn(
            'shrink-0 border-t px-3 py-3',
            collapsed ? 'text-center' : ''
          )}
        >
          {!collapsed && (
            <p className="text-[11px] text-muted-foreground text-center">
              واكب v1.0
            </p>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

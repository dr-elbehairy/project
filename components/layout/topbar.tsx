'use client';

import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopbarProps {
  userName: string;
  userRole: string;
  universityName: string;
  onLogout: () => void;
}

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: {
    label: 'مدير النظام',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  },
  university_user: {
    label: 'مستخدم جامعي',
    className: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100',
  },
  reviewer: {
    label: 'مراجع',
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
};

export function Topbar({ userName, userRole, universityName, onLogout }: TopbarProps) {
  const role = roleConfig[userRole] || roleConfig.university_user;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {userName}
            </span>
            {universityName && (
              <span className="text-xs text-muted-foreground leading-tight">
                {universityName}
              </span>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn('text-[10px] px-2 py-0.5 font-medium', role.className)}
          >
            {role.label}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">تسجيل الخروج</span>
        </Button>
      </div>
    </header>
  );
}

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotices } from '@/hooks/useNotices';

export function MobileBottomNav() {
  const location = useLocation();
  const { role, isCreator, isHOD, isSuperAdmin } = useAuth();
  const { notices } = useNotices('pending');
  const pendingCount = notices.length;

  const navItems = [
    {
      title: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: 'Notices',
      href: '/notices',
      icon: FileText,
      show: true,
    },
    {
      title: 'Create',
      href: '/notices/create',
      icon: PlusCircle,
      show: isCreator || isHOD || isSuperAdmin,
      accent: true,
    },
    {
      title: 'HOD Queue',
      href: '/approval-queue',
      icon: CheckSquare,
      badge: pendingCount,
      show: isHOD || isSuperAdmin,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      show: true,
    },
  ].filter((item) => item.show);

  // Limit to 5 items max
  const displayItems = navItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 h-16">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 px-0.5 rounded-lg transition-colors relative min-w-0',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              {item.accent ? (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md -mt-4">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground px-0.5">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={cn(
                'text-[9px] xs:text-[10px] font-medium leading-tight truncate max-w-full',
                item.accent && '-mt-0.5'
              )}>
                {item.title}
              </span>
              {isActive && !item.accent && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

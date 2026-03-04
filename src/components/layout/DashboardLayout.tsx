import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  Users,
  Building2,
  Settings,
  Monitor,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Header } from './Header';
import { GlobalAlertBanner } from '@/components/notices/GlobalAlertBanner';
import { useAuth } from '@/hooks/useAuth';
import { useNotices } from '@/hooks/useNotices';

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: number;
  roles?: ('viewer' | 'creator' | 'approver' | 'super_admin')[];
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isAuthenticated, signOut, profile } = useAuth();
  const { notices } = useNotices('pending');

  const pendingCount = notices.length;

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'All Notices',
      href: '/notices',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Create Notice',
      href: '/notices/create',
      icon: <PlusCircle className="h-5 w-5" />,
      roles: ['creator', 'approver', 'super_admin'],
    },
    {
      title: 'Pending Approval',
      href: '/approval-queue',
      icon: <CheckSquare className="h-5 w-5" />,
      badge: pendingCount,
      roles: ['approver', 'super_admin'],
    },
    {
      title: 'Manage Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      roles: ['super_admin'],
    },
    {
      title: 'Departments',
      href: '/admin/departments',
      icon: <Building2 className="h-5 w-5" />,
      roles: ['super_admin'],
    },
    {
      title: 'Digital Signage',
      href: '/signage',
      icon: <Monitor className="h-5 w-5" />,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalAlertBanner />
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} pendingCount={pendingCount} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar transition-all duration-300 md:relative md:translate-x-0',
            collapsed ? 'w-16' : 'w-64',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
          style={{ top: '64px' }}
        >
          {/* Collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-4 hidden h-6 w-6 rounded-full border bg-background md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </Button>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="border-t border-sidebar-border p-2">
            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              {!collapsed && <span>Settings</span>}
            </Link>
            <button
              onClick={handleSignOut}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive'
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

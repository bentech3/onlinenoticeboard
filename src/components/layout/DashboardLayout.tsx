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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
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
    {
      title: 'System Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      roles: ['super_admin'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isPublicRoute = location.pathname.startsWith('/notices/') && !location.pathname.endsWith('/create') && !location.pathname.endsWith('/edit');

  if (!isAuthenticated && !isPublicRoute) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <GlobalAlertBanner />
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        pendingCount={pendingCount}
        showNav={isAuthenticated}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {isAuthenticated && (
          <aside
            className={cn(
              'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300 relative',
              collapsed ? 'w-16' : 'w-64'
            )}
          >
            {/* Collapse button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background flex z-50"
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
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                          : item.href === '/notices/create'
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                      )}
                    >
                      <div className={cn(
                        "transition-transform duration-200 group-hover:scale-110",
                        isActive && "scale-110",
                        item.href === '/notices/create' && !isActive && "text-primary-foreground transition-colors"
                      )}>
                        {item.icon}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 relative z-10 transition-colors uppercase tracking-tight text-xs font-bold">
                            {item.title}
                          </span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-sidebar-background/10">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
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
        )}

        {/* Mobile sidebar drawer */}
        {isAuthenticated && sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-sidebar md:hidden animate-in slide-in-from-left duration-200"
            >
              {/* Mobile sidebar header */}
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <span className="text-sm font-bold text-sidebar-foreground uppercase tracking-wider">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 py-2">
                <nav className="space-y-0.5 px-2">
                  {filteredNavItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                            : item.href === '/notices/create'
                              ? 'bg-primary/10 text-primary active:bg-primary/20'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className={cn(
                          "transition-transform duration-200 group-hover:scale-110",
                          isActive && "scale-110",
                          item.href === '/notices/create' && !isActive && "text-primary transition-colors"
                        )}>
                          {item.icon}
                        </div>
                        <span className="flex-1 uppercase tracking-tight text-xs font-bold">
                          {item.title}
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-sidebar-background/10">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-sidebar-primary rounded-r-full" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              <div className="border-t border-sidebar-border p-2 safe-area-bottom">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => { setSidebarOpen(false); handleSignOut(); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative bg-background/50">
          <div className="px-3 py-4 md:container md:py-6 pb-24 md:pb-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isAuthenticated && <MobileBottomNav />}
    </div>
  );
}

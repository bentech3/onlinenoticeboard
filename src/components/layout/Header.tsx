import { Link, useNavigate } from 'react-router-dom';
import ucuLogo from '@/assets/ucu-logo.png';
import { Menu, Search, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { cn } from '@/lib/utils';
import { Hammer } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  pendingCount?: number;
  showNav?: boolean;
}

export function Header({ onMenuClick, pendingCount = 0, showNav = true }: HeaderProps) {
  const { user, profile, role, isAuthenticated, signOut } = useAuth();
  const { maintenanceEnabled } = useSystemSettings();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getGreeting = () => {
    return 'Welcome back';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    const roleStyles = {
      super_admin: 'bg-primary text-primary-foreground',
      approver: 'bg-info text-info-foreground',
      creator: 'bg-success text-success-foreground',
      viewer: 'bg-muted text-muted-foreground',
    };

    const roleLabels = {
      super_admin: 'Admin',
      approver: 'Approver',
      creator: 'Creator',
      viewer: 'Viewer',
    };

    return (
      <Badge className={cn('text-xs', roleStyles[role])}>
        {roleLabels[role]}
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 md:h-16 items-center gap-2 px-3 md:px-6">
        {/* Mobile menu button */}
        {showNav && onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <img src={ucuLogo} alt="UCU Logo" className="h-7 md:h-10 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-[11px] xs:text-sm md:text-lg font-bold tracking-tight text-primary group-hover:text-primary/80 transition-colors uppercase leading-none">BBUC Notice Board</h1>
            <p className="hidden xs:block text-[8px] md:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">UCU Main Campus</p>
          </div>
        </Link>

        {/* Search */}
        {isAuthenticated && (
          <div className="flex-1 max-w-sm mx-auto px-1 md:px-0">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground bg-muted/30 border-muted hover:bg-muted/50 hover:border-primary/20 transition-all h-8 md:h-10 px-2 md:px-4"
              onClick={() => navigate('/dashboard')}
            >
              <Search className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs md:text-sm">Search...</span>
            </Button>
          </div>
        )}

        {/* Maintenance Indicator (For Admins) */}
        {maintenanceEnabled && role === 'super_admin' && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/30 rounded-full animate-pulse">
            <Hammer className="h-4 w-4 text-warning" />
            <span className="text-[10px] font-bold text-warning uppercase tracking-widest leading-none">Maintenance Active</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 md:gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationCenter />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 px-1.5 md:px-2 hover:bg-primary/5 transition-all duration-300 group rounded-full md:rounded-lg"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {getInitials(profile?.full_name || user?.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col items-start md:flex">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {role === 'super_admin' ? 'Admin Panel' : (profile?.full_name || 'User')}
                      </span>
                      {getRoleBadge()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-muted-foreground">{getGreeting()}!</p>
                      <p className="text-sm font-medium">
                        {role === 'super_admin' ? 'Administrator' : profile?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {role === 'super_admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth?mode=signup')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

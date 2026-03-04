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
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  pendingCount?: number;
}

export function Header({ onMenuClick, pendingCount = 0 }: HeaderProps) {
  const { user, profile, role, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={ucuLogo} alt="UCU Logo" className="h-10 w-auto" />
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">ONBS</h1>
            <p className="text-xs text-muted-foreground">UCU-BBUC</p>
          </div>
        </Link>

        {/* Search (hidden on mobile) */}
        {isAuthenticated && (
          <div className="hidden flex-1 md:flex md:max-w-md md:mx-auto">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => navigate('/dashboard')}
            >
              <Search className="mr-2 h-4 w-4" />
              Search notices...
            </Button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationCenter />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(profile?.full_name || user?.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col items-start md:flex">
                      <span className="text-sm font-medium">
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
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth?mode=signup')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

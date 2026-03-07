import { Hammer, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface MaintenanceOverlayProps {
    message: string;
}

export function MaintenanceOverlay({ message }: MaintenanceOverlayProps) {
    const navigate = useNavigate();
    const { isAuthenticated, isSuperAdmin, signOut } = useAuth();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="max-w-md w-full mx-4 p-8 bg-card border rounded-2xl shadow-2xl text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full animate-bounce">
                        <Hammer className="h-12 w-12 text-primary" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight mb-2">System Maintenance</h1>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    {message}
                </p>

                <div className="space-y-4">
                    {!isAuthenticated ? (
                        <Button
                            className="w-full h-12 text-lg font-semibold"
                            onClick={() => navigate('/auth')}
                        >
                            Sign In (Admins Only)
                        </Button>
                    ) : isSuperAdmin ? (
                        <div className="space-y-2">
                            <p className="text-sm text-info font-medium flex items-center justify-center gap-2">
                                <Lock className="h-4 w-4" />
                                You are logged in as Admin
                            </p>
                            <Button
                                className="w-full h-12 text-lg font-semibold"
                                onClick={() => navigate('/admin/settings')}
                            >
                                Go to Admin Settings
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-destructive font-medium">
                                Access is restricted to administrators during maintenance.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full h-12 text-lg"
                                onClick={() => signOut()}
                            >
                                Sign Out
                            </Button>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-8">
                        BBUC Digital Notice Board &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}

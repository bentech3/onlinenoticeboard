import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { Hammer, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminSystemSettings() {
    const { isSuperAdmin } = useAuth();
    const { maintenanceEnabled, maintenanceMessage, updateSetting, isLoading } = useSystemSettings();

    const [isEnabled, setIsEnabled] = useState(maintenanceEnabled);
    const [message, setMessage] = useState(maintenanceMessage);

    useEffect(() => {
        setIsEnabled(maintenanceEnabled);
        setMessage(maintenanceMessage);
    }, [maintenanceEnabled, maintenanceMessage]);

    const handleSave = async () => {
        try {
            await updateSetting.mutateAsync({
                key: 'maintenance_mode',
                value: { enabled: isEnabled, message: message }
            });
            toast.success('System settings updated successfully');
        } catch (error) {
            toast.error('Failed to update system settings');
        }
    };

    if (!isSuperAdmin) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold italic">Unauthorized Access</h1>
                    <p className="text-muted-foreground mt-2">
                        You do not have permission to access system settings.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                        <p className="text-muted-foreground">
                            Manage global application state and maintenance status
                        </p>
                    </div>
                    <Button
                        className="w-full md:w-auto font-bold uppercase tracking-tight"
                        onClick={handleSave}
                        disabled={updateSetting.isPending || isLoading}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary uppercase tracking-wider font-extrabold text-sm">
                            <Hammer className="h-5 w-5" />
                            Maintenance Mode
                        </CardTitle>
                        <CardDescription className="text-muted-foreground/80 font-medium">
                            Toggle global maintenance mode to restrict access to the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-background rounded-xl border shadow-sm">
                            <div className="space-y-1">
                                <Label htmlFor="maintenance-mode" className="text-base font-bold uppercase tracking-tighter">Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    {isEnabled ? 'System is currently restricted' : 'System is accessible to all users'}
                                </p>
                            </div>
                            <Switch
                                id="maintenance-mode"
                                checked={isEnabled}
                                onCheckedChange={setIsEnabled}
                                className="scale-125"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maintenance-message" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Maintenance Message</Label>
                            <Textarea
                                id="maintenance-message"
                                placeholder="Enter the message users will see during maintenance..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[120px] bg-background border-primary/10 hover:border-primary/30 transition-colors"
                            />
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3 text-warning" />
                                This message will be visible to all non-admin users.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {isEnabled && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-warning/20 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                            <h4 className="font-bold text-warning uppercase text-xs tracking-widest mb-1">Warning: Maintenance Active</h4>
                            <p className="text-sm text-muted-foreground">
                                While maintenance mode is active, only Super Admins can interact with the system. Other users (including Creators and Approvers) will be redirected to the maintenance screen.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

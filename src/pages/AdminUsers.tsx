import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { GlobalAlertManager } from '@/components/admin/GlobalAlertManager';
import { SignageProfileManager } from '@/components/admin/SignageProfileManager';
import { ReadStatusHeatmap } from '@/components/admin/ReadStatusHeatmap';
import { useAuth } from '@/hooks/useAuth';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isSuperAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, signage, alerts, and monitor engagement
          </p>
        </div>

        <GlobalAlertManager />
        <UserManagement />
        <SignageProfileManager />
        <ReadStatusHeatmap />
      </div>
    </DashboardLayout>
  );
}

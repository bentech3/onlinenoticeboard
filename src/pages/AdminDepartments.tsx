import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DepartmentManagement } from '@/components/admin/DepartmentManagement';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDepartments() {
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
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-muted-foreground">
            Create and manage organizational departments
          </p>
        </div>

        <DepartmentManagement />
      </div>
    </DashboardLayout>
  );
}

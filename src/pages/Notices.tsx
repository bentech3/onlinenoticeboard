import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoticeList } from '@/components/notices/NoticeList';
import { NoticeFilters } from '@/components/notices/NoticeFilters';
import { useNotices } from '@/hooks/useNotices';
import { NoticeStatus } from '@/lib/types';
import { useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { History } from 'lucide-react';

export default function Notices() {
  const { notices: approvedNotices, isLoading } = useNotices('approved');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<NoticeStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showOutdated, setShowOutdated] = useState(true);

  const filteredNotices = useMemo(() => {
    return approvedNotices
      .filter((notice) => !notice.is_archived) // Hide archived
      .filter((notice) => {
        const isExpired = notice.expires_at && new Date(notice.expires_at) < new Date();
        const isOutdated = notice.is_outdated || isExpired;
        
        // If not showing outdated, hide them. 
        // This ensures "Current" is default but "All" is accessible.
        if (!showOutdated && isOutdated) return false;

        const matchesSearch = !searchTerm || 
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = !departmentFilter || notice.department_id === departmentFilter;
        const matchesCategory = !categoryFilter || notice.category === categoryFilter;
        
        return matchesSearch && matchesDepartment && matchesCategory;
      });
  }, [approvedNotices, searchTerm, departmentFilter, categoryFilter, showOutdated]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">All University Notices</h1>
            <p className="text-muted-foreground">
              Browse all published notices from university departments
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
            <History className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="show-outdated" className="text-sm font-medium cursor-pointer">Show Outdated</Label>
            <Switch 
              id="show-outdated" 
              checked={showOutdated} 
              onCheckedChange={setShowOutdated}
            />
          </div>
        </div>

        <NoticeFilters
          onSearchChange={setSearchTerm}
          onDepartmentChange={setDepartmentFilter}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
        />

        <NoticeList
          notices={filteredNotices}
          isLoading={isLoading}
          emptyMessage={showOutdated ? "Really no notices found" : "No current notices found. Try enabling 'Show Outdated'."}
        />
      </div>
    </DashboardLayout>
  );
}

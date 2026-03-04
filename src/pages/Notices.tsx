import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoticeList } from '@/components/notices/NoticeList';
import { NoticeFilters } from '@/components/notices/NoticeFilters';
import { useNotices } from '@/hooks/useNotices';
import { NoticeStatus } from '@/lib/types';
import { useMemo } from 'react';

export default function Notices() {
  const { notices: approvedNotices, isLoading } = useNotices('approved');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<NoticeStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredNotices = useMemo(() => {
    return approvedNotices
      .filter((notice) => !notice.is_archived) // Hide archived
      .filter((notice) => {
        // Hide expired
        if (notice.expires_at && new Date(notice.expires_at) < new Date()) return false;

        const matchesSearch = !searchTerm || 
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = !departmentFilter || notice.department_id === departmentFilter;
        const matchesCategory = !categoryFilter || notice.category === categoryFilter;
        
        return matchesSearch && matchesDepartment && matchesCategory;
      });
  }, [approvedNotices, searchTerm, departmentFilter, categoryFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">All Notices</h1>
          <p className="text-muted-foreground">
            Browse all published notices from university departments
          </p>
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
          emptyMessage="No notices match your filters"
        />
      </div>
    </DashboardLayout>
  );
}

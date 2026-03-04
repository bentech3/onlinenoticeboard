import { useMemo, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Plus, TrendingUp, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoticeList } from '@/components/notices/NoticeList';
import { NoticeFilters } from '@/components/notices/NoticeFilters';
import { useAuth } from '@/hooks/useAuth';
import { useNotices } from '@/hooks/useNotices';
import { useBookmarkedNotices } from '@/hooks/useNoticeBookmarks';
import { NoticeStatus } from '@/lib/types';

export default function Dashboard() {
  const { profile, role, isCreator, isApprover, isSuperAdmin } = useAuth();
  const { notices: allNotices, isLoading } = useNotices();
  const { notices: approvedNotices } = useNotices('approved');
  const { notices: pendingNotices } = useNotices('pending');
  const { data: bookmarkedNotices = [], isLoading: bookmarksLoading } = useBookmarkedNotices();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<NoticeStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    const myNotices = allNotices.filter((n) => n.created_by === profile?.id);
    return {
      total: allNotices.length,
      approved: allNotices.filter((n) => n.status === 'approved').length,
      pending: allNotices.filter((n) => n.status === 'pending').length,
      rejected: allNotices.filter((n) => n.status === 'rejected').length,
      myDrafts: myNotices.filter((n) => n.status === 'draft').length,
      myPending: myNotices.filter((n) => n.status === 'pending').length,
    };
  }, [allNotices, profile?.id]);

  // Filter notices based on search and filters
  const filteredNotices = useMemo(() => {
    return approvedNotices.filter((notice) => {
      const matchesSearch = !searchTerm ||
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !departmentFilter || notice.department_id === departmentFilter;
      const matchesStatus = !statusFilter || notice.status === statusFilter;
      const matchesCategory = !categoryFilter || notice.category === categoryFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesCategory;
    });
  }, [approvedNotices, searchTerm, departmentFilter, statusFilter, categoryFilter]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.full_name?.split(' ')[0] || 'User';

    if (hour >= 5 && hour < 12) {
      return `Good Morning, ${name} 👋`;
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon, ${name} 👋`;
    } else if (hour >= 17 && hour < 21) {
      return `Good Evening, ${name} 👋`;
    } else {
      return `Hello, ${name} 🌙`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {getGreeting()}!
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdmin
                ? "Manage all notices and system settings"
                : isApprover
                  ? "Review and approve pending notices"
                  : isCreator
                    ? "Create and manage your notices"
                    : "Stay updated with the latest notices"}
            </p>
          </div>

          {isCreator && (
            <Button asChild>
              <Link to="/notices/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Notice
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Published notices</p>
            </CardContent>
          </Card>

          {isApprover && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  <Link to="/approval-queue" className="hover:underline">Review now →</Link>
                </p>
              </CardContent>
            </Card>
          )}

          {isCreator && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Drafts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.myDrafts}</div>
                  <p className="text-xs text-muted-foreground">Unpublished drafts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.myPending}</div>
                  <p className="text-xs text-muted-foreground">Submitted for approval</p>
                </CardContent>
              </Card>
            </>
          )}

          {!isCreator && !isApprover && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {approvedNotices.filter(n => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(n.created_at) > weekAgo;
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">New notices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(approvedNotices.map(n => n.department_id)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">Active departments</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList>
            <TabsTrigger value="feed">Notice Feed</TabsTrigger>
            {isCreator && <TabsTrigger value="my-notices">My Notices</TabsTrigger>}
            <TabsTrigger value="saved">
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
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
          </TabsContent>

          {isCreator && (
            <TabsContent value="my-notices" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Notices</h2>
                <Button asChild size="sm">
                  <Link to="/notices/create">
                    <Plus className="mr-2 h-4 w-4" />
                    New Notice
                  </Link>
                </Button>
              </div>

              <NoticeList
                notices={allNotices.filter((n) => n.created_by === profile?.id)}
                isLoading={isLoading}
                showStatus
                emptyMessage="You haven't created any notices yet"
              />
            </TabsContent>
          )}

          <TabsContent value="saved" className="space-y-6">
            <h2 className="text-lg font-semibold">Saved Notices</h2>
            <NoticeList
              notices={bookmarkedNotices}
              isLoading={bookmarksLoading}
              emptyMessage="You haven't saved any notices yet. Click the bookmark icon on a notice to save it."
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

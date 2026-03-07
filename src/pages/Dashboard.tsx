import { useMemo, useState } from 'react';
import { FileText, Clock, CheckCircle, TrendingUp, Plus, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    if (hour >= 5 && hour < 12) return `Good Morning, ${name} 👋`;
    if (hour >= 12 && hour < 17) return `Good Afternoon, ${name} 👋`;
    if (hour >= 17 && hour < 21) return `Good Evening, ${name} 👋`;
    return `Hello, ${name} 🌙`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">
              {getGreeting()}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
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
            <Button asChild size="sm" className="w-full md:w-auto">
              <Link to="/notices/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Notice
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards - horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-visible">
          <Card className="min-w-[140px] md:min-w-0 shrink-0 md:shrink">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Notices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground hidden md:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.approved}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>

          {isApprover && (
            <Card className="min-w-[140px] md:min-w-0 shrink-0 md:shrink border-warning/50 bg-warning/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-6 md:pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-warning hidden md:block" />
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold text-warning">{stats.pending}</div>
                <Link to="/approval-queue" className="text-[10px] md:text-xs text-muted-foreground hover:underline">Review →</Link>
              </CardContent>
            </Card>
          )}

          {isCreator && (
            <>
              <Card className="min-w-[140px] md:min-w-0 shrink-0 md:shrink">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">My Drafts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground hidden md:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-xl md:text-2xl font-bold">{stats.myDrafts}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Unpublished</p>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] md:min-w-0 shrink-0 md:shrink">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Awaiting</CardTitle>
                  <Clock className="h-4 w-4 text-warning hidden md:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-xl md:text-2xl font-bold">{stats.myPending}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">For approval</p>
                </CardContent>
              </Card>
            </>
          )}

          {!isCreator && !isApprover && (
            <>
              <Card className="min-w-[140px] md:min-w-0 shrink-0 md:shrink">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success hidden md:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-xl md:text-2xl font-bold">
                    {approvedNotices.filter(n => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(n.created_at) > weekAgo;
                    }).length}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">New notices</p>
                </CardContent>
              </Card>

              <Card className="min-w-[140px] md:min-w-0 shrink-0 md:shrink">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Departments</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success hidden md:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-xl md:text-2xl font-bold">
                    {new Set(approvedNotices.map(n => n.department_id)).size}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Active</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feed" className="space-y-4 md:space-y-6">
          <TabsList className="w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="feed" className="text-xs md:text-sm">Feed</TabsTrigger>
            {isCreator && <TabsTrigger value="my-notices" className="text-xs md:text-sm">My Notices</TabsTrigger>}
            <TabsTrigger value="saved" className="text-xs md:text-sm">
              <Bookmark className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 md:space-y-6">
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
            <TabsContent value="my-notices" className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold">Your Notices</h2>
                <Button asChild size="sm">
                  <Link to="/notices/create">
                    <Plus className="mr-2 h-4 w-4" />
                    New
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

          <TabsContent value="saved" className="space-y-4 md:space-y-6">
            <h2 className="text-base md:text-lg font-semibold">Saved Notices</h2>
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

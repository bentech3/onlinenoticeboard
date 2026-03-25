import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
import { useDepartments } from '@/hooks/useDepartments';
import { NoticeStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn, getDepartmentColor } from '@/lib/utils';
import { Building2, Settings2, ShieldCheck, History } from 'lucide-react';
import { useUpdateNotice } from '@/hooks/useNotices';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { profile, role, isCreator, isHOD, isSuperAdmin } = useAuth();
  
  // Define target department for notice delivery
  // Students and Staff see notices for their department + general
  const targetDept = !isSuperAdmin ? profile?.department_id : undefined;

  const { notices: allNotices, isLoading } = useNotices();
  const { notices: approvedNotices } = useNotices('approved', undefined, targetDept);
  const { notices: pendingNotices } = useNotices('pending', isHOD && !isSuperAdmin ? profile?.department_id : undefined);
  const { data: bookmarkedNotices = [], isLoading: bookmarksLoading } = useBookmarkedNotices();
  const { data: departments = [] } = useDepartments();
  const updateNotice = useUpdateNotice();

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
    return `Welcome back ✨`;
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
                ? "System Administrator: Manage all notices and university settings"
                : isHOD
                  ? "Head of Department: Review and approve pending departmental notices"
                  : isCreator
                    ? "Staff / Lecturer: Create and manage your academic notices"
                    : "Student: Stay updated with the latest university notices"}
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
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-visible">
          <Card className="min-w-[150px] md:min-w-0 shrink-0 md:shrink border-none bg-card/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Total Notices</CardTitle>
              <FileText className="h-4 w-4 text-primary hidden md:block" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-primary">{stats.approved}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">Published</p>
            </CardContent>
          </Card>

          {isHOD && (
            <Card className="min-w-[150px] md:min-w-0 shrink-0 md:shrink border-none bg-orange-500/10 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-500 hidden md:block" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-orange-500">{stats.pending}</div>
                <Link to="/approval-queue" className="text-[10px] md:text-xs text-muted-foreground hover:underline uppercase tracking-wider font-medium">Review →</Link>
              </CardContent>
            </Card>
          )}

          {isCreator && (
            <>
              <Card className="min-w-[150px] md:min-w-0 shrink-0 md:shrink border-none bg-card/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">My Drafts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground hidden md:block" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl md:text-3xl font-bold">{stats.myDrafts}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">Unpublished</p>
                </CardContent>
              </Card>

              <Card className="min-w-[150px] md:min-w-0 shrink-0 md:shrink border-none bg-orange-500/5 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">Awaiting</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500 hidden md:block" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">{stats.myPending}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">For approval</p>
                </CardContent>
              </Card>
            </>
          )}

          {!isCreator && !isHOD && (
            <>
              <Card className="min-w-[150px] md:min-w-0 shrink-0 md:shrink border-none bg-success/10 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success hidden md:block" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-success">
                    {approvedNotices.filter(n => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(n.created_at) > weekAgo;
                    }).length}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">New notices</p>
                </CardContent>
              </Card>

              <Card className="min-w-[150px] md:min-w-0 shrink-0 md:shrink border-none bg-info/10 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                  <CardTitle className="text-xs md:text-sm font-medium">Departments</CardTitle>
                  <CheckCircle className="h-4 w-4 text-info hidden md:block" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-info">
                    {new Set(approvedNotices.map(n => n.department_id)).size}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">Active</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Department Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Browse by Department
            </h2>
            {departmentFilter && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDepartmentFilter(null)}
                className="h-7 text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-tighter"
              >
                Clear Filter
              </Button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
            <Button
              variant={departmentFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDepartmentFilter(null)}
              className={cn(
                "shrink-0 h-9 rounded-full px-4 font-bold uppercase tracking-tight text-xs",
                departmentFilter === null ? "shadow-md" : "hover:bg-muted"
              )}
            >
              All Departments
            </Button>
            {departments.map((dept) => {
              const isActive = departmentFilter === dept.id;
              const deptColor = getDepartmentColor(dept.name);
              
              return (
                <Button
                  key={dept.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDepartmentFilter(dept.id)}
                  className={cn(
                    "shrink-0 h-9 rounded-full px-4 font-bold uppercase tracking-tight text-xs transition-all",
                    isActive ? [deptColor, "border-transparent shadow-lg scale-105"] : "hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    isActive ? "bg-white" : deptColor
                  )} />
                  {dept.name}
                </Button>
              );
            })}
          </div>
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
            {(isSuperAdmin || isHOD) && (
              <TabsTrigger value="manage" className="text-xs md:text-sm gap-1.5">
                <Settings2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Manage Board
              </TabsTrigger>
            )}
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

          {(isSuperAdmin || isHOD) && (
            <TabsContent value="manage" className="space-y-4 md:space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Board Management
                  </h2>
                  <p className="text-sm text-muted-foreground">Quickly mark notices as outdated to update the digital signage.</p>
                </div>
              </div>

              <Card className="border-none bg-card/50 shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                  {approvedNotices
                    .filter(n => isSuperAdmin || n.department_id === profile?.department_id)
                    .map((notice) => (
                    <div key={notice.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm truncate">{notice.title}</h3>
                          {notice.is_outdated && (
                            <Badge variant="outline" className="text-[10px] h-5 border-warning text-warning bg-warning/5 gap-1">
                              <History className="h-3 w-3" /> OUTDATED
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className={cn("font-semibold py-0.5 px-2 rounded text-[10px] text-white", getDepartmentColor(notice.department?.name))}>
                            {notice.department?.name}
                          </span>
                          <span>{formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <Button
                        variant={notice.is_outdated ? "outline" : "default"}
                        size="sm"
                        className={cn(
                          "h-8 text-xs font-bold transition-all",
                          notice.is_outdated ? "border-warning text-warning hover:bg-warning/10" : "bg-primary hover:bg-primary/90 shadow-md"
                        )}
                        onClick={async () => {
                          try {
                            await updateNotice.mutateAsync({ 
                              id: notice.id, 
                              is_outdated: !notice.is_outdated 
                            });
                            toast({
                              title: !notice.is_outdated ? "Notice marked as OUTDATED" : "Notice marked as CURRENT",
                              description: `Signage board has been updated.`,
                            });
                          } catch (err) {
                            toast({
                              title: "Failed to update notice",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        {notice.is_outdated ? "Mark Current" : "Mark Outdated"}
                      </Button>
                    </div>
                  ))}
                  {approvedNotices.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No approved notices to manage yet.
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

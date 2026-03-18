import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Users, 
  FileText, 
  Eye, 
  TrendingUp, 
  Clock,
  LayoutDashboard,
  ShieldAlert,
  Building2,
  CheckCircle
} from 'lucide-react';
import { 
  Bar, 
  BarChart as RechartsBarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAutoArchive } from '@/hooks/useAutoArchive';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoticePerformanceReport } from '@/components/admin/NoticePerformanceReport';

interface DepartmentEngagement {
  department_name: string;
  total_views: number;
}

interface RecentActivity {
  action: string;
  target_type: string;
  admin_name: string;
  created_at: string;
}

interface AnalyticsSummary {
  total_notices: number;
  pending_notices: number;
  total_views: number;
  total_users: number;
  department_engagement: DepartmentEngagement[];
  recent_activity: RecentActivity[];
}

export default function AdminDashboard() {
  useAutoArchive();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics-summary'],
    queryFn: async () => {
      // @ts-expect-error Types for this RPC might not be generated yet
      const { data, error } = await supabase.rpc('get_admin_analytics_summary');
      if (error) throw error;
      return data as unknown as AnalyticsSummary;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive system analytics and management overview</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_notices ?? 0}</div>
              <p className="text-xs text-muted-foreground">Published and drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <ShieldAlert className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.pending_notices ?? 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_views ?? 0}</div>
              <p className="text-xs text-muted-foreground">Total notice views</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_users ?? 0}</div>
              <p className="text-xs text-muted-foreground">Students and Staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                Smart Engagement Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.department_engagement?.[0] && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Top Performing Department</p>
                      <p className="text-xs text-muted-foreground">
                        {analytics?.department_engagement?.[0]?.department_name} has the highest engagement with {analytics?.department_engagement?.[0]?.total_views} views. 
                        Consider sharing their posting patterns with other departments.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-success/20 rounded-full">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Approval Efficiency</p>
                    <p className="text-xs text-muted-foreground">
                      {(analytics?.pending_notices ?? 0) > 5 
                        ? 'Pending queue is growing. Aim to review notices within 24 hours to maintain engagement.'
                        : 'Approval queue is well-managed. Good job maintainining system throughput!'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-info/5 border-info/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-info">
                <ShieldAlert className="h-5 w-5" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-info/20 rounded-full">
                    <Clock className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Auto-Archive Status</p>
                    <p className="text-xs text-muted-foreground">
                      System auto-archiver is active. {(analytics?.total_notices ?? 0) > 0 ? 'Cleanup is running periodically to keep the feed fresh.' : 'Monitoring for expired content.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Department Engagement Chart */}
          <Card className="col-span-4 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Department Engagement
              </CardTitle>
              <CardDescription>Notice views across university departments</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={analytics?.department_engagement ?? []}>
                  <XAxis 
                    dataKey="department_name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="total_views" 
                    fill="currentColor" 
                    radius={[4, 4, 0, 0]} 
                    className="fill-primary"
                  >
                    {analytics?.department_engagement?.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-3 hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Administration Activity
              </CardTitle>
              <CardDescription>Latest actions taken by system administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics?.recent_activity?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        <span className="capitalize">{activity.action.toLowerCase().replace('_', ' ')}</span> on {activity.target_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.admin_name} • {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {(!analytics?.recent_activity || analytics.recent_activity.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No recent activity logged</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <NoticePerformanceReport />
      </TabsContent>
    </Tabs>
  </div>
</DashboardLayout>
  );
}

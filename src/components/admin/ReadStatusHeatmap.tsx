import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDepartments } from '@/hooks/useDepartments';
import { useNotices } from '@/hooks/useNotices';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReadStatusHeatmap() {
  const { data: departments = [] } = useDepartments();
  const { notices: approvedNotices } = useNotices('approved');

  const { data: readData = [] } = useQuery({
    queryKey: ['read-status-heatmap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notice_reads')
        .select('notice_id, department_id');
      if (error) throw error;
      return data;
    },
  });

  // Build heatmap: notice x department
  const recentNotices = approvedNotices.slice(0, 10);

  const getReadCount = (noticeId: string, deptId: string) => {
    return readData.filter((r: any) => r.notice_id === noticeId && r.department_id === deptId).length;
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count < 3) return 'bg-warning/30';
    if (count < 10) return 'bg-warning/60';
    return 'bg-success/60';
  };

  if (recentNotices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Read Status Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No notices to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Read Status Heatmap</CardTitle>
        <CardDescription>Color-coded view of which notices have been seen by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium text-muted-foreground">Notice</th>
                {departments.map((d) => (
                  <th key={d.id} className="p-2 font-medium text-muted-foreground text-center whitespace-nowrap">
                    {d.name.slice(0, 12)}
                  </th>
                ))}
                <th className="p-2 font-medium text-muted-foreground text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentNotices.map((notice) => {
                const totalReads = readData.filter((r: any) => r.notice_id === notice.id).length;
                return (
                  <tr key={notice.id} className="border-t">
                    <td className="p-2 max-w-[200px] truncate font-medium">{notice.title}</td>
                    {departments.map((d) => {
                      const count = getReadCount(notice.id, d.id);
                      return (
                        <td key={d.id} className="p-1 text-center">
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={cn('w-8 h-8 rounded mx-auto flex items-center justify-center text-[10px] font-medium', getColor(count))}>
                                {count || '—'}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{count} reads from {d.name}</TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" /> {totalReads}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>Legend:</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-muted" /> 0</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-warning/30" /> 1-2</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-warning/60" /> 3-9</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-success/60" /> 10+</span>
        </div>
      </CardContent>
    </Card>
  );
}

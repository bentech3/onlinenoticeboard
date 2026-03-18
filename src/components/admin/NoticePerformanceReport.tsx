import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NoticePerformanceReport as ReportType } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

export function NoticePerformanceReport() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['notice-performance-report'],
    queryFn: async () => {
      // @ts-expect-error RPC types might not be updated yet
      const { data, error } = await supabase.rpc('get_notice_performance_report');
      if (error) throw error;
      return data as unknown as ReportType[];
    },
  });

  const filteredReports = reports?.filter((report) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.creator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (!filteredReports) return;

    const headers = [
      'Notice Title',
      'Author',
      'Department',
      'Category',
      'Status',
      'Views',
      'Likes',
      'Helpful Feedback',
      'Comments',
      'Created At'
    ];

    const csvData = filteredReports.map((r) => [
      `"${r.title.replace(/"/g, '""')}"`,
      r.creator_name,
      r.department_name,
      r.category || 'N/A',
      r.status,
      r.view_count,
      r.likes_count,
      r.helpful_count,
      r.comments_count,
      format(new Date(r.created_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `notice_performance_report_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Notice Performance Report
            </CardTitle>
            <CardDescription>
              Detailed engagement metrics for all notices across the university
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2 shrink-0">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or department..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Report Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="min-w-[200px]">Notice Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center"><Eye className="h-4 w-4 mx-auto inline" /></TableHead>
                <TableHead className="text-center"><ThumbsUp className="h-4 w-4 mx-auto inline" /></TableHead>
                <TableHead className="text-center"><MessageSquare className="h-4 w-4 mx-auto inline" /></TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports?.map((report) => (
                <TableRow key={report.notice_id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{report.title}</span>
                      <span className="text-xs text-muted-foreground font-normal">by {report.creator_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{report.department_name}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{report.view_count}</TableCell>
                  <TableCell className="text-center">{report.likes_count}</TableCell>
                  <TableCell className="text-center">{report.comments_count}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(report.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        report.status === 'approved' ? 'default' : 
                        report.status === 'pending' ? 'outline' : 'secondary'
                      }
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredReports || filteredReports.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No matching performance data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import { Notice } from '@/lib/types';
import { NoticeCard } from './NoticeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface NoticeListProps {
  notices: Notice[];
  isLoading?: boolean;
  showStatus?: boolean;
  emptyMessage?: string;
  compact?: boolean;
}

export function NoticeList({
  notices,
  isLoading = false,
  showStatus = false,
  emptyMessage = 'No notices found',
  compact = false,
}: NoticeListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-lg mb-1">No Notices</h3>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          showStatus={showStatus}
          compact={compact}
        />
      ))}
    </div>
  );
}

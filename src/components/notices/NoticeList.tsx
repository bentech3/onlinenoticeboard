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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 py-16 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <FileText className="h-10 w-10 text-primary opacity-60" />
        </div>
        <h3 className="font-semibold text-xl mb-2">No Notices Found</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">{emptyMessage}</p>
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

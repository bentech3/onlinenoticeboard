import { Heart, Bookmark, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNoticeLikes } from '@/hooks/useNoticeLikes';
import { useNoticeBookmarks } from '@/hooks/useNoticeBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NoticeActionsProps {
  noticeId: string;
  viewCount?: number;
  compact?: boolean;
}

export function NoticeActions({ noticeId, viewCount, compact = false }: NoticeActionsProps) {
  const { user } = useAuth();
  const { likesCount, isLiked, toggleLike } = useNoticeLikes(noticeId);
  const { isBookmarked, toggleBookmark } = useNoticeBookmarks(noticeId);

  return (
    <div className="flex items-center gap-1">
      {/* Like */}
      <Button
        variant="ghost"
        size="sm"
        className={cn('gap-1.5 h-8 px-2', isLiked && 'text-destructive')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (user) toggleLike.mutate();
        }}
        disabled={!user || toggleLike.isPending}
      >
        <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
        {likesCount > 0 && <span className="text-xs">{likesCount}</span>}
      </Button>

      {/* Bookmark */}
      <Button
        variant="ghost"
        size="sm"
        className={cn('gap-1.5 h-8 px-2', isBookmarked && 'text-secondary')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (user) toggleBookmark.mutate();
        }}
        disabled={!user || toggleBookmark.isPending}
      >
        <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
      </Button>

      {/* View count */}
      {viewCount !== undefined && viewCount > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
          <Eye className="h-3.5 w-3.5" />
          {viewCount}
        </span>
      )}
    </div>
  );
}

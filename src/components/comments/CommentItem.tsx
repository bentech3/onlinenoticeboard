import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Reply, Trash2, MoreVertical, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Comment } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  noticeId: string;
  isReply?: boolean;
}

export function CommentItem({ comment, noticeId, isReply = false }: CommentItemProps) {
  const { user, isSuperAdmin } = useAuth();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isOwner = user?.id === comment.user_id;
  const canDelete = isOwner || isSuperAdmin;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    await createComment.mutateAsync({
      noticeId,
      content: replyContent.trim(),
      parentId: comment.id,
    });
    setReplyContent('');
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment.mutateAsync({ commentId: comment.id, noticeId });
    }
  };

  return (
    <div className={cn('space-y-3', isReply && 'ml-8 pl-4 border-l-2 border-muted')}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {comment.author ? getInitials(comment.author.full_name) : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.author?.full_name || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div className="flex items-center gap-2 mt-2">
            {!isReply && user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>
            )}
          </div>
        </div>

        {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleReply} className="ml-11 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
          />
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!replyContent.trim() || createComment.isPending}
            >
              {createComment.isPending ? 'Posting...' : 'Reply'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              noticeId={noticeId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
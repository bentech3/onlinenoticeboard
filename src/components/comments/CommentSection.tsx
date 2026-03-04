import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentSectionProps {
  noticeId: string;
}

export function CommentSection({ noticeId }: CommentSectionProps) {
  const { comments, isLoading } = useComments(noticeId);
  const createComment = useCreateComment();
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment.mutateAsync({
      noticeId,
      content: newComment.trim(),
    });
    setNewComment('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New comment form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || createComment.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {createComment.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please sign in to leave a comment.</p>
          </div>
        )}

        {comments.length > 0 && <Separator />}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} noticeId={noticeId} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
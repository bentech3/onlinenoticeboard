import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, User, Paperclip, Clock, CheckCircle, XCircle, AlertTriangle, Edit, Trash2, Eye, Archive } from 'lucide-react';
import { CommentSection } from '@/components/comments/CommentSection';
import { NoticeActions } from '@/components/notices/NoticeActions';
import { NoticeQRCode } from '@/components/notices/NoticeQRCode';
import { NoticeCalendarExport } from '@/components/notices/NoticeCalendarExport';
import { NoticeFeedback } from '@/components/notices/NoticeFeedback';
import { NoticeTagging } from '@/components/notices/NoticeTagging';
import { NoticeReminder } from '@/components/notices/NoticeReminder';
import { ReputationBadge } from '@/components/notices/ReputationBadge';
import { useNoticeReputation } from '@/hooks/useReputationScore';
import { formatDistanceToNow, format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNotice, useDeleteNotice, useApproveNotice, useRejectNotice, useUpdateNotice } from '@/hooks/useNotices';
import { useAuth } from '@/hooks/useAuth';
import { useViewCount } from '@/hooks/useViewCount';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isApprover, isSuperAdmin } = useAuth();
  const { data: notice, isLoading, error } = useNotice(id || '');
  const deleteNotice = useDeleteNotice();
  const approveNotice = useApproveNotice();
  const rejectNotice = useRejectNotice();
  const updateNotice = useUpdateNotice();
  useViewCount(id);
  const reputation = useNoticeReputation(notice?.view_count || 0, notice?.id || '');

  if (!id) {
    navigate('/dashboard');
    return null;
  }

  const isOwner = notice?.created_by === profile?.id;
  const canEdit = isOwner && notice?.status === 'draft';
  const canDelete = (isOwner && notice?.status === 'draft') || isSuperAdmin;
  const canApprove = (isApprover || isSuperAdmin) && notice?.status === 'pending';

  const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
    draft: { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock },
    pending: { bg: 'bg-warning/15', text: 'text-warning', icon: Clock },
    approved: { bg: 'bg-success/15', text: 'text-success', icon: CheckCircle },
    rejected: { bg: 'bg-destructive/15', text: 'text-destructive', icon: XCircle },
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this notice?')) {
      await deleteNotice.mutateAsync(notice!.id);
      navigate('/dashboard');
    }
  };

  const handleApprove = async () => {
    await approveNotice.mutateAsync(notice!.id);
  };

  const handleReject = async () => {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason) {
      await rejectNotice.mutateAsync({ id: notice!.id, reason });
    }
  };

  const handleArchive = async () => {
    if (!notice) return;
    await updateNotice.mutateAsync({ id: notice.id, is_archived: !notice.is_archived });
    toast({
      title: notice.is_archived ? 'Notice unarchived' : 'Notice archived',
      description: notice.is_archived ? 'Notice is now visible again' : 'Notice has been archived',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !notice) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Notice Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The notice you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusStyles[notice.status].icon;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notice Details</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {notice?.status === 'approved' && (
              <>
                <NoticeActions noticeId={notice.id} viewCount={notice.view_count} />
                <NoticeQRCode noticeId={notice.id} noticeTitle={notice.title} />
                <NoticeCalendarExport notice={notice} />
                <NoticeReminder notice={notice} />
              </>
            )}
            {isSuperAdmin && notice && (
              <Button variant="outline" size="sm" onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {notice.is_archived ? 'Unarchive' : 'Archive'}
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/notices/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="pb-4">
            {/* Status and badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={cn('gap-1 capitalize', statusStyles[notice.status].bg, statusStyles[notice.status].text)}>
                <StatusIcon className="h-3 w-3" />
                {notice.status}
              </Badge>
              {notice.is_urgent && (
                <Badge className="bg-destructive text-destructive-foreground gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
              {notice.priority !== 'normal' && (
                <Badge variant="outline" className="capitalize">
                  {notice.priority} priority
                </Badge>
              )}
              {notice.category && (
                <Badge variant="secondary">{notice.category}</Badge>
              )}
              {notice.status === 'approved' && (
                <ReputationBadge score={reputation.totalScore} tier={reputation.tier} />
              )}
            </div>

            <CardTitle className="text-2xl md:text-3xl">{notice.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {notice.department && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{notice.department.name}</span>
                </div>
              )}
              {notice.creator && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(notice.creator.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{notice.creator.full_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(notice.created_at), 'PPP')}</span>
              </div>
            </div>

            <Separator />

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {notice.content}
              </p>
            </div>

            {/* Rejection reason */}
            {notice.status === 'rejected' && notice.rejection_reason && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                <h4 className="font-medium text-destructive mb-1">Rejection Reason</h4>
                <p className="text-sm text-muted-foreground">{notice.rejection_reason}</p>
              </div>
            )}

            {/* Approval info */}
            {notice.status === 'approved' && notice.approved_at && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Approved</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Approved {formatDistanceToNow(new Date(notice.approved_at), { addSuffix: true })}
                  {notice.approver && ` by ${notice.approver.full_name}`}
                </p>
              </div>
            )}

            {/* Attachments */}
            {notice.attachments && notice.attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({notice.attachments.length})
                  </h4>
                  <div className="grid gap-2">
                    {notice.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{attachment.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {attachment.file_type} • {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Approval actions */}
            {canApprove && (
              <>
                <Separator />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleApprove} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Notice
                  </Button>
                  <Button variant="outline" onClick={handleReject} className="flex-1 border-destructive text-destructive hover:bg-destructive/10">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Notice
                  </Button>
                </div>
              </>
            )}

            {/* Tags */}
            {notice.status === 'approved' && (
              <>
                <Separator />
                <NoticeTagging noticeId={notice.id} />
              </>
            )}

            {/* Feedback */}
            {notice.status === 'approved' && (
              <>
                <Separator />
                <NoticeFeedback noticeId={notice.id} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Comments Section - only show for approved notices */}
        {notice.status === 'approved' && (
          <CommentSection noticeId={notice.id} />
        )}
      </div>
    </DashboardLayout>
  );
}

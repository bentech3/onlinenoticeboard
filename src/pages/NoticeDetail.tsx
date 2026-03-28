import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Paperclip, Clock, CheckCircle, XCircle, AlertTriangle, Edit, Trash2, Archive, Users } from 'lucide-react';
import { CommentSection } from '@/components/comments/CommentSection';
import { NoticeActions } from '@/components/notices/NoticeActions';
import { NoticeQRCode } from '@/components/notices/NoticeQRCode';
import { NoticeCalendarExport } from '@/components/notices/NoticeCalendarExport';
import { NoticeFeedback } from '@/components/notices/NoticeFeedback';
import { NoticeTagging } from '@/components/notices/NoticeTagging';
import { NoticeReminder } from '@/components/notices/NoticeReminder';
import { ReputationBadge } from '@/components/notices/ReputationBadge';
import { useNoticeReputation } from '@/hooks/useReputationScore';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { format } from 'date-fns/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNotice, useDeleteNotice, useApproveNotice, useRejectNotice, useUpdateNotice } from '@/hooks/useNotices';
import { useAuth } from '@/hooks/useAuth';
import { useViewCount } from '@/hooks/useViewCount';
import { cn, getDepartmentColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useDepartments } from '@/hooks/useDepartments';

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isHOD, isSuperAdmin, isAuthenticated } = useAuth();
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
  const canApprove = (isHOD || isSuperAdmin) && notice?.status === 'pending';

  const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
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

  const handleToggleOutdated = async () => {
    if (!notice) return;
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
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Card>
            <CardHeader className="p-4 md:p-6">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3">
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
        <div className="max-w-4xl mx-auto text-center py-12 px-4">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Notice Not Found</h2>
          <p className="text-muted-foreground text-sm mb-4">
            The notice you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate(-1)} size="sm">Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusStyles[notice.status].icon;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 shrink-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <h1 className="text-base md:text-xl font-semibold">Notice Details</h1>
          </div>

          {/* Actions - scrollable on mobile */}
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap">
            {isAuthenticated ? (
              <>
                {notice?.status === 'approved' && (
                  <>
                    <NoticeActions noticeId={notice.id} viewCount={notice.view_count} />
                    <NoticeQRCode noticeId={notice.id} noticeTitle={notice.title} />
                    <NoticeCalendarExport notice={notice} />
                    <NoticeReminder notice={notice} />
                  </>
                )}
                {(isSuperAdmin || isHOD) && notice && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleToggleOutdated} className={cn("shrink-0 h-8 text-xs", notice.is_outdated && "text-warning border-warning")}>
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      {notice.is_outdated ? 'Remove Outdated Stamp' : 'Mark as Outdated'}
                    </Button>
                    {isSuperAdmin && (
                      <Button variant="outline" size="sm" onClick={handleArchive} className="shrink-0 h-8 text-xs">
                        <Archive className="mr-1.5 h-3.5 w-3.5" />
                        {notice.is_archived ? 'Unarchive' : 'Archive'}
                      </Button>
                    )}
                  </>
                )}
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/notices/${id}/edit`)} className="shrink-0 h-8 text-xs">
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button variant="outline" size="sm" className="text-destructive shrink-0 h-8 text-xs" onClick={handleDelete}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')} className="h-8 text-xs">Login to Interact</Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Card className="relative overflow-hidden">
          {/* Department Accent Strip */}
          <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 md:w-2", getDepartmentColor(notice.department?.name))} />
          <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
            {/* Status and badges */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
              <Badge className={cn('gap-1 capitalize text-[10px] md:text-xs', statusStyles[notice.status].bg, statusStyles[notice.status].text)}>
                <StatusIcon className="h-3 w-3" />
                {notice.status}
              </Badge>
              {notice.is_urgent && (
                <Badge className="bg-destructive text-destructive-foreground gap-1 text-[10px] md:text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
              {notice.priority !== 'normal' && (
                <Badge variant="outline" className="capitalize text-[10px] md:text-xs">
                  {notice.priority} priority
                </Badge>
              )}
              {notice.category && (
                <Badge variant="secondary" className="text-[10px] md:text-xs">{notice.category}</Badge>
              )}
              {notice.status === 'approved' && (
                <ReputationBadge score={reputation.totalScore} tier={reputation.tier} />
              )}
            </div>

            <CardTitle className="text-lg md:text-2xl lg:text-3xl leading-tight">{notice.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-1.5 md:gap-y-2 text-xs md:text-sm text-muted-foreground">
              {notice.department && (
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-white font-bold text-[10px] md:text-xs",
                  getDepartmentColor(notice.department.name)
                )}>
                  <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>{notice.department.name}</span>
                </div>
              )}
              {notice.target_department_id === null ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-300 bg-blue-50 text-blue-600 font-bold text-[10px] md:text-xs">
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>All Departments</span>
                </div>
              ) : notice.target_department && notice.target_department_id !== notice.department_id ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary font-bold text-[10px] md:text-xs">
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Target: {notice.target_department.name}</span>
                </div>
              ) : null}
              {notice.creator && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4 md:h-5 md:w-5">
                    <AvatarFallback className="text-[8px] md:text-[10px] bg-primary/10 text-primary">
                      {getInitials(notice.creator.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{notice.creator.full_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>{format(new Date(notice.created_at), 'PPP')}</span>
              </div>
            </div>

            <Separator />

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed text-sm md:text-base">
                {notice.content}
              </p>
            </div>

            {/* Rejection reason */}
            {notice.status === 'rejected' && notice.rejection_reason && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 md:p-4">
                <h4 className="font-medium text-destructive mb-1 text-sm">Rejection Reason</h4>
                <p className="text-xs md:text-sm text-muted-foreground">{notice.rejection_reason}</p>
              </div>
            )}

            {/* Approval info */}
            {notice.status === 'approved' && notice.approved_at && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-3 md:p-4">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-medium text-sm">Approved</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
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
                  <h4 className="font-medium mb-2 md:mb-3 flex items-center gap-2 text-sm">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({notice.attachments.length})
                  </h4>
                  <div className="grid gap-4">
                    {notice.attachments.map((attachment) => {
                      const isImage = attachment.file_type?.startsWith('image/');
                      return (
                        <div key={attachment.id} className="space-y-2">
                          {isImage ? (
                            <div className="rounded-xl overflow-hidden border bg-muted/30">
                              <img 
                                src={attachment.file_url} 
                                alt={attachment.file_name} 
                                className="w-full h-auto max-h-[500px] object-contain hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                                onClick={() => window.open(attachment.file_url, '_blank')}
                              />
                            </div>
                          ) : (
                            <a
                              href={attachment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors bg-card"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">{attachment.file_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.file_type} • {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                </p>
                              </div>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Approval actions */}
            {canApprove && (
              <>
                <Separator />
                <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                  <Button onClick={handleApprove} className="flex-1" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Notice
                  </Button>
                  <Button variant="outline" onClick={handleReject} className="flex-1 border-destructive text-destructive hover:bg-destructive/10" size="sm">
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

        {/* Comments */}
        {isAuthenticated && notice.status === 'approved' && (
          <CommentSection noticeId={notice.id} />
        )}
      </div>
    </DashboardLayout>
  );
}

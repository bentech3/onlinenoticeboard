import { useState } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useNotices, useApproveNotice, useRejectNotice } from '@/hooks/useNotices';
import { Notice } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useNavigate } from 'react-router-dom';

export default function ApprovalQueue() {
  const navigate = useNavigate();
  const { profile, isHOD, isSuperAdmin } = useAuth();
  
  // HODs only see pending notices for their department (or all if super admin)
  const { notices: pendingNotices, isLoading } = useNotices(
    'pending', 
    !isSuperAdmin ? profile?.department_id : undefined
  );
  const approveNotice = useApproveNotice();
  const rejectNotice = useRejectNotice();
  
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isHOD && !isSuperAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleApprove = async (notice: Notice) => {
    setIsProcessing(true);
    try {
      await approveNotice.mutateAsync(notice.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedNotice || !rejectReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await rejectNotice.mutateAsync({
        id: selectedNotice.id,
        reason: rejectReason.trim(),
      });
      setRejectDialogOpen(false);
      setSelectedNotice(null);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">HOD Approval Queue</h1>
          <p className="text-muted-foreground">
            Review and approve pending notices targeting your department
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <Clock className="h-4 w-4 text-warning" />
            {pendingNotices.length} pending
          </Badge>
        </div>

        {/* Notices List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingNotices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-12 w-12 text-success/50 mx-auto mb-4" />
              <CardTitle className="mb-2">All Caught Up!</CardTitle>
              <CardDescription>
                There are no pending notices to review at this time.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingNotices.map((notice) => (
              <Card key={notice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.is_urgent && (
                          <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>
                        )}
                        {notice.department && (
                          <Badge variant="secondary">{notice.department.name}</Badge>
                        )}
                        {notice.category && (
                          <Badge variant="outline">{notice.category}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{notice.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Submitted by {notice.creator?.full_name || 'Unknown'} •{' '}
                        {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content Preview */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {notice.content.length > 500
                        ? notice.content.slice(0, 500) + '...'
                        : notice.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(notice)}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectClick(notice)}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/notices/${notice.id}`)}
                      className="flex-1 sm:flex-none"
                    >
                      View Full Notice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Notice</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this notice. This will be shared with the creator.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="font-medium text-sm">Notice: {selectedNotice?.title}</p>
              </div>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

import { formatDistanceToNow } from 'date-fns';
import { Calendar, Building2, AlertTriangle, Paperclip, ChevronRight, ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NoticeActions } from '@/components/notices/NoticeActions';
import { Notice } from '@/lib/types';
import { cn, getDepartmentColor } from '@/lib/utils';
import { useDepartments } from '@/hooks/useDepartments';

interface NoticeCardProps {
  notice: Notice;
  showStatus?: boolean;
  compact?: boolean;
}

export function NoticeCard({ notice, showStatus = false, compact = false }: NoticeCardProps) {
  const { data: departments } = useDepartments();
  const statusStyles = {
    draft: 'bg-muted text-muted-foreground',
    pending: 'bg-warning/15 text-warning border-warning/30',
    approved: 'bg-success/15 text-success border-success/30',
    rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  };

  const priorityConfig = {
    low: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: null },
    normal: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: null },
    high: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <AlertTriangle className="h-3 w-3" /> },
    urgent: { color: 'bg-red-50 text-red-600 border-red-200', icon: <ShieldAlert className="h-3 w-3" /> },
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const deptColor = getDepartmentColor(notice.department?.name);

  return (
    <Link to={`/notices/${notice.id}`}>
      <Card
        className={cn(
          'group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] relative overflow-hidden',
          notice.is_urgent && 'ring-2 ring-destructive/50 urgent-pulse'
        )}
      >
        {/* Department Accent Strip */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-1 md:w-1.5', deptColor)} />
        <CardHeader className={cn('pb-2 p-3 md:p-6 md:pb-2', compact && 'p-3')}>
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              {/* Status and priority badges */}
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                {showStatus && (
                  <Badge variant="outline" className={cn('capitalize text-[10px] md:text-xs px-1.5 py-0', statusStyles[notice.status])}>
                    {notice.status}
                  </Badge>
                )}
                {notice.is_urgent && (
                  <Badge className="bg-destructive text-destructive-foreground gap-1 text-[10px] md:text-xs px-1.5 py-0">
                    <AlertTriangle className="h-3 w-3" />
                    Urgent
                  </Badge>
                )}
                {notice.priority !== 'normal' && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'capitalize text-[10px] md:text-xs px-1.5 py-0 gap-1 font-medium', 
                      priorityConfig[notice.priority as keyof typeof priorityConfig]?.color || ''
                    )}
                  >
                    {priorityConfig[notice.priority as keyof typeof priorityConfig]?.icon}
                    {notice.priority}
                  </Badge>
                )}
                {notice.category && (
                  <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0">
                    {notice.category}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-sm md:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {notice.title}
              </h3>
            </div>

            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
          </div>
        </CardHeader>

        <CardContent className={cn('pt-0 p-3 md:p-6 md:pt-0', compact && 'p-3 pt-0')}>
          {/* Content preview */}
          {!compact && (
            <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mb-2 md:mb-4">
              {notice.content.replace(/<[^>]*>/g, '').slice(0, 200)}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 md:gap-y-2 text-xs md:text-sm text-muted-foreground">
            {/* Department */}
            {notice.department && (
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-white font-medium",
                deptColor
              )}>
                <Building2 className="h-3 w-3" />
                <span className="truncate max-w-[120px] md:max-w-none">{notice.department.name}</span>
              </div>
            )}

            {/* Target Audience Badge */}
            {notice.target_department_id && notice.target_department_id !== notice.department_id && (
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 gap-1.5">
                <Users className="h-3 w-3" />
                Target: {departments?.find(d => d.id === notice.target_department_id)?.name || 'Department'}
              </Badge>
            )}

            {/* Creator */}
            {notice.creator && (
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4 md:h-5 md:w-5">
                  <AvatarFallback className="text-[8px] md:text-[10px] bg-primary/10 text-primary">
                    {getInitials(notice.creator.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[80px] md:max-w-none">{notice.creator.full_name}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span>{formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}</span>
            </div>

            {/* Attachments count */}
            {notice.attachments && notice.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
                <span>{notice.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Like / Bookmark / Views */}
          {notice.status === 'approved' && (
            <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t">
              <NoticeActions noticeId={notice.id} viewCount={notice.view_count} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

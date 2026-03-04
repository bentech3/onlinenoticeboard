import { useGlobalAlert } from '@/hooks/useGlobalAlert';
import { useNotice } from '@/hooks/useNotices';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function GlobalAlertBanner() {
  const { alertSettings } = useGlobalAlert();

  if (!alertSettings.enabled) return null;

  return (
    <div className="bg-destructive text-destructive-foreground py-2 px-4 relative overflow-hidden">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold">
        <AlertTriangle className="h-4 w-4 animate-pulse" />
        <span>EMERGENCY ALERT</span>
        <AlertTriangle className="h-4 w-4 animate-pulse" />
      </div>
      {alertSettings.ticker_text && (
        <div className="overflow-hidden mt-1">
          <p className="animate-marquee whitespace-nowrap text-sm">
            {alertSettings.ticker_text} &nbsp;&nbsp;&nbsp; {alertSettings.ticker_text} &nbsp;&nbsp;&nbsp; {alertSettings.ticker_text}
          </p>
        </div>
      )}
      {alertSettings.notice_id && (
        <div className="text-center mt-1">
          <Link to={`/notices/${alertSettings.notice_id}`} className="text-xs underline hover:no-underline">
            View full details →
          </Link>
        </div>
      )}
    </div>
  );
}

import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface NoticeCalendarExportProps {
  notice: Notice;
}

export function NoticeCalendarExport({ notice }: NoticeCalendarExportProps) {
  const targetDate = notice.expires_at || notice.scheduled_at;
  if (!targetDate) return null;

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const start = new Date(targetDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UCU Notice Board//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${notice.title}`,
      `DESCRIPTION:${notice.content.replace(/<[^>]*>/g, '').slice(0, 500).replace(/\n/g, '\\n')}`,
      `URL:${window.location.origin}/notices/${notice.id}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notice-${notice.id.slice(0, 8)}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({ title: 'Calendar event exported', description: 'Open the .ics file to add it to your calendar.' });
  };

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
      <CalendarPlus className="h-4 w-4" />
      Add to Calendar
    </Button>
  );
}

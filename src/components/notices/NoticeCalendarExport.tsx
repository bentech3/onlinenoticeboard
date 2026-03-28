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
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    // Format to iCalendar UTC datetime: YYYYMMDDTHHmmssZ
    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const now = formatDate(new Date());
    const uid = `notice-${notice.id}@bbuc-noticeboard`;

    const cleanDescription = (notice.content || '')
      .replace(/<[^>]*>/g, '')   // strip HTML
      .slice(0, 500)
      .replace(/\n/g, '\\n')     // escape newlines for ICS
      .replace(/,/g, '\\,');     // escape commas for ICS

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BBUC Notice Board//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${notice.title}`,
      `DESCRIPTION:${cleanDescription}`,
      `URL:${window.location.origin}/notices/${notice.id}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notice-${notice.id.slice(0, 8)}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({ title: 'Calendar event exported', description: 'Open the .ics file to add it to your calendar app.' });
  };

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
      <CalendarPlus className="h-4 w-4" />
      Add to Calendar
    </Button>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, BellOff, Clock } from 'lucide-react';
import { Notice } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { format, addDays, addWeeks } from 'date-fns';

interface NoticeReminderProps {
  notice: Notice;
}

export function NoticeReminder({ notice }: NoticeReminderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deadlineDate = notice.expires_at || notice.scheduled_at;
  const deadline = deadlineDate ? new Date(deadlineDate) : null;
  const now = new Date();
  const isExpired = deadline ? deadline <= now : true;

  const { data: reminders = [] } = useQuery({
    queryKey: ['notice-reminders', notice.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notice_reminders')
        .select('*')
        .eq('notice_id', notice.id)
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!notice.id && !isExpired,
  });

  const addReminder = useMutation({
    mutationFn: async (remindAt: Date) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase.from('notice_reminders').insert({
        notice_id: notice.id,
        user_id: user.id,
        remind_at: remindAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-reminders', notice.id] });
      toast({ title: 'Reminder set', description: 'You will be notified before the deadline.' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const removeReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notice_reminders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-reminders', notice.id] });
      toast({ title: 'Reminder removed' });
    },
  });

  if (!deadline || !user || isExpired) return null;

  const reminderOptions = [
    { label: '1 day before', date: addDays(deadline, -1) },
    { label: '3 days before', date: addDays(deadline, -3) },
    { label: '1 week before', date: addWeeks(deadline, -1) },
  ].filter((o) => o.date > now);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {reminders.length > 0 ? (
            <><Bell className="h-4 w-4 text-primary fill-primary/20" /> {reminders.length} Reminder{reminders.length > 1 ? 's' : ''}</>
          ) : (
            <><Bell className="h-4 w-4" /> Remind Me</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-sm font-medium mb-1">Deadline Reminders</p>
        <p className="text-xs text-muted-foreground mb-3">
          Deadline: {format(deadline, 'PPP')}
        </p>
        <div className="space-y-1.5">
          {reminderOptions.map((opt) => {
            const existing = reminders.find((r) =>
              Math.abs(new Date(r.remind_at).getTime() - opt.date.getTime()) < 60000
            );
            return (
              <div key={opt.label} className="flex items-center justify-between">
                <span className="text-sm">{opt.label}</span>
                {existing ? (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={() => removeReminder.mutate(existing.id)}>
                    <BellOff className="h-3 w-3 mr-1" /> Remove
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => addReminder.mutate(opt.date)}>
                    <Clock className="h-3 w-3 mr-1" /> Set
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield } from 'lucide-react';
import { useGlobalAlert } from '@/hooks/useGlobalAlert';
import { useNotices } from '@/hooks/useNotices';
import { toast } from '@/hooks/use-toast';

export function GlobalAlertManager() {
  const { alertSettings, updateAlert } = useGlobalAlert();
  const { notices } = useNotices('approved');
  const [enabled, setEnabled] = useState(false);
  const [noticeId, setNoticeId] = useState<string>('none');
  const [tickerText, setTickerText] = useState('');

  useEffect(() => {
    setEnabled(alertSettings.enabled);
    setNoticeId(alertSettings.notice_id || 'none');
    setTickerText(alertSettings.ticker_text || '');
  }, [alertSettings]);

  const handleSave = () => {
    updateAlert.mutate({
      enabled,
      notice_id: noticeId === 'none' ? null : noticeId,
      ticker_text: tickerText,
    }, {
      onSuccess: () => toast({ title: enabled ? 'Emergency alert activated!' : 'Emergency alert deactivated' }),
    });
  };

  return (
    <Card className={enabled ? 'border-destructive' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Campus Emergency Alert
        </CardTitle>
        <CardDescription>
          Activate to display an emergency banner across all screens and signage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="alert-toggle" className="flex items-center gap-2">
            <AlertTriangle className={enabled ? 'h-4 w-4 text-destructive' : 'h-4 w-4'} />
            Emergency Mode {enabled ? '(ACTIVE)' : '(Off)'}
          </Label>
          <Switch id="alert-toggle" checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-2">
          <Label>Linked Notice (optional)</Label>
          <Select value={noticeId} onValueChange={setNoticeId}>
            <SelectTrigger><SelectValue placeholder="Select a notice..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {notices.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ticker Strip Text</Label>
          <Input
            value={tickerText}
            onChange={(e) => setTickerText(e.target.value)}
            placeholder="e.g. Campus closure due to weather emergency"
          />
        </div>

        <Button onClick={handleSave} className={enabled ? 'bg-destructive hover:bg-destructive/90' : ''} disabled={updateAlert.isPending}>
          {enabled ? 'Activate Emergency Alert' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}

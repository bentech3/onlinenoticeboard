import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
        <BellOff className="h-4 w-4" />
        <span>Notifications blocked. Enable in browser settings.</span>
      </div>
    );
  }

  return (
    <Button
      variant={isSubscribed ? 'outline' : 'default'}
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className="gap-2"
    >
      {isSubscribed ? (
        <>
          <BellRing className="h-4 w-4" />
          Push Notifications On
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Enable Push Notifications
        </>
      )}
    </Button>
  );
}

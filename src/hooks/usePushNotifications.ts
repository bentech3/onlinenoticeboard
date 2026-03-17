import { useState, useEffect, useCallback } from 'react';
import { type Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  }, [user]);

  const getVapidPublicKey = async (): Promise<string | null> => {
    try {
      // Try to get from system_settings first
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'vapid_public_key')
        .single();

      if (data) {
        return (data.value as { value: string }).value;
      }

      // Generate keys via edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/generate-vapid-keys`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const result = await res.json();
      return result.publicKey || null;
    } catch {
      return null;
    }
  };

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return;
    setIsLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Notification permission denied');
        setIsLoading(false);
        return;
      }

      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        toast.error('Could not get push configuration');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Convert base64url to Uint8Array
      const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
      const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = atob(base64);
      const applicationServerKey = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        applicationServerKey[i] = rawData.charCodeAt(i);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const json = subscription.toJSON();

      // Store subscription in database
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
        },
        { onConflict: 'user_id,endpoint' }
      );

      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
    } catch (err) {
      console.error('Push subscription error:', err);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', endpoint);
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      toast.error('Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
}

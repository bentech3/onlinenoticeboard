import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, Share, MoreVertical, ArrowDown } from 'lucide-react';
import ucuLogo from '@/assets/ucu-logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <img src={ucuLogo} alt="UCU Logo" className="h-20 w-auto mx-auto" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Install BBUC Notice Board
          </h1>
          <p className="text-muted-foreground text-sm">
            Get instant access to notices, announcements, and updates right from your home screen.
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <h2 className="text-xl font-bold text-success">Already Installed!</h2>
              <p className="text-sm text-muted-foreground">
                The BBUC Notice Board app is installed on your device. Open it from your home screen.
              </p>
              <Button asChild className="w-full">
                <a href="/dashboard">Open App</a>
              </Button>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <Button onClick={handleInstall} size="lg" className="w-full gap-2 text-base">
                <Download className="h-5 w-5" />
                Install App
              </Button>
              <p className="text-xs text-muted-foreground">
                Works offline • Fast loading • No app store needed
              </p>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h2 className="text-lg font-bold">Install on iPhone / iPad</h2>
              <div className="space-y-4 text-left">
                <Step number={1} icon={<Share className="h-5 w-5" />} text='Tap the Share button in Safari' />
                <Step number={2} icon={<ArrowDown className="h-5 w-5" />} text='Scroll down and tap "Add to Home Screen"' />
                <Step number={3} icon={<CheckCircle className="h-5 w-5" />} text='Tap "Add" to confirm' />
              </div>
              <p className="text-xs text-muted-foreground">
                Must use Safari browser on iOS
              </p>
            </CardContent>
          </Card>
        ) : isAndroid ? (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h1 className="text-2xl font-bold">BBUC-online-notice-board</h1>
              <div className="space-y-4 text-left">
                <Step number={1} icon={<MoreVertical className="h-5 w-5" />} text='Tap the menu button (⋮) in Chrome' />
                <Step number={2} icon={<Download className="h-5 w-5" />} text='Tap "Install app" or "Add to Home screen"' />
                <Step number={3} icon={<CheckCircle className="h-5 w-5" />} text='Tap "Install" to confirm' />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-7 w-7 text-primary" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Monitor className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold">Install on Desktop</h2>
              <p className="text-sm text-muted-foreground">
                Look for the install icon <Download className="h-4 w-4 inline" /> in your browser's address bar, or use the browser menu to install this app.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-3 pt-4">
          <Feature icon="⚡" label="Fast" />
          <Feature icon="📱" label="Offline Ready" />
          <Feature icon="🔔" label="Notifications" />
        </div>

        <Button variant="ghost" asChild className="text-sm">
          <a href="/auth">Continue in browser instead →</a>
        </Button>
      </div>
    </div>
  );
}

function Step({ number, icon, text }: { number: number; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
        {number}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

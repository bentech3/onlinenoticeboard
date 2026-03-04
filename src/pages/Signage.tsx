import { useEffect, useState, useCallback } from 'react';
import ucuLogo from '@/assets/ucu-logo.png';
import { formatDistanceToNow, format } from 'date-fns';
import { Building2, Calendar, AlertTriangle, Play, Pause, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotices } from '@/hooks/useNotices';
import { useGlobalAlert } from '@/hooks/useGlobalAlert';
import { cn } from '@/lib/utils';

export default function Signage() {
  const { notices: approvedNotices, isLoading } = useNotices('approved');
  const { alertSettings } = useGlobalAlert();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [intervalTime] = useState(8000);

  // Sort notices: urgent first, then by date
  const sortedNotices = [...approvedNotices].sort((a, b) => {
    if (a.is_urgent && !b.is_urgent) return -1;
    if (!a.is_urgent && b.is_urgent) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const nextNotice = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (sortedNotices.length || 1));
  }, [sortedNotices.length]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || sortedNotices.length <= 1) return;
    const currentIsUrgent = sortedNotices[currentIndex]?.is_urgent;
    const delay = currentIsUrgent ? intervalTime * 2 : intervalTime;
    const timer = setInterval(nextNotice, delay);
    return () => clearInterval(timer);
  }, [isPlaying, intervalTime, nextNotice, sortedNotices, currentIndex]);

  // Hide controls
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center text-primary-foreground">
          <img src={ucuLogo} alt="UCU Logo" className="h-20 w-auto mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Loading notices...</p>
        </div>
      </div>
    );
  }

  if (sortedNotices.length === 0) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center text-primary-foreground max-w-md">
          <img src={ucuLogo} alt="UCU Logo" className="h-24 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">UCU-BBUC Notice Board</h1>
          <p className="text-xl text-primary-foreground/80">No notices to display at this time.</p>
        </div>
      </div>
    );
  }

  const current = sortedNotices[currentIndex];

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground"
      onMouseMove={() => setShowControls(true)}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Global Emergency Alert */}
      {alertSettings.enabled && (
        <div className="bg-destructive text-destructive-foreground py-3 px-4">
          <div className="flex items-center justify-center gap-2 text-lg font-bold">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            EMERGENCY ALERT
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          {alertSettings.ticker_text && (
            <div className="overflow-hidden mt-1">
              <p className="animate-marquee whitespace-nowrap text-base">
                {alertSettings.ticker_text} &nbsp;&nbsp;&nbsp; {alertSettings.ticker_text} &nbsp;&nbsp;&nbsp; {alertSettings.ticker_text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className={cn("flex items-center justify-between p-4 md:p-6 transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0")}>
        <div className="flex items-center gap-4">
          <img src={ucuLogo} alt="UCU Logo" className="h-14 w-auto" />
          <div>
            <h1 className="text-xl font-bold">UCU-BBUC Notice Board</h1>
            <p className="text-sm text-primary-foreground/70">{format(new Date(), 'EEEE, MMMM d, yyyy • h:mm a')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="text-primary-foreground hover:bg-white/10">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-primary-foreground hover:bg-white/10">
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Notice */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8" onClick={() => setIsPlaying((p) => !p)}>
        <div key={current?.id} className="w-full max-w-5xl animate-fade-in cursor-pointer">
          <div className="rounded-3xl bg-white/10 backdrop-blur-md p-8 md:p-12 shadow-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {current?.is_urgent && (
                <Badge className="bg-destructive text-destructive-foreground gap-1 text-base px-4 py-1.5 urgent-pulse">
                  <AlertTriangle className="h-4 w-4" /> URGENT
                </Badge>
              )}
              {current?.department && (
                <Badge className="bg-secondary text-secondary-foreground gap-1 text-base px-4 py-1.5">
                  <Building2 className="h-4 w-4" /> {current.department.name}
                </Badge>
              )}
              {current?.category && (
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-base px-4 py-1.5">
                  {current.category}
                </Badge>
              )}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight font-display">{current?.title}</h2>
            <div className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed mb-8 max-h-[40vh] overflow-y-auto">
              <p className="whitespace-pre-wrap">{current?.content}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/70 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDistanceToNow(new Date(current?.created_at || new Date()), { addSuffix: true })}</span>
              </div>
              {current?.creator && <span>• Posted by {current.creator.full_name}</span>}
            </div>
          </div>
        </div>
      </main>

      {/* Progress */}
      <footer className={cn("p-4 md:p-6 transition-opacity duration-300", showControls ? "opacity-100" : "opacity-30")}>
        <div className="flex justify-center gap-2">
          {sortedNotices.slice(0, 10).map((notice, index) => (
            <button
              key={notice.id}
              onClick={() => { setCurrentIndex(index); setIsPlaying(false); }}
              className={cn("h-2 rounded-full transition-all duration-300", index === currentIndex ? "w-8 bg-secondary" : "w-2 bg-white/30 hover:bg-white/50")}
            />
          ))}
          {sortedNotices.length > 10 && <span className="text-primary-foreground/50 text-sm ml-2">+{sortedNotices.length - 10} more</span>}
        </div>
        <p className="text-center text-primary-foreground/50 text-sm mt-4">Notice {currentIndex + 1} of {sortedNotices.length}</p>
      </footer>
    </div>
  );
}

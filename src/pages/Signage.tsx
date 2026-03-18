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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          <p className="text-xl font-bold tracking-tight uppercase">Loading notices...</p>
        </div>
      </div>
    );
  }

  if (sortedNotices.length === 0) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center text-primary-foreground max-w-md">
          <img src={ucuLogo} alt="UCU Logo" className="h-24 w-auto mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase tracking-widest">BBUC-online-notice-board</h1>
          <p className="text-xl text-primary-foreground/80 font-medium">No notices to display at this time.</p>
        </div>
      </div>
    );
  }

  const current = sortedNotices[currentIndex];
  // QR Code URL - dynamically generates based on notice ID/Link with tracking param
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + '/notices/' + current.id + '?from=qr')}`;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#0f172a] text-primary-foreground overflow-hidden font-sans"
      onMouseMove={() => setShowControls(true)}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[100px] rounded-full" />
      </div>

      {/* Global Emergency Alert */}
      {alertSettings.enabled && (
        <div className="relative z-20 bg-destructive text-destructive-foreground py-4 px-6 shadow-2xl">
          <div className="flex items-center justify-center gap-4 text-2xl font-black uppercase tracking-widest">
            <AlertTriangle className="h-8 w-8 animate-pulse text-white" />
            <span>Emergency Alert</span>
            <AlertTriangle className="h-8 w-8 animate-pulse text-white" />
          </div>
          {alertSettings.ticker_text && (
            <div className="overflow-hidden mt-2 bg-black/20 rounded py-1 px-4">
              <p className="animate-marquee whitespace-nowrap text-xl font-bold">
                {alertSettings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; {alertSettings.ticker_text} &nbsp;&nbsp;&nbsp;&nbsp; {alertSettings.ticker_text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className={cn("relative z-10 flex items-center justify-between p-6 md:p-8 transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0")}>
        <div className="flex items-center gap-6">
          <img src={ucuLogo} alt="UCU Logo" className="h-[70px] w-auto drop-shadow-lg" />
          <div className="border-l border-white/20 pl-6">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white">BBUC Notice Board</h1>
            <div className="flex items-center gap-3 text-white/70 text-lg font-bold">
              <span className="bg-white/10 px-3 py-1 rounded-md">{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="bg-primary/20 px-3 py-1 rounded-md text-white">{format(currentTime, 'h:mm:ss a')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="h-12 w-12 text-white hover:bg-white/10 rounded-2xl bg-white/5 border border-white/10">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-12 w-12 text-white hover:bg-white/10 rounded-2xl bg-white/5 border border-white/10">
            <Maximize className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Main Notice */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8 md:px-12" onClick={() => setIsPlaying((p) => !p)}>
        <div key={current?.id} className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-500">
          <div className="rounded-[40px] bg-white/5 backdrop-blur-3xl p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              <div className="flex-1 space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                  {current?.is_urgent && (
                    <Badge className="bg-destructive text-destructive-foreground gap-2 text-lg font-black px-6 py-2 rounded-xl urgent-pulse border-b-4 border-destructive-foreground/20 shadow-xl">
                      <AlertTriangle className="h-5 w-5" /> URGENT
                    </Badge>
                  )}
                  {current?.department && (
                    <Badge className="bg-secondary text-secondary-foreground gap-2 text-lg font-bold px-6 py-2 rounded-xl shadow-lg">
                      <Building2 className="h-5 w-5" /> {current.department.name}
                    </Badge>
                  )}
                  {current?.category && (
                    <Badge variant="outline" className="border-white/20 bg-white/5 text-white text-lg font-bold px-6 py-2 rounded-xl shadow-md">
                      {current.category}
                    </Badge>
                  )}
                </div>

                <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] font-display text-white tracking-tight drop-shadow-xl">{current?.title}</h2>

                <div className="text-2xl md:text-3xl text-white/80 leading-relaxed font-medium line-clamp-[8] md:line-clamp-[10]">
                  <p className="whitespace-pre-wrap">{current?.content}</p>
                </div>

                <div className="flex flex-wrap items-center gap-8 text-white/50 text-xl font-bold pt-8 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-secondary" />
                    <span>{formatDistanceToNow(new Date(current?.created_at || new Date()), { addSuffix: true })}</span>
                  </div>
                  {current?.creator && (
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-white/30" />
                      <span>{current.creator.full_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Side Panel */}
              <div className="w-full md:w-[240px] flex flex-col items-center gap-6 p-8 rounded-[32px] bg-black/20 border border-white/5 shrink-0">
                <div className="p-3 bg-white rounded-2xl shadow-2xl">
                  <img src={qrUrl} alt="Notice QR Code" className="w-[160px] h-[160px] md:w-[180px] md:h-[180px]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white/90 text-sm font-black uppercase tracking-widest">Scan to Read</p>
                  <p className="text-white/40 text-[10px] leading-tight font-bold">Open your camera to link this notice to your phone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Progress */}
      <footer className={cn("relative z-10 p-8 md:p-12 transition-opacity duration-300", showControls ? "opacity-100" : "opacity-40")}>
        <div className="flex justify-center flex-col items-center gap-6">
          <div className="flex justify-center gap-3">
            {sortedNotices.slice(0, 15).map((notice, index) => (
              <button
                key={notice.id}
                onClick={() => { setCurrentIndex(index); setIsPlaying(false); }}
                className={cn(
                  "h-3 rounded-full transition-all duration-500",
                  index === currentIndex ? "w-16 bg-secondary shadow-[0_0_20px_rgba(var(--secondary),0.6)]" : "w-3 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
            {sortedNotices.length > 15 && <span className="text-white/30 text-base font-bold ml-2">+{sortedNotices.length - 15} more</span>}
          </div>
          <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl">
            <p className="text-white/60 font-black text-sm uppercase tracking-widest">Notice {currentIndex + 1} <span className="text-white/20 mx-2">/</span> {sortedNotices.length}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

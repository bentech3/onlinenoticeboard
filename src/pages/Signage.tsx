import { useEffect, useState, useCallback, useMemo } from 'react';
import ucuLogo from '@/assets/ucu-logo.png';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { format } from 'date-fns/format';
import { isBefore } from 'date-fns/isBefore';
import { 
  Building2, 
  Calendar, 
  AlertTriangle, 
  Play, 
  Pause, 
  Maximize, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from 'lucide-react';
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
  const [intervalTime] = useState(10000); // 10 seconds per notice
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sort notices: Most recent first
  const sortedNotices = useMemo(() => {
    return [...approvedNotices].sort((a, b) => {
      // First sort by urgency
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      // Then by date (Recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [approvedNotices]);

  const nextNotice = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (sortedNotices.length || 1));
  }, [sortedNotices.length]);

  const prevNotice = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sortedNotices.length) % (sortedNotices.length || 1));
  }, [sortedNotices.length]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || sortedNotices.length <= 1) return;
    const currentIsUrgent = sortedNotices[currentIndex]?.is_urgent;
    const delay = currentIsUrgent ? intervalTime * 1.5 : intervalTime;
    const timer = setInterval(nextNotice, delay);
    return () => clearInterval(timer);
  }, [isPlaying, intervalTime, nextNotice, sortedNotices, currentIndex]);

  // Hide controls after inactivity
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <img src={ucuLogo} alt="UCU Logo" className="h-24 w-auto mx-auto mb-6 animate-bounce" />
          <div className="flex items-center gap-3 justify-center">
            <div className="h-2 w-2 bg-secondary rounded-full animate-ping" />
            <p className="text-2xl font-black text-white tracking-[0.3em] uppercase">Initializing Display</p>
          </div>
        </div>
      </div>
    );
  }

  if (sortedNotices.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10">
        <div className="text-center relative z-10">
          <img src={ucuLogo} alt="UCU Logo" className="h-32 w-auto mx-auto mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">Board Offline</h1>
          <p className="text-xl text-slate-400 font-medium">No active notices are scheduled for broadcast.</p>
        </div>
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full" />
      </div>
    );
  }

  const current = sortedNotices[currentIndex];
  const isExpired = current.is_outdated;
  
  // QR Code URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/notices/' + current.id)}`;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#020617] text-white overflow-hidden font-sans selection:bg-secondary/30"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Emergency Alert Bar */}
      {alertSettings.enabled && (
        <div className="relative z-50 bg-destructive shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/10">
          <div className="flex items-center justify-center py-4 px-8">
            <div className="flex items-center gap-6 text-2xl font-black uppercase tracking-[0.2em]">
              <AlertTriangle className="h-10 w-10 animate-pulse" />
              <span>Campus Emergency Alert</span>
              <AlertTriangle className="h-10 w-10 animate-pulse" />
            </div>
          </div>
          {alertSettings.ticker_text && (
            <div className="bg-black/30 overflow-hidden py-2">
              <p className="animate-marquee whitespace-nowrap text-2xl font-bold uppercase tracking-wide">
                {alertSettings.ticker_text} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {alertSettings.ticker_text} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {alertSettings.ticker_text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modern Header - Responsive */}
      <header className={cn(
        "relative z-40 flex flex-col md:flex-row items-center justify-between px-4 md:px-10 py-4 md:py-8 transition-all duration-700 gap-4",
        showControls ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}>
        <div className="flex items-center gap-3 md:gap-8">
          <div className="relative group shrink-0">
            <div className="absolute -inset-2 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={ucuLogo} alt="UCU Logo" className="h-10 md:h-[90px] w-auto relative drop-shadow-2xl" />
          </div>
          <div className="h-8 md:h-16 w-px bg-white/10 mx-1 md:mx-2" />
          <div className="space-y-0.5 md:space-y-1">
            <h1 className="text-sm md:text-3xl font-black uppercase tracking-[0.1em] md:tracking-[0.15em] text-white leading-none">BBUC Notice Board</h1>
            <div className="flex items-center gap-2 md:gap-4 text-slate-400 text-[10px] md:text-lg font-bold">
              <span className="text-secondary">{format(currentTime, 'EEE, MMM do')}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="text-white tracking-widest">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-xl bg-white/5 border-white/10 hover:bg-white/20 h-12 w-12 md:h-16 md:w-16"
          >
            {isPlaying ? <Pause className="h-5 w-5 md:h-8 md:w-8" /> : <Play className="h-5 w-5 md:h-8 md:w-8" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            className="rounded-xl bg-white/5 border-white/10 hover:bg-white/20 h-12 w-12 md:h-16 md:w-16"
          >
            <Maximize className="h-5 w-5 md:h-8 md:w-8" />
          </Button>
        </div>
      </header>

      {/* Navigation Overlays */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 hidden md:flex items-center px-6 transition-opacity duration-500",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={prevNotice}
          className="h-20 w-20 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 shadow-2xl backdrop-blur-md"
        >
          <ChevronLeft className="h-12 w-12" />
        </Button>
      </div>

      <div className={cn(
        "fixed inset-y-0 right-0 z-30 hidden md:flex items-center px-6 transition-opacity duration-500",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextNotice}
          className="h-20 w-20 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 shadow-2xl backdrop-blur-md"
        >
          <ChevronRight className="h-12 w-12" />
        </Button>
      </div>

      {/* Main Notice Display */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 md:px-12 pb-8 md:pb-12 pt-2 transition-all duration-500">
        <div 
          key={current.id} 
          className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000"
        >
          <div className="relative group">
            {/* Glossy Backdrop */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-white/20 to-transparent rounded-[32px] md:rounded-[60px] blur-xs opacity-50" />
            
            <div className="relative rounded-[32px] md:rounded-[60px] bg-white/[0.03] backdrop-blur-[40px] md:backdrop-blur-[80px] border border-white/10 p-8 md:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
              
              {/* Expired Stamp */}
              {isExpired && (
                <div className="absolute top-[10%] md:top-[20%] right-[10%] z-50 pointer-events-none rotate-[25deg] animate-in zoom-in-50 duration-500">
                  <div className="border-4 md:border-[12px] border-destructive/60 px-4 md:px-12 py-1 md:py-4 rounded-lg md:rounded-3xl text-2xl md:text-7xl font-black text-destructive/60 uppercase tracking-[0.2em] shadow-2xl backdrop-blur-sm">
                    OUTDATED
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                <div className="flex-1 space-y-6 md:space-y-10 w-full">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    {current.is_urgent && (
                      <Badge className="bg-destructive text-white gap-2 md:gap-3 text-xs md:text-xl font-black px-3 md:px-8 py-1.5 md:py-3 rounded-lg md:rounded-2xl animate-pulse shadow-2xl shadow-destructive/20 border-b-2 md:border-b-4 border-black/20">
                        <AlertTriangle className="h-4 w-4 md:h-6 md:w-6" /> URGENT
                      </Badge>
                    )}
                    {current.department && (
                      <Badge className="bg-secondary/20 text-secondary gap-2 md:gap-3 text-xs md:text-xl font-black px-3 md:px-8 py-1.5 md:py-3 rounded-lg md:rounded-2xl border border-secondary/30 backdrop-blur-md">
                        <Building2 className="h-4 w-4 md:h-6 md:w-6" /> {current.department.name}
                      </Badge>
                    )}
                    {current.category && (
                      <Badge variant="outline" className="text-slate-400 border-white/10 text-xs md:text-xl font-bold px-3 md:px-8 py-1.5 md:py-3 rounded-lg md:rounded-2xl bg-white/5">
                        {current.category}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-6xl lg:text-8xl font-black leading-tight md:leading-[0.95] tracking-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] text-white">
                    {current.title}
                  </h2>

                  {/* Content */}
                  <div className="text-sm md:text-3xl lg:text-4xl text-slate-200/90 leading-relaxed font-semibold max-h-[250px] md:max-h-[450px] overflow-y-auto scrollbar-hide relative pr-2">
                    <p className="whitespace-pre-wrap">{current.content}</p>
                    {/* Fade for long content - visible only if content is long */}
                    <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#020617]/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 md:gap-12 pt-6 md:pt-12 border-t border-white/5">
                    <div className="flex items-center gap-2 md:gap-4 text-slate-400 text-xs md:text-2xl font-bold">
                      <Clock className="h-4 w-4 md:h-8 md:w-8 text-secondary" />
                      <span>{formatDistanceToNow(new Date(current.created_at), { addSuffix: true })}</span>
                    </div>
                    {current.creator && (
                      <div className="flex items-center gap-2 md:gap-5 text-slate-300 text-xs md:text-2xl font-bold">
                        <div className="h-6 w-6 md:h-12 md:w-12 rounded-full bg-gradient-to-tr from-secondary to-primary/40 flex items-center justify-center text-white text-[8px] md:text-base">
                          {current.creator.full_name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[100px] md:max-w-none">{current.creator.full_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Attachment Images Preview */}
                  {current.attachments && current.attachments.some(a => a.file_type?.startsWith('image/')) && (
                    <div className="pt-4 md:pt-8 flex flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
                      {current.attachments.filter(a => a.file_type?.startsWith('image/')).slice(0, 2).map((img) => (
                        <div key={img.id} className="relative group/img overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 aspect-video w-full max-w-[280px] md:max-w-[400px]">
                          <img 
                            src={img.file_url} 
                            alt="Attachment" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* QR Panel - Responsive Stack */}
                <div className="w-full lg:w-[280px] flex flex-row lg:flex-col items-center gap-4 md:gap-8 p-4 md:p-10 rounded-2xl md:rounded-[50px] bg-white/[0.02] border border-white/5 shadow-inner shrink-0 justify-center">
                  <div className="p-1 md:p-4 bg-white rounded-xl md:rounded-[40px] shadow-2xl transform hover:scale-105 transition-transform duration-500 shrink-0">
                    <img src={qrUrl} alt="Quick Scan" className="w-[60px] h-[60px] md:w-[200px] md:h-[200px]" />
                  </div>
                  <div className="text-left lg:text-center space-y-1 md:space-y-4">
                    <div className="px-2 md:px-4 py-0.5 md:py-2 bg-secondary/10 rounded-full border border-secondary/20 inline-block">
                      <p className="text-secondary text-[8px] md:text-sm font-black uppercase tracking-[0.2em]">Quick Access</p>
                    </div>
                    <p className="text-slate-400 text-[10px] md:text-sm leading-relaxed font-bold max-w-[100px] md:max-w-none">
                      Scan on mobile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamic Footer / Progress Indicators */}
      <footer className={cn(
        "relative z-40 px-4 md:px-10 pb-6 md:pb-10 transition-all duration-700",
        showControls ? "opacity-100" : "opacity-40"
      )}>
        <div className="flex flex-col items-center gap-6 md:gap-8">
          {/* Pagination Pill */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 bg-white/5 p-2 md:p-3 rounded-[24px] md:rounded-full border border-white/5 backdrop-blur-2xl px-4 md:px-6 max-w-full">
            {sortedNotices.slice(0, 15).map((_, index) => (
              <button
                key={index}
                onClick={() => { setCurrentIndex(index); setIsPlaying(false); }}
                className={cn(
                  "relative h-2 md:h-3 rounded-full transition-all duration-500",
                  index === currentIndex 
                    ? "w-10 md:w-20 bg-secondary shadow-[0_0_20px_rgba(234,179,8,0.5)]" 
                    : "w-2 md:w-3 bg-white/20 hover:bg-white/40"
                )}
              >
                {index === currentIndex && isPlaying && (
                  <div className="absolute inset-0 bg-white/40 rounded-full animate-notice-progress origin-left" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-slate-500 font-black text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] text-center">
            <span>Online</span>
            <span className="h-0.5 w-0.5 bg-slate-800 rounded-full" />
            <span className="text-slate-300">Nº {currentIndex + 1} / {sortedNotices.length}</span>
            <span className="h-0.5 w-0.5 bg-slate-800 rounded-full" />
            <span>UCU-BBUC</span>
          </div>
        </div>
      </footer>

      {/* Custom Styles for Progress Bar Animation */}
      <style>{`
        @keyframes notice-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-notice-progress {
          animation: notice-progress ${intervalTime}ms linear infinite;
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s ease infinite alternate;
        }
        @keyframes subtle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

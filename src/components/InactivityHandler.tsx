import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Configuration
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_DURATION = 60 * 1000; // 1 minute warning before logout

export const InactivityHandler = () => {
  const { signOut, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (!isAuthenticated) return;

    if (showWarning) {
        setShowWarning(false);
    }
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    timerRef.current = setTimeout(() => {
      setShowWarning(true);
      warningTimerRef.current = setTimeout(() => {
        handleLogout();
      }, WARNING_DURATION);
    }, INACTIVITY_TIMEOUT - WARNING_DURATION);
  };

  const handleLogout = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    try {
        await signOut();
        window.location.href = '/auth'; // Force redirect to ensure clean state
    } catch (error) {
        console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        return;
    }

    // Initial setup
    resetTimer();

    // Event listeners for user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [isAuthenticated]); // Re-run when auth state changes

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you still there?</AlertDialogTitle>
          <AlertDialogDescription>
            You have been inactive for a while. You will be logged out in 1 minute to protect your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={resetTimer}>
            I'm still here
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

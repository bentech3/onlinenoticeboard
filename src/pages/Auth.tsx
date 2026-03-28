import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ucuLogo from '@/assets/ucu-logo.png';
import campusBg from '@/assets/campus-bg.jfif';
import { useAuth } from '@/hooks/useAuth';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src={campusBg}
          alt="Bishop Barham University College campus"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-[2px]" />
      </div>

      {/* Auth Card — The "Square Slide" */}
      <div className="relative z-10 w-full max-w-[420px] animate-in fade-in zoom-in duration-500">
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center">
          <div className="p-6 sm:p-8">
            {/* Header Section */}
            <div className="text-center mb-6">
              <img
                src={ucuLogo}
                alt="UCU Logo"
                className="h-12 sm:h-16 w-auto mx-auto mb-4 drop-shadow-2xl"
              />
              <h1 className="text-xl font-bold text-foreground">BBUC-online-notice-board</h1>
              <p className="text-white/70 text-sm sm:text-base">
                {mode === 'signin'
                  ? 'Sign in to access official updates'
                  : mode === 'signup'
                    ? 'Create an account to get started'
                    : 'Reset your account password'}
              </p>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              {mode === 'signin' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <SignInForm />
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <button
                      onClick={() => setMode('forgot')}
                      className="text-sm text-white/60 hover:text-white hover:underline underline-offset-4 transition-colors"
                    >
                      Forgot Password?
                    </button>
                    <div className="w-full flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-white/40 uppercase tracking-widest">or</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <button
                      onClick={() => setMode('signup')}
                      className="w-full py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                      Create New Account
                    </button>
                  </div>
                </div>
              ) : mode === 'forgot' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <ForgotPasswordForm onBack={() => setMode('signin')} />
                  <button
                    onClick={() => setMode('signin')}
                    className="mt-6 w-full text-sm text-white/60 hover:text-white transition-colors py-2"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <SignUpForm />
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="w-full flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-white/40 uppercase tracking-widest">Have an account?</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <button
                      onClick={() => setMode('signin')}
                      className="w-full py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                      Sign In Instead
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Public Access Link */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={() => navigate('/signage')}
                className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary/10 border border-secondary/30 text-sm font-bold text-secondary hover:bg-secondary/20 transition-all active:scale-[0.98]"
              >
                VIEW PUBLIC NOTICE BOARD
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <p className="text-center text-[10px] text-white/40 mt-1 tracking-wide uppercase">
                © {new Date().getFullYear()} UCU — Bishop Barham University College
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

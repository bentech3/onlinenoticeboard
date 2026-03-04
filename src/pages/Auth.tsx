import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ucuLogo from '@/assets/ucu-logo.png';
import campusBg from '@/assets/campus-bg.jfif';
import { useAuth } from '@/hooks/useAuth';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Phone } from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel — Campus Image + Welcome Text */}
      <div className="relative lg:w-1/2 min-h-[320px] lg:min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={campusBg}
          alt="Bishop Barham University College campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(212,55%,12%,0.85)] via-[hsl(212,55%,18%,0.8)] to-[hsl(212,55%,22%,0.75)]" />

        <div className="relative z-10 text-center px-8 py-12 lg:py-0 max-w-lg">
          <img
            src={ucuLogo}
            alt="Uganda Christian University"
            className="h-20 lg:h-28 w-auto mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-display leading-tight">
            Welcome to BBUC<br />Online Notice Board
          </h1>
          <p className="text-white/80 text-base lg:text-lg mb-8 leading-relaxed">
            Access official notices, exams, events and announcements anytime
          </p>

          {mode === 'signup' ? (
            <div className="space-y-3">
              <p className="text-white/70 text-sm">Already have an account?</p>
              <button
                onClick={() => setMode('signin')}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full border-2 border-white/80 text-white font-semibold tracking-wider hover:bg-white/10 transition-colors text-sm"
              >
                SIGN IN
              </button>
            </div>
          ) : mode === 'forgot' ? (
            <div className="space-y-3">
              <p className="text-white/70 text-sm">Remember your password?</p>
              <button
                onClick={() => setMode('signin')}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full border-2 border-white/80 text-white font-semibold tracking-wider hover:bg-white/10 transition-colors text-sm"
              >
                SIGN IN
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-white/70 text-sm">Don't have an account?</p>
              <button
                onClick={() => setMode('signup')}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full border-2 border-white/80 text-white font-semibold tracking-wider hover:bg-white/10 transition-colors text-sm"
              >
                SIGN UP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="lg:w-1/2 flex items-center justify-center bg-card px-6 py-12 lg:py-0">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={ucuLogo} alt="UCU" className="h-14 w-auto" />
          </div>

          {mode === 'signin' ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 font-display">
                Sign In to Your Account
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Enter your credentials to access the notice board
              </p>
              <SignInForm />
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline underline-offset-4"
                >
                  Forgot Password?
                </button>
              </div>
              {/* Mobile toggle */}
              <div className="lg:hidden mt-8 text-center border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
                <button
                  onClick={() => setMode('signup')}
                  className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 font-display">
                Reset Your Password
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Enter your email and we'll send you a reset link
              </p>
              <ForgotPasswordForm onBack={() => setMode('signin')} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 font-display">
                Create Your Account
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Use your email for registration
              </p>
              <SignUpForm />
              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <button
                  onClick={() => setMode('forgot')}
                  className="text-primary hover:underline underline-offset-4"
                >
                  Forgot Password?
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-primary hover:underline underline-offset-4"
                >
                  Reset
                </button>
              </div>
              {/* Mobile toggle */}
              <div className="lg:hidden mt-8 text-center border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
                <button
                  onClick={() => setMode('signin')}
                  className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Contact Admin Message */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <p>
                Issues while trying to access your account? Contact your system administrator{' '}
                <a href="tel:+256761214808" className="font-semibold text-primary hover:underline">
                  +256761214808
                </a>{' '}
                for assistance.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} UCU — Bishop Barham University College. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

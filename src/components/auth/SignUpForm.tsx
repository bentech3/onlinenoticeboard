import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        const message = error.message.includes('already registered')
          ? 'This email is already registered. Please sign in instead.'
          : error.message;
        toast({ title: 'Sign up failed', description: message, variant: 'destructive' });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account before signing in.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="signup-name" className="text-foreground/70 text-xs ml-1">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-name"
            type="text"
            placeholder="Enter your full name"
            className="pl-9 h-9 rounded-lg border-border/60 focus:border-primary text-sm"
            {...form.register('fullName')}
          />
        </div>
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="signup-email" className="text-foreground/70 text-xs ml-1">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="Please enter your email"
            className="pl-9 h-9 rounded-lg border-border/60 focus:border-primary text-sm"
            {...form.register('email')}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="signup-password" className="text-foreground/70 text-xs ml-1">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            className="pl-9 pr-9 h-9 rounded-lg border-border/60 focus:border-primary text-sm"
            placeholder="Create password"
            autoComplete="new-password"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="signup-confirm" className="text-foreground/70 text-xs ml-1">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            className="pl-9 h-9 rounded-lg border-border/60 focus:border-primary text-sm"
            placeholder="Repeat password"
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm font-semibold tracking-wide shadow-gold mt-2"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        SIGN UP
      </Button>
    </form>
  );
}

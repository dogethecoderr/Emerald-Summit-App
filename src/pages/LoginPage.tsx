import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { roleByName } from '../models/roles';
import { signInWithEmail, signInWithGoogle } from '../services/auth';
import GoogleIcon from '../components/GoogleIcon';
import SummitLogo from '../components/SummitLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { role: roleName } = useParams();
  const navigate = useNavigate();
  const role = roleByName(roleName);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!role) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground">Unknown role.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/home')}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  const validateEmail = (): boolean => {
    const value = email.trim();
    if (value.length === 0) {
      setEmailError('Enter your email address');
      return false;
    }
    if (!value.includes('@')) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(role.name);
      navigate('/profile');
    } catch (error) {
      toast.error(`Google sign-in failed: ${error}`);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!validateEmail()) return;
    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), role.name);
      navigate('/profile');
    } catch (error) {
      toast.error(`${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-[-15%] h-[440px] w-[440px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0C7A55 0%, transparent 65%)' }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6">
        <header className="flex items-center justify-between py-5">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-8 w-8">
            <SummitLogo />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center pb-24">
          <div className="glass animate-fade-up mb-8 flex items-center gap-4 rounded-2xl p-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `${role.color}1e`,
                color: role.color,
                boxShadow: `inset 0 0 0 1px ${role.color}44`,
              }}
            >
              <role.icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <div className="font-display text-[15px] font-semibold">
                Sign in as {role.label}
              </div>
              <div className="text-[13px] leading-snug text-muted-foreground">
                {role.description}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border bg-secondary/40 text-[15px] font-semibold hover:bg-accent"
            onClick={handleGoogle}
            disabled={isLoading}
          >
            <GoogleIcon size={20} />
            <span className="ml-2">Continue with Google</span>
          </Button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Label htmlFor="email" className="mb-2 text-[13px]">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEmailSignIn();
              }}
              className="h-12 rounded-xl bg-secondary/40 pl-10 text-[15px]"
            />
          </div>
          {emailError && (
            <p className="mt-2 text-xs font-medium text-red-400">{emailError}</p>
          )}

          <Button
            className="glow-emerald mt-5 h-12 w-full rounded-xl bg-primary text-[15px] font-semibold hover:bg-emerald"
            onClick={handleEmailSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              'Continue'
            )}
          </Button>

          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            Demo mode — sign-in is simulated locally, no password or backend
            needed. Your {role.label.toLowerCase()} role will be saved to your
            profile.
          </p>
        </div>
      </div>
    </div>
  );
}

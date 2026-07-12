import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Megaphone,
  QrCode,
  Route,
  Sparkles,
} from 'lucide-react';
import SummitLogo from '../components/SummitLogo';
import { USER_DISCIPLINES } from '../models/disciplines';
import { Button } from '@/components/ui/button';

const FACTS = [
  { icon: CalendarDays, text: 'March 2027' },
  { icon: Clock3, text: '9:00 AM – 5:45 PM' },
  { icon: MapPin, text: 'Emerald High School, Dublin, CA' },
];

const FEATURES = [
  {
    icon: Route,
    title: 'Build your day, your way',
    body: 'Browse 20+ tracks across six disciplines and assemble a conflict-free schedule with live seat counts and walking times.',
  },
  {
    icon: Megaphone,
    title: 'Never miss a change',
    body: 'Announcements land as push, feed, and email at once — room moves and schedule shifts reach you before you need to ask.',
  },
  {
    icon: QrCode,
    title: 'One-tap check-in',
    body: 'A clean registration table on the day: volunteers confirm you in seconds and your whole day is already on your phone.',
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0C7A55 0%, transparent 65%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] left-[-12%] h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0A5F43 0%, transparent 65%)' }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-6 lg:px-14">
        {/* top bar */}
        <header className="flex items-center justify-between py-6 lg:py-8">
          <div className="flex items-center gap-2.5 lg:gap-3.5">
            <div className="h-9 w-9 lg:h-14 lg:w-14">
              <SummitLogo />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold tracking-tight lg:text-2xl">
                Emerald Summit
              </div>
              <div className="text-[11px] text-muted-foreground lg:text-sm">
                EHS Academic Foundation
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-9 rounded-full border-border/80 bg-secondary/30 px-5 text-sm text-foreground/90 hover:border-emerald-glow/50 hover:bg-accent hover:text-foreground lg:h-12 lg:px-8 lg:text-base"
            onClick={() => navigate('/home')}
          >
            Sign in
          </Button>
        </header>

        {/* hero */}
        <section className="flex flex-1 flex-col items-center justify-center pb-10 pt-14 text-center lg:pt-16">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-glow/30 bg-emerald/10 px-4 py-1.5 text-xs font-semibold text-emerald-mint lg:px-5 lg:py-2 lg:text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Summit ’27 · The Tri-Valley’s largest student-run STEAM summit
          </div>

          <h1
            className="animate-fade-up mt-7 max-w-5xl font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl xl:text-8xl"
            style={{ animationDelay: '80ms' }}
          >
            One summit.
            <br />
            <span className="text-gradient-emerald">Six universes.</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:max-w-2xl lg:text-xl"
            style={{ animationDelay: '160ms' }}
          >
            20+ tracks, 30+ visiting experts, hundreds of builders — all in one day.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-2.5"
            style={{ animationDelay: '240ms' }}
          >
            {FACTS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-emerald-mint lg:px-6 lg:py-2.5 lg:text-[15px]"
              >
                <Icon className="h-3.5 w-3.5 opacity-80 lg:h-4 lg:w-4" />
                {text}
              </span>
            ))}
          </div>

          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '320ms' }}
          >
            <Button
              size="lg"
              className="glow-emerald h-12 rounded-full bg-primary px-8 text-[15px] font-semibold hover:bg-emerald lg:h-14 lg:px-12 lg:text-lg"
              onClick={() => navigate('/home')}
            >
              Get started <ArrowRight className="ml-1.5 h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>

          {/* discipline strip */}
          <div
            className="animate-fade-up mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            style={{ animationDelay: '400ms' }}
          >
            {USER_DISCIPLINES.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground lg:gap-2 lg:text-[15px]"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full lg:h-2 lg:w-2"
                  style={{ background: d.color }}
                  aria-hidden
                />
                {d.label}
              </span>
            ))}
          </div>
        </section>

        {/* feature cards */}
        <section className="grid gap-4 pb-16 md:grid-cols-3 lg:gap-6">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="glass animate-fade-up rounded-2xl p-6 lg:p-8"
              style={{ animationDelay: `${480 + i * 90}ms` }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald-mint ring-1 ring-emerald-glow/25 lg:h-12 lg:w-12">
                <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <h3 className="font-display text-[15px] font-semibold lg:text-lg">
                {title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground lg:text-[15px]">
                {body}
              </p>
            </div>
          ))}
        </section>

        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          EHS Academic Foundation · Emerald Summit ’27 · Dublin, CA
        </footer>
      </div>
    </div>
  );
}

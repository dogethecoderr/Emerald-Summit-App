import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
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
import OrbitalUniverses from '../components/OrbitalUniverses';
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

/** Container that cascades its children in on mount. */
const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

/** Soft rise used for most hero elements. */
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Masked line that slides up from behind its clip. */
const lineReveal: Variants = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-clip">
      {/* ambient glows */}
      <motion.div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0C7A55 0%, transparent 65%)' }}
        animate={reduceMotion ? undefined : { y: [0, 24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-20%] left-[-12%] h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0A5F43 0%, transparent 65%)' }}
        animate={reduceMotion ? undefined : { y: [0, -28, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-6 lg:px-14">
        {/* top bar */}
        <motion.header
          className="flex items-center justify-between py-6 lg:py-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2.5 lg:gap-3.5">
            <motion.div
              className="h-9 w-9 lg:h-14 lg:w-14"
              initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <SummitLogo />
            </motion.div>
            <div className="leading-tight">
              <div className="font-hero text-[15px] font-semibold tracking-tight lg:text-2xl">
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
        </motion.header>

        {/* hero */}
        <motion.section
          className="flex flex-1 flex-col items-center justify-center pb-10 pt-14 text-center lg:pt-16"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={rise}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-glow/30 bg-emerald/10 px-4 py-1.5 text-xs font-semibold text-emerald-mint lg:px-5 lg:py-2 lg:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Summit ’27 · The Tri-Valley’s largest student-run STEAM summit
          </motion.div>

          <h1 className="mt-7 max-w-5xl font-hero text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl xl:text-8xl">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={lineReveal}>
                One summit.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block text-gradient-emerald" variants={lineReveal}>
                Six universes.
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={rise}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:max-w-2xl lg:text-xl"
          >
            20+ tracks, 30+ visiting experts, hundreds of builders — all in one day.
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
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
          </motion.div>

          <motion.div
            variants={rise}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="glow-emerald group h-12 rounded-full bg-primary px-8 text-[15px] font-semibold hover:bg-emerald lg:h-14 lg:px-12 lg:text-lg"
              onClick={() => navigate('/home')}
            >
              Get started
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1 lg:h-5 lg:w-5" />
            </Button>
          </motion.div>

          {/* discipline strip */}
          <motion.div
            variants={rise}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {USER_DISCIPLINES.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium tracking-tight text-muted-foreground lg:gap-2 lg:text-[13px]"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full lg:h-2 lg:w-2"
                  style={{ background: d.color, boxShadow: `0 0 8px -1px ${d.color}` }}
                  aria-hidden
                />
                {d.label}
              </span>
            ))}
          </motion.div>

          {/* scroll cue */}
          {!reduceMotion && (
            <motion.div
              className="mt-12 flex flex-col items-center gap-1 text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
                Scroll
              </span>
              <motion.div
                className="h-8 w-[1.5px] rounded-full bg-gradient-to-b from-emerald-glow/70 to-transparent"
                animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
              />
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* six universes — scroll-driven orbit */}
      <OrbitalUniverses />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-14">
        {/* feature cards */}
        <section className="grid gap-4 pb-16 md:grid-cols-3 lg:gap-6">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="glass rounded-2xl p-6 lg:p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald-mint ring-1 ring-emerald-glow/25 lg:h-12 lg:w-12">
                <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <h3 className="font-hero text-[15px] font-semibold lg:text-lg">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground lg:text-[15px]">
                {body}
              </p>
            </motion.div>
          ))}
        </section>

        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          EHS Academic Foundation · Emerald Summit ’27 · Dublin, CA
        </footer>
      </div>
    </div>
  );
}

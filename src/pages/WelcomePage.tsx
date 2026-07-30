import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
} from 'lucide-react';
import LandingNav from '../components/LandingNav';
import MountainSkyline from '../components/MountainSkyline';
import PhotoMosaic from '../components/PhotoMosaic';
import SummitLogo from '../components/SummitLogo';
import FaqSection from '../components/FaqSection';
import CtaBand from '../components/CtaBand';
import LandingFooter from '../components/LandingFooter';
import OrbitalUniverses from '../components/OrbitalUniverses';
import { USER_DISCIPLINES } from '../models/disciplines';
import { Button } from '@/components/ui/button';

const FACTS = [
  { icon: CalendarDays, text: 'January 2027' },
  { icon: Clock3, text: '9:00 AM – 5:00 PM' },
  { icon: MapPin, text: 'Emerald High School, Dublin, CA' },
];

const ABOUT_STATS = [
  { value: '20+', label: 'Tracks' },
  { value: '30+', label: 'Visiting experts' },
  { value: '6', label: 'Universes' },
  { value: '1', label: 'Day' },
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
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  // Cross-route anchor nav: LandingNav sends { scrollTo: id } when the link
  // is clicked from a different route; finish the scroll once we've landed.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)
      ?.scrollTo;
    if (!scrollTo) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(scrollTo)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.history.replaceState({}, '');
    return () => cancelAnimationFrame(frame);
  }, [location.state]);

  return (
    <div className="relative min-h-screen overflow-clip">
      <LandingNav />

      {/* dark night-sky hero band — fills the full viewport so nothing below peeks in on load */}
      <div className="relative min-h-screen overflow-hidden">
        <MountainSkyline />

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 lg:px-14">
            <motion.section
              className="flex flex-1 flex-col items-center justify-center pb-20 pt-20 text-center lg:pb-28 lg:pt-24"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div
                variants={rise}
                className="h-10 w-10 opacity-95 lg:h-12 lg:w-12"
              >
                <SummitLogo />
              </motion.div>

              <motion.div
                variants={rise}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm lg:px-5 lg:py-2 lg:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Summit ’27 · The Tri-Valley’s largest student-led STEAM conference
              </motion.div>

              <h1 className="mt-7 font-title text-6xl font-normal leading-[0.98] tracking-tight text-white sm:text-7xl md:text-8xl xl:text-9xl">
                <span className="block overflow-hidden pb-[0.06em]">
                  <motion.span className="block" variants={lineReveal}>
                    Emerald
                  </motion.span>
                </span>
                <span className="mt-1 block overflow-hidden pb-[0.06em] sm:mt-2">
                  <motion.span
                    className="block bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(100deg, #d1fae5 5%, #6ee7b7 45%, #22c55e 95%)',
                    }}
                    variants={lineReveal}
                  >
                    Summit
                  </motion.span>
                </span>
              </h1>

              <motion.div
                variants={rise}
                className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
              >
                {FACTS.map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-emerald-100 backdrop-blur-sm lg:px-6 lg:py-2.5 lg:text-[15px]"
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
                  className="group h-12 rounded-full bg-emerald-400 px-8 text-[15px] font-semibold text-emerald-950 shadow-[0_0_40px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:scale-[1.04] hover:bg-emerald-300 hover:shadow-[0_0_56px_-8px_rgba(52,211,153,0.8)] active:scale-[0.98] lg:h-14 lg:px-12 lg:text-lg"
                  onClick={() => navigate('/home')}
                >
                  Get started
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1 lg:h-5 lg:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/25 bg-white/5 px-8 text-[15px] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98] lg:h-14 lg:px-12 lg:text-lg"
                  onClick={() => navigate('/app')}
                >
                  Explore the app
                </Button>
              </motion.div>

              {/* discipline strip */}
              <motion.div variants={rise} className="relative mt-14">
                {/* soft blurred halo lifting the labels off the mountain ridgeline */}
                <div
                  className="absolute inset-[-20px] rounded-full bg-black/25 blur-2xl"
                  aria-hidden
                />
                <div className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {USER_DISCIPLINES.map((d) => (
                    <span
                      key={d.name}
                      className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium tracking-tight text-white/55 lg:gap-2 lg:text-[13px]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full lg:h-2 lg:w-2"
                        style={{ background: d.color, boxShadow: `0 0 8px -1px ${d.color}` }}
                        aria-hidden
                      />
                      {d.label}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* scroll cue */}
              {!reduceMotion && (
                <motion.button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById('about')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="mt-12 flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-emerald-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
                    Scroll
                  </span>
                  <motion.div
                    className="h-8 w-[1.5px] rounded-full bg-gradient-to-b from-emerald-300/70 to-transparent"
                    animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'top' }}
                  />
                </motion.button>
              )}
            </motion.section>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1440px] flex-col px-6 lg:px-14">
        {/* about / event summary */}
        <section
          id="about"
          className="scroll-mt-20 py-20 lg:py-28 lg:scroll-mt-24"
        >
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 xl:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-emerald-mint">
                About the summit
              </p>
              <h2 className="mt-3 font-hero text-3xl font-bold leading-tight tracking-tight text-navy-bright sm:text-4xl lg:text-5xl">
                One summit. <span className="text-gradient-emerald">Six universes.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground lg:text-lg">
                Emerald Summit is the Tri-Valley’s largest student-led STEAM
                conference — a full day where hundreds of builders move between six
                disciplines (universes), pitch to visiting experts, and leave
                with something better than they started with.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="glow-emerald h-12 rounded-full bg-primary px-7 text-[15px] font-semibold hover:bg-emerald"
                  onClick={() => navigate('/home')}
                >
                  Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-border/80 bg-secondary/30 px-7 text-[15px] font-semibold hover:border-emerald-glow/50 hover:bg-accent"
                  onClick={() => navigate('/app')}
                >
                  Explore the app
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {ABOUT_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="glass rounded-2xl p-6 text-center"
                    style={{
                      borderColor: 'rgba(30, 58, 107, 0.65)',
                      borderWidth: '2px',
                    }}
                  >
                    <div className="font-hero text-3xl font-bold text-gradient-emerald lg:text-4xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <PhotoMosaic />
            </motion.div>
          </div>

          {/* when & where */}
          <motion.div
            className="mt-6 glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="font-hero text-lg font-semibold">When &amp; where</h3>
            <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              {FACTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-mint" /> {text}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>
      </div>

      {/* six universes — scroll-driven orbit */}
      <OrbitalUniverses />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-14">
        <FaqSection />
      </div>

      <CtaBand />

      <LandingFooter />
    </div>
  );
}

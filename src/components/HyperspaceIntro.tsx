import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SESSION_KEY = 'emerald-hyperspace-shown';
const DURATION_MS = 3400;
const STAR_COUNT = 820;
const TAU = Math.PI * 2;
/** Point in the run where the sky starts warming from black toward emerald. */
const HUE_START = 0.55;

interface Star {
  /** Fixed angular bucket — keeps the streaks evenly fanned, never clumped. */
  slot: number;
  angle: number;
  dist: number;
  speed: number;
  bright: number;
}

/**
 * Angle for a star's bucket, jittered inside the bucket so the fan reads as
 * natural rather than mechanical while still staying evenly spaced.
 */
function slotAngle(slot: number): number {
  return ((slot + Math.random()) / STAR_COUNT) * TAU;
}

/** Play once per session, and never against the user's motion preference. */
export function shouldPlayIntro(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return !sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

interface HyperspaceIntroProps {
  /** Fired once the jump is over, so the page can stage its reveal. */
  onDone?: () => void;
}

/**
 * One-time, skippable warp-speed jump that covers the landing page on first
 * load, then fades out into the hero underneath. The initial state is
 * resolved during render (not in an effect) so the very first paint is
 * already black — otherwise the nav and hero flash for a frame first.
 */
export default function HyperspaceIntro({ onDone }: HyperspaceIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(shouldPlayIntro);
  // Kept in a ref so the animation effect never re-runs when the parent
  // hands us a fresh closure.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setVisible(false);
    onDoneRef.current?.();
  };

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* storage unavailable — the jump simply replays next load */
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Corner-to-centre radius, so the field runs past the screen edges.
    const radius = () => Math.hypot(window.innerWidth, window.innerHeight) / 2;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
      slot: i,
      angle: slotAngle(i),
      dist: Math.sqrt(Math.random()) * radius(),
      speed: 0.45 + Math.random() * 0.55,
      bright: 0.55 + Math.random() * 0.45,
    }));

    const start = performance.now();
    ctx.lineCap = 'round';
    let raf: number;

    const draw = (now: number) => {
      const p = Math.min((now - start) / DURATION_MS, 1);
      // Near-still drift at first, then a hard cubic ramp into the jump.
      const warp = 0.1 + Math.pow(p, 3) * 78;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const centerX = w / 2;
      const centerY = h / 2;
      const maxDist = radius() + 40;

      // The centre clears out as the jump spools up: at rest the starfield is
      // an even sky, under warp the streaks pull away from a dark middle
      // instead of all converging on one pixel.
      const holeEase = Math.min(p / 0.35, 1);
      const hole = maxDist * 0.13 * holeEase;
      const falloff = maxDist * 0.24;

      // Black to start, warming into emerald as the jump ends so it hands off
      // to the hero's own green sky. Full wipe early (crisp points), lighter
      // later so the streaks smear.
      const hue = Math.max(0, (p - HUE_START) / (1 - HUE_START));
      ctx.fillStyle = `rgba(${Math.round(hue * 7)}, ${Math.round(
        hue * 38,
      )}, ${Math.round(hue * 27)}, ${1 - p * 0.78})`;
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 0.8 + p * 1.9;
      for (const s of stars) {
        const prevDist = s.dist;
        s.dist += s.speed * warp;
        if (s.dist > maxDist) {
          s.angle = slotAngle(s.slot);
          s.dist = hole + Math.random() * (hole * 0.5 + 12);
          continue;
        }

        // Never draw back into the cleared middle.
        const from = Math.max(prevDist, hole);
        if (s.dist <= from) continue;

        // Ease the streaks in as they leave the hole so none of them pop.
        const ramp = Math.min(1, (s.dist - hole) / falloff);
        const fade = 1 - holeEase * (1 - ramp);

        const cos = Math.cos(s.angle);
        const sin = Math.sin(s.angle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.bright * fade})`;
        ctx.beginPath();
        ctx.moveTo(centerX + cos * from, centerY + sin * from);
        ctx.lineTo(centerX + cos * s.dist, centerY + sin * s.dist);
        ctx.stroke();
      }

      if (p < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        finish();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hyperspace"
          className="fixed inset-0 z-[100] cursor-pointer bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          onClick={finish}
          role="presentation"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          {/* Emerald bloom that swells at the end, carrying the black sky into
              the hero's green one. */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(16,185,129,0.17) 0%, rgba(6,95,70,0.08) 48%, transparent 74%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{
              duration: DURATION_MS / 1000,
              times: [0, HUE_START, 1],
              ease: 'easeIn',
            }}
          />

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border border-white/50 bg-white/10 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-lg backdrop-blur-sm transition hover:border-white hover:bg-white/25"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

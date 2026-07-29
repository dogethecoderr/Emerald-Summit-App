import { motion, useReducedMotion } from 'framer-motion';

/** Deterministic small starfield — fixed positions so it doesn't reshuffle on re-render. */
const STARS = [
  { x: 4, y: 12, s: 5.5, d: 0 }, { x: 9, y: 28, s: 4.3, d: 0.6 }, { x: 14, y: 8, s: 4.3, d: 1.4 },
  { x: 18, y: 40, s: 5.5, d: 2.1 }, { x: 22, y: 18, s: 4.3, d: 0.3 }, { x: 27, y: 32, s: 4.3, d: 1.8 },
  { x: 31, y: 6, s: 5.5, d: 1.1 }, { x: 36, y: 22, s: 4.3, d: 2.6 }, { x: 41, y: 14, s: 4.3, d: 0.8 },
  { x: 46, y: 34, s: 5.5, d: 1.6 }, { x: 52, y: 9, s: 4.3, d: 0.2 }, { x: 58, y: 24, s: 4.3, d: 2.3 },
  { x: 63, y: 15, s: 5.5, d: 1.0 }, { x: 67, y: 38, s: 4.3, d: 0.5 }, { x: 71, y: 20, s: 4.3, d: 1.9 },
  { x: 76, y: 7, s: 5.5, d: 2.4 }, { x: 80, y: 30, s: 4.3, d: 0.9 }, { x: 84, y: 16, s: 4.3, d: 1.3 },
  { x: 88, y: 42, s: 5.5, d: 0.4 }, { x: 92, y: 11, s: 4.3, d: 2.0 }, { x: 96, y: 26, s: 4.3, d: 1.5 },
  { x: 12, y: 48, s: 4.3, d: 2.2 }, { x: 25, y: 46, s: 4.3, d: 0.7 }, { x: 39, y: 44, s: 4.3, d: 1.7 },
  { x: 55, y: 45, s: 4.3, d: 0.1 }, { x: 69, y: 47, s: 4.3, d: 2.5 }, { x: 85, y: 44, s: 4.3, d: 1.2 },
];

/**
 * Night-sky mountain silhouette, in the brand's emerald palette instead of a
 * conventional blue — scoped as a hero-only backdrop (fills its relative
 * parent). Layered ridgelines + a soft glow behind the peak + a twinkling
 * starfield. Falls back to a static scene when the viewer prefers reduced
 * motion.
 */
export default function MountainSkyline() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* base night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 15%, #0f3a2a 0%, #0a2a1e 38%, #041712 68%, #020c09 100%)',
        }}
      />

      {/* glow behind the summit */}
      <motion.div
        className="absolute left-1/2 top-[18%] h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, #22C55E44 0%, #0C7A5522 45%, transparent 75%)' }}
        animate={reduceMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* starfield */}
      {STARS.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.s, height: star.s }}
          animate={reduceMotion ? undefined : { opacity: [0.15, 0.9, 0.15] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.d,
          }}
        />
      ))}

      {/* back ridge */}
      <motion.svg
        className="absolute inset-x-0 bottom-0 h-[46%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        animate={reduceMotion ? undefined : { x: [0, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon
          points="0,320 0,190 180,120 340,200 520,90 700,190 860,110 1040,210 1220,130 1440,200 1440,320"
          fill="#0e3527"
          opacity="0.75"
        />
      </motion.svg>

      {/* mid ridge */}
      <motion.svg
        className="absolute inset-x-0 bottom-0 h-[38%] w-full"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        animate={reduceMotion ? undefined : { x: [0, 12, 0] }}
        transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon
          points="0,260 0,160 220,90 400,170 640,60 860,160 1080,80 1280,170 1440,110 1440,260"
          fill="#123c2c"
          opacity="0.9"
        />
      </motion.svg>

      {/* front ridge — closest, brightest rim */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[30%] w-full"
        viewBox="0 0 1440 210"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,210 0,140 260,60 480,150 720,30 960,150 1180,70 1440,140 1440,210"
          fill="#0a2a1f"
        />
        <polyline
          points="0,140 260,60 480,150 720,30 960,150 1180,70 1440,140"
          fill="none"
          stroke="#34D399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>

      {/* soft fade into the light page below */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }}
      />
    </div>
  );
}

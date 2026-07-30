import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
const STAR_COUNT = 900;

/* Timeline, in seconds. Each mark is where that beat *finishes*. */
const T_WARP = 1.8; // hyperspace at full tilt
const T_SETTLE = 2.9; // slowing; stars fall back, sun resolves, ridges rise
const T_PULSE = 4.7; // sun radiates and shrinks, three decaying beats
const T_SET = 5.8; // sun dims and drops behind the range — hero copy starts
const T_END = 6.5; // stars finished flickering back in

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smoothstep — eases both ends, so no beat starts or stops abruptly. */
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Normalised progress through a window of the timeline. */
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** Alpha/width buckets — see the batching note in the draw loop. */
const ALPHA_STEPS = 14;
const WIDTH_STEPS = 4;
const WIDTH_MIN = 0.8;
const WIDTH_MAX = 3.8;

interface Star {
  slot: number;
  angle: number;
  /** Cached direction, refreshed only when the star respawns. */
  cos: number;
  sin: number;
  dist: number;
  speed: number;
  bright: number;
  /** Settled dot size — varied so the finished sky has depth. */
  size: number;
  /** Twinkle phase + rate, and how late this star returns at the end. */
  phase: number;
  rate: number;
  delay: number;
}

function slotAngle(slot: number): number {
  return ((slot + Math.random()) / STAR_COUNT) * TAU;
}

interface MountainSkylineProps {
  /** Play the arrival sequence; otherwise render the settled night sky. */
  playIntro?: boolean;
  /** Flip to true to jump straight to the settled state. */
  skip?: boolean;
  /** Fires when the sun is down and the hero copy should start arriving. */
  onCueContent?: () => void;
}

/**
 * The hero's night sky, and — on a first visit — the arrival sequence that
 * lands on it. Stars, sun and ridges all live in this one layer on a single
 * clock, so the sequence *becomes* the finished sky instead of dissolving
 * into a separate copy of it.
 */
export default function MountainSkyline({
  playIntro = false,
  skip = false,
  onCueContent,
}: MountainSkylineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const backRidgeRef = useRef<SVGSVGElement>(null);
  const midRidgeRef = useRef<SVGSVGElement>(null);
  const frontRidgeRef = useRef<SVGSVGElement>(null);
  const rimRef = useRef<SVGPolylineElement>(null);

  const cuedRef = useRef(false);
  const onCueRef = useRef(onCueContent);
  onCueRef.current = onCueContent;
  const skipRef = useRef(skip);
  skipRef.current = skip;
  const playRef = useRef(playIntro);
  playRef.current = playIntro;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = wrap.offsetWidth;
      h = wrap.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const radius = () => Math.hypot(w, h) / 2;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
      slot: i,
      angle: 0,
      cos: 0,
      sin: 0,
      dist: Math.sqrt(Math.random()) * radius(),
      speed: 0.45 + Math.random() * 0.55,
      // Skewed so the sky is mostly faint with a scattering of bright ones —
      // an even field reads as dust rather than stars.
      bright: 0.18 + Math.pow(Math.random(), 2.2) * 0.82,
      size: 1.3 + Math.pow(Math.random(), 1.8) * 2.4,
      phase: Math.random() * TAU,
      rate: 1.6 + Math.random() * 2.2,
      delay: Math.random(),
    }));
    /** Point a star down a fresh angle, caching its direction. */
    const aim = (s: Star) => {
      s.angle = slotAngle(s.slot);
      s.cos = Math.cos(s.angle);
      s.sin = Math.sin(s.angle);
    };
    stars.forEach(aim);

    // Reused across frames so the batching allocates nothing per frame.
    const paths: (Path2D | null)[] = new Array(ALPHA_STEPS * WIDTH_STEPS).fill(
      null,
    );

    const start = performance.now();
    ctx.lineCap = 'round';
    let raf = 0;
    const ridges = [backRidgeRef, midRidgeRef, frontRidgeRef];

    const draw = (now: number) => {
      // Skipping (or a return visit) parks the clock at the settled end.
      const live = playRef.current && !skipRef.current;
      const elapsed = (now - start) / 1000;
      const t = live ? elapsed : T_END + elapsed;

      if (!cuedRef.current && t >= T_SET) {
        cuedRef.current = true;
        onCueRef.current?.();
      }

      const cx = w / 2;
      const cy = h / 2;
      const maxDist = radius() + 40;

      /* ---- stars -------------------------------------------------- */
      const accel = span(t, 0, T_WARP);
      const decel = smooth(span(t, T_WARP, T_SETTLE));
      // Ramps hard, then eases to a standstill rather than cutting out.
      const warp = (0.1 + Math.pow(accel, 3) * 78) * (1 - easeOut(decel));

      // Under warp the frame is veiled in black rather than cleared, which is
      // what smears the streaks into trails. Once we've stopped we clear
      // instead — an opaque veil would sit on top of the night sky and hide
      // it, leaving the settled hero flat black.
      if (decel < 1) {
        ctx.fillStyle = `rgba(0, 0, 0, ${lerp(1 - accel * 0.78, 1, decel)})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      // Stars fall back behind the sun, then flicker home once it's gone.
      const recede = smooth(span(t, T_WARP * 0.75, T_SETTLE));
      const back = smooth(span(t, T_SET - 0.2, T_END));
      const hole = maxDist * 0.08 * smooth(span(t, 0, T_SETTLE * 0.6));

      // Nine hundred individually-stroked stars means 900 canvas state
      // changes a frame, which will not hold 60fps. Instead every star is
      // binned by rounded alpha and width and the whole bin is stroked as one
      // path — a few dozen draw calls rather than hundreds.
      paths.fill(null);
      const streakW = 0.8 + accel * 1.9;
      const dim = lerp(1, 0.1, recede);

      for (const s of stars) {
        const prev = s.dist;
        s.dist += s.speed * warp;
        if (s.dist > maxDist) {
          aim(s);
          s.dist = hole + Math.random() * (hole * 0.5 + 12);
          continue;
        }
        const from = Math.max(prev, hole);
        if (s.dist < hole) continue;

        // Staggered return so the sky populates rather than switching on.
        const mine = clamp01((back - s.delay * 0.55) / 0.45);
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.rate + s.phase);
        const alpha = s.bright * lerp(dim, twinkle, mine);

        const ai = Math.round(alpha * (ALPHA_STEPS - 1));
        if (ai <= 0) continue;

        // Thin streaks under warp, fattening into real dots once settled.
        const width = lerp(streakW, s.size, decel);
        const wi = Math.max(
          0,
          Math.min(
            WIDTH_STEPS - 1,
            Math.round(
              ((width - WIDTH_MIN) / (WIDTH_MAX - WIDTH_MIN)) *
                (WIDTH_STEPS - 1),
            ),
          ),
        );

        const key = ai * WIDTH_STEPS + wi;
        let path = paths[key];
        if (!path) {
          path = new Path2D();
          paths[key] = path;
        }
        path.moveTo(cx + s.cos * from, cy + s.sin * from);
        path.lineTo(cx + s.cos * s.dist, cy + s.sin * s.dist);
      }

      for (let key = 0; key < paths.length; key++) {
        const path = paths[key];
        if (!path) continue;
        const ai = Math.floor(key / WIDTH_STEPS);
        const wi = key % WIDTH_STEPS;
        ctx.strokeStyle = `rgba(255, 255, 255, ${ai / (ALPHA_STEPS - 1)})`;
        ctx.lineWidth =
          WIDTH_MIN + (wi / (WIDTH_STEPS - 1)) * (WIDTH_MAX - WIDTH_MIN);
        ctx.stroke(path);
      }

      /* ---- sun ---------------------------------------------------- */
      // Diffuse glow we close on, pulling into a defined disc.
      const focus = smooth(span(t, T_WARP * 0.5, T_SETTLE));
      const setting = smooth(span(t, T_PULSE, T_SET));
      let scale = lerp(0.32, 1, easeOut(focus));

      if (t > T_SETTLE) {
        // Three beats, each smaller than the last — a pulse settling.
        const p = span(t, T_SETTLE, T_PULSE);
        scale *= 1 + Math.sin(p * TAU * 3) * 0.17 * (1 - p);
      }

      const sun = sunRef.current;
      if (sun) {
        sun.style.opacity = `${focus * (1 - setting * 0.96)}`;
        sun.style.filter = `blur(${lerp(46, 0, focus)}px)`;
        sun.style.transform = `translate(-50%, -50%) translateY(${
          setting * 46
        }vh) scale(${scale})`;
      }

      const wash = washRef.current;
      if (wash) wash.style.opacity = `${focus * (1 - setting) * 0.85}`;

      const skyIn = smooth(span(t, T_WARP, T_SET));
      const night = nightRef.current;
      if (night) night.style.opacity = `${skyIn}`;
      const fade = fadeRef.current;
      if (fade) fade.style.opacity = `${skyIn}`;

      // The hero's resting glow, brought up only once the sun is gone so the
      // two never fight — then left breathing forever.
      const glow = glowRef.current;
      if (glow) {
        const up = smooth(span(t, T_PULSE, T_END));
        glow.style.opacity = `${up * (0.72 + 0.28 * Math.sin(t * 0.9))}`;
      }

      /* ---- ridges ------------------------------------------------- */
      // Front travels furthest and lands last: parallax depth.
      const rise = span(t, T_WARP * 0.55, T_SETTLE + 0.3);
      const travel = [46, 62, 78];
      const eases = [
        easeOut(clamp01(rise * 1.15)),
        easeOut(clamp01(rise * 1.06)),
        easeOut(rise),
      ];
      const drifts = [Math.sin(t * 0.24) * 10, Math.sin(t * 0.3 + 1.1) * -12, 0];
      for (let i = 0; i < ridges.length; i++) {
        const el = ridges[i].current;
        if (!el) continue;
        el.style.transform = `translate(${drifts[i]}px, ${
          (1 - eases[i]) * travel[i]
        }vh)`;
      }

      // Crest catches the light as the sun grazes it, then goes out.
      const rim = Math.sin(span(t, T_PULSE - 0.35, T_SET + 0.25) * Math.PI);
      const rimEl = rimRef.current;
      if (rimEl) {
        rimEl.style.opacity = `${0.5 + rim * 0.5}`;
        rimEl.style.strokeWidth = `${2 + rim * 2.6}`;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* black void the jump happens in */}
      <div className="absolute inset-0 bg-black" />

      {/* the settled night sky, brought up as the sun goes down */}
      <div
        ref={nightRef}
        className="absolute inset-0"
        style={{
          opacity: 0,
          background:
            'radial-gradient(120% 90% at 50% 15%, #0f3a2a 0%, #0a2a1e 38%, #041712 68%, #020c09 100%)',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* broad emerald wash the sun throws across the sky */}
      <div
        ref={washRef}
        className="absolute inset-0"
        style={{
          opacity: 0,
          background:
            'radial-gradient(70% 55% at 50% 46%, rgba(34,197,94,0.30) 0%, rgba(12,122,85,0.14) 45%, transparent 76%)',
        }}
      />

      {/* resting emerald glow behind the summit, as the hero has always had */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-[18%] h-[420px] w-[620px] max-w-[90vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle, #22C55E44 0%, #0C7A5522 45%, transparent 75%)',
        }}
      />

      {/* the sun — sits under the ridges so it can set behind them.
          Sized off the smaller axis so a narrow window doesn't swallow it. */}
      <div
        ref={sunRef}
        className="absolute left-1/2 top-[46%] h-[min(30vh,42vw)] w-[min(30vh,42vw)] rounded-full"
        style={{
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.32)',
          background:
            'radial-gradient(circle, #f0fff8 0%, #a7f3d0 26%, #34d399 46%, rgba(16,185,129,0.55) 62%, rgba(12,122,85,0.18) 78%, transparent 88%)',
        }}
      />

      <svg
        ref={backRidgeRef}
        className="absolute inset-x-0 bottom-0 h-[46%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,320 0,190 180,120 340,200 520,90 700,190 860,110 1040,210 1220,130 1440,200 1440,320"
          fill="#0e3527"
          opacity="0.75"
        />
      </svg>

      <svg
        ref={midRidgeRef}
        className="absolute inset-x-0 bottom-0 h-[38%] w-full"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,260 0,160 220,90 400,170 640,60 860,160 1080,80 1280,170 1440,110 1440,260"
          fill="#123c2c"
          opacity="0.9"
        />
      </svg>

      <svg
        ref={frontRidgeRef}
        className="absolute inset-x-0 bottom-0 h-[30%] w-full"
        viewBox="0 0 1440 210"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,210 0,140 260,60 480,150 720,30 960,150 1180,70 1440,140 1440,210"
          fill="#0a2a1f"
        />
        <polyline
          ref={rimRef}
          points="0,140 260,60 480,150 720,30 960,150 1180,70 1440,140"
          fill="none"
          stroke="#34D399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>

      {/* soft fade into the light page below — held back during the jump, or
          it reads as a white band across the bottom of the void */}
      <div
        ref={fadeRef}
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          opacity: 0,
          background:
            'linear-gradient(to bottom, transparent, hsl(var(--background)))',
        }}
      />
    </div>
  );
}

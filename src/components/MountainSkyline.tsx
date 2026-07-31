import { useEffect, useRef } from 'react';
import { RIDGES, RIDGE_WIDTH } from './skyGeometry';

const TAU = Math.PI * 2;
const STAR_COUNT = 900;

/* Timeline, in seconds. Each mark is where that beat *finishes*. */
const T_WARP = 3.4; // hyperspace at full tilt
const T_SETTLE = 6.0; // slowing; stars fall back, sun resolves, ridges rise
const T_PULSE = 10.2; // sun radiates and shrinks, three decaying beats
const T_SET = 13.0; // sun dims and drops behind the range — hero copy starts
const T_END = 14.8; // stars finished flickering back in

/** Where in the pulse window each beat crests, and how long its ring lives. */
const BEATS = [0.0833, 0.4167, 0.75];
const RING_LIFE = 2.9;

/**
 * Where each range's snow band sits, as a fraction of its own box. Tuned to
 * each ridge's peak line (far peaks sit lower in their box than near ones).
 */
const SNOW = [
  { start: 0.2, end: 0.36, opacity: 0.3 },
  { start: 0.15, end: 0.32, opacity: 0.34 },
  { start: 0.08, end: 0.26, opacity: 0.4 },
];

/** Alpha/width buckets for the star batching. */
const ALPHA_STEPS = 14;
const WIDTH_STEPS = 4;
const WIDTH_MIN = 0.8;
const WIDTH_MAX = 3.8;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smoothstep — eases both ends, so no beat starts or stops abruptly. */
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Normalised progress through a window of the timeline. */
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

interface Star {
  slot: number;
  angle: number;
  cos: number;
  sin: number;
  dist: number;
  speed: number;
  bright: number;
  size: number;
  phase: number;
  rate: number;
  delay: number;
}

function slotAngle(slot: number): number {
  return ((slot + Math.random()) / STAR_COUNT) * TAU;
}

interface MountainSkylineProps {
  playIntro?: boolean;
  skip?: boolean;
  onCueContent?: () => void;
}

/**
 * The hero's night sky, and — on a first visit — the arrival sequence that
 * lands on it. Stars, sun and ridges share one clock in one layer, so the
 * sequence *becomes* the finished sky rather than dissolving into a copy of
 * it. The sun is drawn on the canvas, which sits under the ridge SVGs, so it
 * genuinely passes behind the range as it sets.
 */
export default function MountainSkyline({
  playIntro = false,
  skip = false,
  onCueContent,
}: MountainSkylineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const ridgeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const crestRefs = useRef<(SVGPathElement | null)[]>([]);

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
      bright: 0.18 + Math.pow(Math.random(), 2.2) * 0.82,
      size: 1.3 + Math.pow(Math.random(), 1.8) * 2.4,
      phase: Math.random() * TAU,
      rate: 1.6 + Math.random() * 2.2,
      delay: Math.random(),
    }));
    const aim = (s: Star) => {
      s.angle = slotAngle(s.slot);
      s.cos = Math.cos(s.angle);
      s.sin = Math.sin(s.angle);
    };
    stars.forEach(aim);

    const paths: (Path2D | null)[] = new Array(ALPHA_STEPS * WIDTH_STEPS).fill(
      null,
    );
    const beatTimes = BEATS.map((b) => T_SETTLE + (T_PULSE - T_SETTLE) * b);

    const start = performance.now();
    ctx.lineCap = 'round';
    let raf = 0;

    /** Disc, corona, rays and the rings each beat throws off. */
    const drawSun = (
      cx: number,
      cy: number,
      r: number,
      alpha: number,
      energy: number,
      t: number,
    ) => {
      if (alpha <= 0.001 || r <= 0) return;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Corona: the wide, soft halo the disc sits inside.
      const corona = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r * 3.4);
      corona.addColorStop(0, `rgba(120, 245, 200, ${0.34 * alpha})`);
      corona.addColorStop(0.32, `rgba(52, 211, 153, ${0.16 * alpha})`);
      corona.addColorStop(0.68, `rgba(16, 150, 105, ${0.05 * alpha})`);
      corona.addColorStop(1, 'rgba(16, 150, 105, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3.4, 0, TAU);
      ctx.fill();

      // Radiation: spokes of light, longer and brighter on each beat.
      const spokes = 72;
      ctx.lineCap = 'butt';
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * TAU + t * 0.06;
        // Two incommensurate waves so no spoke pattern repeats visibly.
        const n =
          0.5 + 0.28 * Math.sin(i * 2.399 + t * 1.1) + 0.22 * Math.sin(i * 1.17 - t * 0.7);
        const inner = r * 1.02;
        const outer = r * (1.12 + (0.5 + 1.15 * energy) * n);
        const fade = (0.06 + 0.44 * energy) * n * alpha;
        if (fade <= 0.004) continue;

        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const grad = ctx.createLinearGradient(
          cx + cos * inner,
          cy + sin * inner,
          cx + cos * outer,
          cy + sin * outer,
        );
        grad.addColorStop(0, `rgba(190, 255, 226, ${fade})`);
        grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = r * (0.035 + 0.05 * n);
        ctx.beginPath();
        ctx.moveTo(cx + cos * inner, cy + sin * inner);
        ctx.lineTo(cx + cos * outer, cy + sin * outer);
        ctx.stroke();
      }
      ctx.lineCap = 'round';

      // Shockwave rings — the radiation mark each beat leaves behind.
      for (const b of beatTimes) {
        const age = t - b;
        if (age < 0 || age > RING_LIFE) continue;
        const k = age / RING_LIFE;
        const ringR = r * (1.0 + easeOut(k) * 2.6);
        const ringA = Math.pow(1 - k, 1.7) * 0.6 * alpha;
        if (ringA <= 0.004) continue;
        ctx.strokeStyle = `rgba(190, 255, 226, ${ringA})`;
        ctx.lineWidth = Math.max(0.8, r * 0.07 * (1 - k));
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, TAU);
        ctx.stroke();
      }

      ctx.restore();

      // The disc. A smooth ramp from centre to edge just reads as a shaded
      // ball, so the core is held flat and blown out to white and the drop to
      // the limb is quick — light too bright to look at, not a sphere.
      const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      disc.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      disc.addColorStop(0.34, `rgba(255, 255, 255, ${alpha})`);
      disc.addColorStop(0.5, `rgba(226, 255, 243, ${alpha})`);
      disc.addColorStop(0.68, `rgba(167, 243, 208, ${alpha})`);
      disc.addColorStop(0.84, `rgba(52, 211, 153, ${alpha})`);
      disc.addColorStop(0.95, `rgba(16, 185, 129, ${alpha})`);
      disc.addColorStop(0.99, `rgba(6, 120, 85, ${0.85 * alpha})`);
      disc.addColorStop(1, 'rgba(6, 120, 85, 0)');
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();
    };

    const draw = (now: number) => {
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
      const warp = (0.1 + Math.pow(accel, 3) * 78) * (1 - easeOut(decel));

      // Under warp the frame is veiled rather than cleared, which is what
      // smears the streaks into trails. Once stopped we clear instead — an
      // opaque veil would sit on top of the night sky and hide it.
      if (decel < 1) {
        ctx.fillStyle = `rgba(0, 0, 0, ${lerp(1 - accel * 0.78, 1, decel)})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      const recede = smooth(span(t, T_WARP * 0.8, T_SETTLE));
      const back = smooth(span(t, T_SET - 0.4, T_END));
      const hole = maxDist * 0.08 * smooth(span(t, 0, T_SETTLE * 0.6));

      // Binned by rounded alpha and width, then stroked a bin at a time —
      // a few dozen draw calls rather than one per star.
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

        const mine = clamp01((back - s.delay * 0.55) / 0.45);
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.rate + s.phase);
        const alpha = s.bright * lerp(dim, twinkle, mine);

        const ai = Math.round(alpha * (ALPHA_STEPS - 1));
        if (ai <= 0) continue;

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
        ctx.strokeStyle = `rgba(255, 255, 255, ${
          Math.floor(key / WIDTH_STEPS) / (ALPHA_STEPS - 1)
        })`;
        ctx.lineWidth =
          WIDTH_MIN + ((key % WIDTH_STEPS) / (WIDTH_STEPS - 1)) * (WIDTH_MAX - WIDTH_MIN);
        ctx.stroke(path);
      }

      /* ---- sun ---------------------------------------------------- */
      const focus = smooth(span(t, T_WARP * 0.72, T_SETTLE));
      const setting = smooth(span(t, T_PULSE, T_SET));

      // Three beats, each smaller than the last — a pulse settling.
      let beat = 0;
      if (t > T_SETTLE) {
        const p = span(t, T_SETTLE, T_PULSE);
        beat = Math.max(0, Math.sin(p * TAU * 3)) * (1 - p);
      }

      const baseR = Math.min(w, h) * 0.15;
      const sunR = baseR * lerp(0.3, 1, easeOut(focus)) * (1 + beat * 0.16);
      const sunY = lerp(h * 0.42, h * 1.1, setting);
      const sunA = focus * (1 - setting * 0.92);
      drawSun(cx, sunY, sunR, sunA, beat, t);

      const wash = washRef.current;
      if (wash) wash.style.opacity = `${focus * (1 - setting) * 0.8}`;

      const skyIn = smooth(span(t, T_WARP, T_SET));
      const night = nightRef.current;
      if (night) night.style.opacity = `${skyIn}`;
      const fade = fadeRef.current;
      if (fade) fade.style.opacity = `${skyIn}`;

      const glow = glowRef.current;
      if (glow) {
        const up = smooth(span(t, T_PULSE, T_END));
        glow.style.opacity = `${up * (0.72 + 0.28 * Math.sin(t * 0.9))}`;
      }

      /* ---- ridges ------------------------------------------------- */
      const rise = span(t, T_WARP * 0.66, T_SETTLE + 0.8);
      const travel = [44, 60, 76];
      const eases = [
        easeOut(clamp01(rise * 1.16)),
        easeOut(clamp01(rise * 1.07)),
        easeOut(rise),
      ];
      const drifts = [Math.sin(t * 0.16) * 9, Math.sin(t * 0.21 + 1.1) * -11, 0];
      for (let i = 0; i < 3; i++) {
        const el = ridgeRefs.current[i];
        if (!el) continue;
        el.style.transform = `translate(${drifts[i]}px, ${
          (1 - eases[i]) * travel[i]
        }vh)`;
      }

      // Crest catches the light as the sun grazes it, then goes out.
      const rim = Math.sin(span(t, T_PULSE - 0.5, T_SET + 0.4) * Math.PI);
      for (let i = 0; i < 3; i++) {
        const el = crestRefs.current[i];
        if (!el) continue;
        const weight = i === 2 ? 1 : 0.45;
        el.style.opacity = `${(0.28 + rim * 0.62) * weight}`;
        el.style.strokeWidth = `${1.4 + rim * 2.4 * weight}`;
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

      {/* stars and sun — under the ridges, so the sun sets behind them */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* broad emerald wash the sun throws across the sky */}
      <div
        ref={washRef}
        className="absolute inset-0"
        style={{
          opacity: 0,
          // Runs all the way out — stopping short leaves a visible ellipse
          // edge against the black.
          background:
            'radial-gradient(115% 85% at 50% 44%, rgba(34,197,94,0.24) 0%, rgba(20,150,105,0.13) 30%, rgba(12,122,85,0.05) 58%, transparent 100%)',
        }}
      />

      {/* resting emerald glow behind the summit */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-[18%] h-[420px] w-[620px] max-w-[90vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle, #22C55E44 0%, #0C7A5522 45%, transparent 75%)',
        }}
      />

      {RIDGES.map((ridge, i) => (
        <svg
          key={i}
          ref={(el) => {
            ridgeRefs.current[i] = el;
          }}
          className={`absolute inset-x-0 bottom-0 w-full ${ridge.heightClass}`}
          viewBox={`0 0 ${RIDGE_WIDTH} ${ridge.height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Rock tone: paler toward the crest where the sky lights it. */}
            <linearGradient id={`rock${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={['#22503e', '#183a2d', '#102a20'][i]} />
              <stop offset="1" stopColor={['#14332772', '#0d241c', '#050f0b'][i]} />
            </linearGradient>
            {/* Snow caps. The band has to die out just below the peak line
                or it blankets the whole range and the near ridges wash pale —
                only the tips should poke into it, saddles stay bare rock. */}
            <linearGradient id={`snow${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset={SNOW[i].start}
                stopColor="#eafff6"
                stopOpacity={SNOW[i].opacity}
              />
              <stop
                offset={(SNOW[i].start + SNOW[i].end) / 2}
                stopColor="#d4f7e6"
                stopOpacity={SNOW[i].opacity * 0.22}
              />
              <stop offset={SNOW[i].end} stopColor="#d4f7e6" stopOpacity="0" />
            </linearGradient>
            {/* Aerial perspective: distance fills with sky-coloured haze. */}
            <linearGradient id={`haze${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0a2a1e" stopOpacity="0" />
              <stop offset="1" stopColor="#0a2a1e" stopOpacity={[0.62, 0.4, 0.2][i]} />
            </linearGradient>
            <clipPath id={`clip${i}`}>
              <path d={ridge.path} />
            </clipPath>
          </defs>

          <path d={ridge.path} fill={`url(#rock${i})`} />
          <g clipPath={`url(#clip${i})`}>
            <rect
              x="0"
              y="0"
              width={RIDGE_WIDTH}
              height={ridge.height}
              fill={`url(#snow${i})`}
            />
            <rect
              x="0"
              y="0"
              width={RIDGE_WIDTH}
              height={ridge.height}
              fill={`url(#haze${i})`}
            />
          </g>
          <path
            ref={(el) => {
              crestRefs.current[i] = el;
            }}
            d={ridge.crest}
            fill="none"
            stroke="#34D399"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}

      {/* soft fade into the light page below */}
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

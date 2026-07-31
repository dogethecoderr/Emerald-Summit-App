/** Small deterministic PRNG, so the range is identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Ridge {
  /** Closed silhouette, for filling. */
  path: string;
  /** Just the skyline, for the lit crest. */
  crest: string;
}

interface RidgeOptions {
  seed: number;
  width: number;
  height: number;
  /** Average height of the skyline within the box. */
  crestY: number;
  /** Spread of the initial peaks. */
  amplitude: number;
  /** Subdivision rounds — each one halves the displacement. */
  depth: number;
}

/**
 * Midpoint-displacement ridgeline. Real mountains are self-similar: big peaks
 * carry smaller peaks carrying smaller ones still. Subdividing with a halving
 * random offset gives that, where a plain triangle reads as a graphic.
 */
export function buildRidge({
  seed,
  width,
  height,
  crestY,
  amplitude,
  depth,
}: RidgeOptions): Ridge {
  const rnd = mulberry32(seed);

  const coarse = 5;
  let pts: [number, number][] = [];
  for (let i = 0; i <= coarse; i++) {
    pts.push([(i / coarse) * width, crestY + (rnd() * 2 - 1) * amplitude]);
  }

  let amp = amplitude * 0.62;
  for (let d = 0; d < depth; d++) {
    const next: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      next.push(pts[i]);
      next.push([(x1 + x2) / 2, (y1 + y2) / 2 + (rnd() * 2 - 1) * amp]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    amp *= 0.54;
  }

  pts = pts.map(([x, y]) => [x, Math.max(3, Math.min(height - 3, y))]);

  const crest =
    'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
  return { path: `${crest} L${width},${height} L0,${height} Z`, crest };
}

export const RIDGE_WIDTH = 1440;

/**
 * Three ranges, far to near. Distance reads through height, jaggedness and
 * (in the component) haze and contrast — aerial perspective.
 */
export const RIDGES = [
  {
    ...buildRidge({
      seed: 20270118,
      width: RIDGE_WIDTH,
      height: 320,
      crestY: 150,
      amplitude: 66,
      depth: 6,
    }),
    height: 320,
    heightClass: 'h-[48%]',
  },
  {
    ...buildRidge({
      seed: 7734911,
      width: RIDGE_WIDTH,
      height: 260,
      crestY: 116,
      amplitude: 62,
      depth: 6,
    }),
    height: 260,
    heightClass: 'h-[39%]',
  },
  {
    ...buildRidge({
      seed: 46112207,
      width: RIDGE_WIDTH,
      height: 210,
      crestY: 84,
      amplitude: 58,
      depth: 7,
    }),
    height: 210,
    heightClass: 'h-[31%]',
  },
];

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

/** One shading bucket: every face at roughly this brightness, as one path. */
export interface Facet {
  /** 0 = turned away from the light, 1 = square into it. */
  shade: number;
  d: string;
}

export interface Ridge {
  /** Closed silhouette, for the base fill. */
  path: string;
  /** Just the skyline, for the lit crest. */
  crest: string;
  /** Slope faces, bucketed by how much light they catch. */
  facets: Facet[];
  height: number;
  heightClass: string;
}

interface RidgeOptions {
  seed: number;
  width: number;
  height: number;
  crestY: number;
  amplitude: number;
  /** Starting peak count, before subdivision. */
  coarse: number;
  depth: number;
  /** How much roughness survives each subdivision. Higher = more jagged. */
  persistence: number;
}

const SHADE_BUCKETS = 8;

/**
 * Midpoint-displacement ridgeline. Real mountains are self-similar — big
 * peaks carry smaller peaks carrying smaller ones still — so subdividing with
 * a decaying random offset gives a believable skyline where a triangle reads
 * as a graphic.
 */
function ridgePoints({
  seed,
  width,
  height,
  crestY,
  amplitude,
  coarse,
  depth,
  persistence,
}: RidgeOptions): [number, number][] {
  const rnd = mulberry32(seed);

  let pts: [number, number][] = [];
  for (let i = 0; i <= coarse; i++) {
    pts.push([(i / coarse) * width, crestY + (rnd() * 2 - 1) * amplitude]);
  }

  let amp = amplitude * 0.8;
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
    amp *= persistence;
  }

  return pts.map(([x, y]) => [x, Math.max(3, Math.min(height - 3, y))]);
}

/**
 * Turn the slopes into shaded faces. Each segment gets a quad dropped to the
 * base, shaded by how squarely its normal faces a light above the centre —
 * which is what gives the range relief instead of a flat cut-out. Faces are
 * merged into one path per brightness bucket to keep the DOM small.
 */
function buildFacets(
  pts: [number, number][],
  width: number,
  height: number,
): Facet[] {
  const lightX = width / 2;
  const lightY = -height * 0.9;
  const buckets: string[][] = Array.from({ length: SHADE_BUCKETS }, () => []);

  // Break the skyline at every summit and saddle. One face per slope between
  // them means each peak reads as two planes meeting at its ridge — a uniform
  // grid of quads instead just stacks up as vertical columns.
  const breaks: number[] = [0];
  for (let i = 1; i < pts.length - 1; i++) {
    const rising = pts[i][1] - pts[i - 1][1];
    const falling = pts[i + 1][1] - pts[i][1];
    if ((rising < 0 && falling > 0) || (rising > 0 && falling < 0)) {
      breaks.push(i);
    }
  }
  breaks.push(pts.length - 1);

  for (let k = 0; k < breaks.length - 1; k++) {
    const a = breaks[k];
    const b = breaks[k + 1];
    if (b <= a) continue;

    // Average normal across the whole slope, so the plane gets one tone.
    let nx = 0;
    let ny = 0;
    for (let i = a; i < b; i++) {
      let dx = pts[i + 1][0] - pts[i][0];
      let dy = pts[i + 1][1] - pts[i][1];
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      nx += dy;
      ny += -dx;
    }
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl;

    const mx = (pts[a][0] + pts[b][0]) / 2;
    const my = (pts[a][1] + pts[b][1]) / 2;
    let lx = lightX - mx;
    let ly = lightY - my;
    const ll = Math.hypot(lx, ly) || 1;
    lx /= ll;
    ly /= ll;

    const shade = Math.max(0, nx * lx + ny * ly);
    const bucket = Math.min(
      SHADE_BUCKETS - 1,
      Math.round(shade * (SHADE_BUCKETS - 1)),
    );

    let d = `M${pts[a][0].toFixed(1)},${pts[a][1].toFixed(1)}`;
    for (let i = a + 1; i <= b; i++) {
      d += `L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
    }
    d += `L${pts[b][0].toFixed(1)},${height}L${pts[a][0].toFixed(1)},${height}Z`;
    buckets[bucket].push(d);
  }

  return buckets
    .map((paths, b) => ({
      shade: b / (SHADE_BUCKETS - 1),
      d: paths.join(''),
    }))
    .filter((f) => f.d.length > 0);
}

export const RIDGE_WIDTH = 1440;

function makeRidge(
  opts: RidgeOptions,
  heightClass: string,
): Ridge {
  const pts = ridgePoints(opts);
  const crest =
    'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L');
  return {
    path: `${crest}L${opts.width},${opts.height}L0,${opts.height}Z`,
    crest,
    facets: buildFacets(pts, opts.width, opts.height),
    height: opts.height,
    heightClass,
  };
}

/**
 * Three ranges, far to near. Distance reads through height, jaggedness, and
 * (in the component) haze and contrast — aerial perspective.
 */
/**
 * Kept deliberately coarse: `coarse × 2^depth` segments, so each slope face is
 * a plane you can actually read as a plane. Subdividing further turns the
 * skyline into high-frequency fuzz and the faces into hairline strips — noise
 * rather than rock.
 */
export const RIDGES: Ridge[] = [
  makeRidge(
    {
      seed: 20270118,
      width: RIDGE_WIDTH,
      height: 320,
      crestY: 168,
      amplitude: 84,
      coarse: 7,
      depth: 3,
      persistence: 0.52,
    },
    'h-[48%]',
  ),
  makeRidge(
    {
      seed: 7734911,
      width: RIDGE_WIDTH,
      height: 260,
      crestY: 132,
      amplitude: 76,
      coarse: 6,
      depth: 3,
      persistence: 0.54,
    },
    'h-[39%]',
  ),
  makeRidge(
    {
      seed: 46112207,
      width: RIDGE_WIDTH,
      height: 210,
      crestY: 100,
      amplitude: 68,
      coarse: 5,
      depth: 3,
      persistence: 0.56,
    },
    'h-[31%]',
  ),
];

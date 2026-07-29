import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/** All 36 downloaded event photos, grouped sequentially into sets of
 * [large tile, top-right tile, bottom-right tile] so the rotation works
 * through the entire gallery rather than a small curated handful. */
const GALLERY_COUNT = 36;
const PHOTO_SETS: [string, string, string][] = Array.from(
  { length: Math.floor(GALLERY_COUNT / 3) },
  (_, i) => {
    const n = (offset: number) =>
      `/gallery/photo-${String(i * 3 + offset).padStart(2, '0')}.jpg`;
    return [n(1), n(2), n(3)];
  },
);

const ROTATE_MS = 4500;

function Tile({ src, className }: { src: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 ${className}`}>
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt="Emerald Summit"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  );
}

/** Compact 1-large + 2-stacked photo mosaic that periodically swaps in a
 * different trio of event photos (crossfade, not a moving/spinning effect). */
export default function PhotoMosaic({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHOTO_SETS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const [large, topRight, bottomRight] = PHOTO_SETS[index];

  return (
    <div className={`relative grid aspect-[5/4] grid-cols-2 gap-3 ${className}`}>
      <Tile src={large} className="row-span-2" />
      <Tile src={topRight} className="" />
      <Tile src={bottomRight} className="" />
    </div>
  );
}

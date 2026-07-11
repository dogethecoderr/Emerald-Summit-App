import { useId } from 'react';

/**
 * Emerald Summit mark — an emerald-cut gemstone rising as a mountain peak.
 * Faceted with three gradient planes + a bright "table" cut across the top,
 * so it reads as both a gem and a summit at any size.
 */
export default function SummitLogo({
  size,
  background = 'none',
  iconColor,
}: {
  /** Fixed pixel size; omit to fill the parent (parent controls sizing via CSS). */
  size?: number;
  /** 'emerald' wraps the glyph in a rounded gradient badge. */
  background?: 'emerald' | 'white' | 'none';
  /** Force a monochrome glyph (e.g. 'white'); omit for the faceted gradient. */
  iconColor?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (name: string) => `es-${name}-${uid}`;

  const mono = iconColor != null;

  return (
    <svg
      width={size ?? '100%'}
      height={size ?? '100%'}
      viewBox="0 0 96 96"
      role="img"
      aria-label="Emerald Summit"
    >
      <defs>
        {/* badge */}
        <linearGradient id={g('badge')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0A5F43" />
        </linearGradient>
        {/* facets */}
        <linearGradient id={g('table')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>
        <linearGradient id={g('left')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#0C7A55" />
        </linearGradient>
        <linearGradient id={g('mid')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id={g('right')} x1="0.6" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0C7A55" />
          <stop offset="100%" stopColor="#064E36" />
        </linearGradient>
      </defs>

      {background !== 'none' && (
        <rect
          x="2"
          y="2"
          width="92"
          height="92"
          rx="24"
          fill={background === 'emerald' ? `url(#${g('badge')})` : '#ffffff'}
        />
      )}

      {mono ? (
        /* Monochrome variant: facet edges as strokes, still clearly the gem-peak */
        <g
          fill="none"
          stroke={iconColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="34,22 62,22 84,74 12,74" />
          <polyline points="30,36 66,36" strokeWidth="4" />
          <polyline points="38,74 30,36" strokeWidth="4" />
          <polyline points="58,74 66,36" strokeWidth="4" />
        </g>
      ) : (
        <g>
          {/* crown / table band */}
          <polygon points="34,22 62,22 66,36 30,36" fill={`url(#${g('table')})`} />
          {/* left pavilion facet */}
          <polygon points="30,36 12,74 38,74" fill={`url(#${g('left')})`} />
          {/* center facet */}
          <polygon points="30,36 66,36 58,74 38,74" fill={`url(#${g('mid')})`} />
          {/* right pavilion facet */}
          <polygon points="66,36 84,74 58,74" fill={`url(#${g('right')})`} />
          {/* apex sparkle */}
          <path
            d="M73 14 l2.6 6.4 L82 23 l-6.4 2.6 L73 32 l-2.6-6.4 L64 23 l6.4-2.6 Z"
            fill="#A7F3D0"
            opacity="0.95"
          />
        </g>
      )}
    </svg>
  );
}

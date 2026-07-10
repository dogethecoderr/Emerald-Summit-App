/**
 * Three interlocking mountain-peak chevrons, echoing a valknut-style mark.
 * Renders as an optional rounded badge (background) with the glyph inside.
 */
export default function SummitLogo({
  size,
  background = 'emerald',
  iconColor,
}: {
  /** Fixed pixel size; omit to fill the parent (parent controls sizing via CSS). */
  size?: number;
  background?: 'emerald' | 'white' | 'none';
  iconColor?: string;
}) {
  const icon =
    iconColor ?? (background === 'emerald' ? 'var(--white)' : 'var(--emerald)');
  const bgFill =
    background === 'emerald'
      ? 'var(--emerald)'
      : background === 'white'
        ? 'var(--white)'
        : 'none';

  return (
    <svg
      width={size ?? '100%'}
      height={size ?? '100%'}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Emerald Summit"
    >
      {background !== 'none' && (
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="22"
          fill={bgFill}
          stroke="rgba(0,0,0,0.08)"
        />
      )}
      <g
        fill="none"
        stroke={icon}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="10,82 28,20 50,82" />
        <polyline points="28,82 50,8 72,82" />
        <polyline points="50,82 72,20 90,82" />
      </g>
    </svg>
  );
}

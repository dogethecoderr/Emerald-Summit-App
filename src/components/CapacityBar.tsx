/** Seat-fill meter with ok / nearly-full / full color states. */
export default function CapacityBar({
  enrolled,
  capacity,
  label,
}: {
  enrolled: number;
  capacity: number;
  label?: string;
}) {
  const pct = Math.round((enrolled / capacity) * 100);
  const full = enrolled >= capacity;
  const near = !full && pct >= 80;
  const fillColor = full
    ? 'bg-red-400'
    : near
      ? 'bg-amber-400'
      : 'bg-emerald-glow';
  const countColor = full
    ? 'text-red-400'
    : near
      ? 'text-amber-400'
      : 'text-muted-foreground';

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        {label && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {label}
          </span>
        )}
        <span className={`text-[11px] font-semibold tabular-nums ${countColor}`}>
          {enrolled}/{capacity}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${fillColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

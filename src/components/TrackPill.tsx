import { disciplineByName } from '../models/disciplines';

/** Colored discipline tag; 'keynote' gets the emerald house style. */
export default function TrackPill({ track }: { track: string }) {
  if (track === 'keynote') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald/25 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-mint ring-1 ring-emerald-glow/40">
        Keynote
      </span>
    );
  }
  const discipline = disciplineByName(track);
  if (!discipline) return null;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
      style={{
        background: `${discipline.color}22`,
        color: discipline.color,
        // ring via boxShadow so the tint matches the discipline color
        boxShadow: `inset 0 0 0 1px ${discipline.color}55`,
      }}
    >
      {discipline.label}
    </span>
  );
}

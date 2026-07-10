import type { DisciplineInfo } from '../models/disciplines';
import './DisciplineCard.css';

export default function DisciplineCard({
  discipline,
  isSelected,
  onClick,
}: {
  discipline: DisciplineInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`discipline-card${isSelected ? ' discipline-card--selected' : ''}`}
      onClick={onClick}
      style={
        isSelected
          ? {
              borderColor: discipline.color,
              background: `${discipline.color}1a`, // ~10% alpha
            }
          : undefined
      }
    >
      <span
        className="discipline-card__dot"
        style={{ background: discipline.color }}
        aria-hidden
      />
      <span className="discipline-card__label">{discipline.label}</span>
      <span className="discipline-card__desc">{discipline.description}</span>
    </button>
  );
}

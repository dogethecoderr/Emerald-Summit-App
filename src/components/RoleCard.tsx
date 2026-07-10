import { ChevronRight } from 'lucide-react';
import type { RoleInfo } from '../models/roles';
import './RoleCard.css';

export default function RoleCard({
  role,
  onClick,
}: {
  role: RoleInfo;
  onClick: () => void;
}) {
  const Icon = role.icon;
  return (
    <button className="role-card" onClick={onClick}>
      <span className="role-card__icon" aria-hidden>
        <Icon color="var(--emerald)" strokeWidth={1.75} />
      </span>
      <span className="role-card__body">
        <span className="role-card__label">{role.label}</span>
        <span className="role-card__desc">{role.description}</span>
      </span>
      <span className="role-card__chevron" aria-hidden>
        <ChevronRight color="var(--ink-muted)" />
      </span>
    </button>
  );
}

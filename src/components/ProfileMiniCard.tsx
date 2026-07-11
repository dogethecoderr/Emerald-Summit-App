import { CheckCircle2, ShieldCheck } from 'lucide-react';
import type { RoleInfo } from '../models/roles';
import type { PersonStatus } from '../models/personStatus';
import { personStatusLabel } from '../models/personStatus';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileMiniCard({
  name,
  subtitle,
  role,
  status,
}: {
  name: string;
  /** Secondary line under the name — discipline label, falling back to email. */
  subtitle: string;
  role: RoleInfo;
  status: PersonStatus;
}) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: role.color }}
          aria-hidden
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold">{name}</span>
            {status !== 'none' && (
              <span className="shrink-0 text-emerald-glow" aria-hidden>
                {status === 'checkedIn' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
          <span
            className="mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: `${role.color}22`, color: role.color }}
          >
            {role.label}
          </span>
        </div>
      </div>
      <div
        className={cn(
          'mt-4 rounded-lg px-3 py-2 text-center text-xs font-semibold',
          status === 'checkedIn' && 'bg-emerald/15 text-emerald-mint',
          status === 'validated' && 'bg-sky-500/10 text-sky-400',
          status === 'none' && 'bg-secondary text-muted-foreground',
        )}
      >
        {personStatusLabel(status)}
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, CheckCircle2, ShieldCheck, UserCheck, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { useRequireRole } from '../hooks/useRequireProfile';
import { USER_ROLES, roleByName } from '../models/roles';
import { MOCK_PEOPLE } from '../models/people';
import type { PersonStatus } from '../models/personStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CheckInPage() {
  const { ready, redirect } = useRequireRole(['admin']);
  const [query, setQuery] = useState('');
  // Local mock of live check-in state, seeded from the directory data.
  const [statuses, setStatuses] = useState<Record<string, PersonStatus>>(() =>
    Object.fromEntries(MOCK_PEOPLE.map((p) => [p.id, p.status])),
  );

  const counts = useMemo(() => {
    const values = Object.values(statuses);
    return {
      checkedIn: values.filter((s) => s === 'checkedIn').length,
      validated: values.filter((s) => s === 'validated').length,
      total: values.length,
    };
  }, [statuses]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const toggleCheckIn = (id: string, name: string) => {
    setStatuses((prev) => {
      const current = prev[id];
      const next: PersonStatus =
        current === 'checkedIn' ? 'validated' : 'checkedIn';
      if (next === 'checkedIn') {
        toast.success(`${name} checked in`, {
          description: new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        });
      } else {
        toast(`${name} check-in undone`);
      }
      return { ...prev, [id]: next };
    });
  };

  const filtered = MOCK_PEOPLE.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      !q || p.name.toLowerCase().includes(q) || p.org.toLowerCase().includes(q)
    );
  });

  const pct = Math.round((counts.checkedIn / counts.total) * 100);

  return (
    <AppShell>
      <PageHeader
        label="Front Desk · Admin"
        title="Check-In"
        sub="Search a name, confirm identity, and mark arrival with one tap. Counts update live."
      />

      {/* live counts */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Checked in
          </div>
          <div className="mt-1 font-display text-2xl font-semibold text-emerald-mint">
            {counts.checkedIn}
            <span className="text-sm text-muted-foreground"> / {counts.total}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-emerald-glow transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="glass rounded-2xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Validated, not arrived
          </div>
          <div className="mt-1 font-display text-2xl font-semibold text-sky-400">
            {counts.validated}
          </div>
        </div>
        <div className="glass rounded-2xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Arrival rate
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">{pct}%</div>
        </div>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          placeholder="Search attendees by name or school…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-secondary/40 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-glow/60"
        />
      </div>

      <div className="glass divide-y divide-border/60 rounded-2xl">
        {filtered.map((p) => {
          const role = roleByName(p.role) ?? USER_ROLES[0];
          const status = statuses[p.id];
          const checkedIn = status === 'checkedIn';
          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: role.color }}
                aria-hidden
              >
                {p.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[14px] font-semibold">
                    {p.name}
                  </span>
                  {checkedIn ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-glow" />
                  ) : status === 'validated' ? (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-sky-400" />
                  ) : null}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.org} ·{' '}
                  <span style={{ color: role.color }}>{role.label}</span>
                </div>
              </div>
              <button
                onClick={() => toggleCheckIn(p.id, p.name)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                  checkedIn
                    ? 'bg-secondary text-muted-foreground hover:text-foreground'
                    : 'glow-emerald bg-primary text-white hover:bg-emerald',
                )}
              >
                {checkedIn ? (
                  <>
                    <Undo2 className="h-3.5 w-3.5" /> Undo
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" /> Check in
                  </>
                )}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No attendees match “{query}”
          </div>
        )}
      </div>
    </AppShell>
  );
}

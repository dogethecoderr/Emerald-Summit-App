import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Search,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { useRequireProfile } from '../hooks/useRequireProfile';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, roleByName } from '../models/roles';
import { MOCK_PEOPLE, type Person, type Visibility } from '../models/people';
import { personStatusLabel } from '../models/personStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ROLE_FILTERS = ['All', ...USER_ROLES.map((r) => r.name)];

function canSeeField(vis: Visibility, viewerRoleName: string): boolean {
  if (vis === 'public') return true;
  if (vis === 'ambassadors') {
    return viewerRoleName === 'ambassador' || viewerRoleName === 'admin';
  }
  return false;
}

function PersonCard({
  person,
  viewerRoleName,
}: {
  person: Person;
  viewerRoleName: string;
}) {
  const role = roleByName(person.role) ?? USER_ROLES[0];

  return (
    <div className="glass flex flex-col rounded-2xl p-5 transition-colors hover:border-emerald-glow/30">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: role.color }}
          aria-hidden
        >
          {person.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold">
              {person.name}
            </span>
            {person.status !== 'none' && (
              <span className="shrink-0 text-emerald-glow" aria-hidden>
                {person.status === 'checkedIn' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {person.org}
          </div>
          <span
            className="mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: `${role.color}22`, color: role.color }}
          >
            {role.label}
          </span>
        </div>
      </div>

      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {person.bio}
      </p>

      <div
        className={cn(
          'mt-3 text-[11px] font-semibold',
          person.status === 'checkedIn' && 'text-emerald-mint',
          person.status === 'validated' && 'text-sky-400',
          person.status === 'none' && 'text-muted-foreground',
        )}
      >
        {personStatusLabel(person.status)}
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
        {canSeeField(person.emailVisible, viewerRoleName) ? (
          <a
            href={`mailto:${person.email}`}
            className="flex items-center gap-2 text-xs font-medium text-emerald-mint transition-colors hover:text-emerald-glow"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{person.email}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <Lock className="h-3.5 w-3.5 shrink-0" /> Email private
          </div>
        )}
        {canSeeField(person.phoneVisible, viewerRoleName) ? (
          <a
            href={`tel:${person.phone}`}
            className="flex items-center gap-2 text-xs font-medium text-emerald-mint transition-colors hover:text-emerald-glow"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {person.phone}
          </a>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <Lock className="h-3.5 w-3.5 shrink-0" /> Phone private
          </div>
        )}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const { ready, redirect } = useRequireProfile();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const viewerRoleName = (profile?.role as string | undefined) ?? 'participant';

  const filtered = MOCK_PEOPLE.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || p.name.toLowerCase().includes(q) || p.org.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <AppShell>
      <PageHeader
        label="Emerald High School · Dublin, CA"
        title="Directory"
        sub="Browse all participants, ambassadors, parents, and summit staff. Contact info respects each person's per-field visibility."
      />

      <div className="mb-6 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or school…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-secondary/40 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-glow/60"
          />
        </div>
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
          {ROLE_FILTERS.map((r) => {
            const active = roleFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-emerald text-white'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {r === 'All' ? 'All' : (roleByName(r)?.label ?? r)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <PersonCard key={p.id} person={p} viewerRoleName={viewerRoleName} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No results for “{query}”
        </div>
      )}
    </AppShell>
  );
}

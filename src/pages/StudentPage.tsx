import { Navigate } from 'react-router-dom';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Eye,
  Link2,
  MapPin,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import TrackPill from '../components/TrackPill';
import { useRequireRole } from '../hooks/useRequireProfile';
import { MOCK_SESSIONS, TIME_SLOTS } from '../models/sessions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// PLACEHOLDER: parent↔student linking isn't backed by real data yet — this
// mocks a confirmed link to Priya Sharma (p7 in the directory) following
// a competitor schedule of four sessions.
const LINKED_STUDENT = {
  name: 'Priya Sharma',
  initials: 'PS',
  school: 'Emerald High School',
  discipline: 'novasphere',
  sessionIds: ['s1', 's5', 's9', 's13'],
  spectatingIds: ['s11'],
  checkedIn: true,
};

const UPDATES = [
  {
    id: 'u1',
    time: '9:02 AM',
    text: 'Priya checked in at the front desk.',
  },
  {
    id: 'u2',
    time: '9:00 AM',
    text: 'Opening Keynote started in Main Hall A.',
  },
  {
    id: 'u3',
    time: '8:15 AM',
    text: 'Reminder sent: bring the signed code of conduct.',
  },
];

export default function StudentPage() {
  const { ready, redirect } = useRequireRole(['parent', 'admin']);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const sessions = MOCK_SESSIONS.filter(
    (s) =>
      LINKED_STUDENT.sessionIds.includes(s.id) ||
      LINKED_STUDENT.spectatingIds.includes(s.id),
  ).sort((a, b) => TIME_SLOTS.indexOf(a.time) - TIME_SLOTS.indexOf(b.time));

  return (
    <AppShell>
      <PageHeader
        label="Parent View · Spectator Lens"
        title={`${LINKED_STUDENT.name.split(' ')[0]}'s Day`}
        sub="Follow your student's schedule and progress. You'll get notifications tied to their activities — registration stays in their hands."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        {/* student's schedule */}
        <div className="space-y-3">
          {sessions.map((s, i) => {
            const spectating = LINKED_STUDENT.spectatingIds.includes(s.id);
            return (
              <div key={s.id} className="glass flex gap-4 rounded-2xl p-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald font-display text-[13px] font-bold text-white">
                    {i + 1}
                  </span>
                  {i < sessions.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-border" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <TrackPill track={s.track} />
                    {spectating && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">
                        <Eye className="h-3 w-3" /> Spectating
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug">
                    {s.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.time} · {s.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-mint">
                      <MapPin className="h-3 w-3" /> {s.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* side column */}
        <div className="space-y-6">
          {/* linked student card */}
          <section className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white"
                aria-hidden
              >
                {LINKED_STUDENT.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-semibold">
                    {LINKED_STUDENT.name}
                  </span>
                  {LINKED_STUDENT.checkedIn && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-glow" />
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {LINKED_STUDENT.school}
                </div>
                <div className="mt-1.5">
                  <TrackPill track={LINKED_STUDENT.discipline} />
                </div>
              </div>
            </div>
            <div
              className={cn(
                'mt-4 rounded-lg px-3 py-2 text-center text-xs font-semibold',
                LINKED_STUDENT.checkedIn
                  ? 'bg-emerald/15 text-emerald-mint'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              {LINKED_STUDENT.checkedIn
                ? 'Checked in · on campus'
                : 'Not yet arrived'}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Link2 className="h-3 w-3" />
              Link confirmed by your student
            </div>
          </section>

          {/* live updates */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-emerald-mint" />
              <h2 className="font-display text-base font-semibold">
                Live updates
              </h2>
            </div>
            <div className="space-y-3">
              {UPDATES.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <span className="w-14 shrink-0 text-[11px] font-semibold text-muted-foreground">
                    {u.time}
                  </span>
                  <p className="text-[13px] leading-snug">{u.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

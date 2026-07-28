import { Navigate } from 'react-router-dom';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Eye,
  Link2,
  MapPin,
  Shield,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import TrackPill from '../components/TrackPill';
import { useRequireRole } from '../hooks/useRequireProfile';
import { MOCK_SESSIONS, TIME_SLOTS, type Session } from '../models/sessions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface LinkedStudentInfo {
  name: string;
  initials: string;
  school: string;
  discipline: string;
  sessionIds: string[];
  spectatingIds: string[];
  checkedIn: boolean;
}

const DEFAULT_LINKED_STUDENT: LinkedStudentInfo = {
  name: 'Priya Sharma',
  initials: 'PS',
  school: 'Emerald High School',
  discipline: 'novasphere',
  sessionIds: ['s1', 's5', 's9', 's13'],
  spectatingIds: ['s11'],
  checkedIn: true,
};

const DEFAULT_UPDATES = [
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

export interface ParentSpectatorViewProps {
  linkedStudent?: LinkedStudentInfo | null;
  studentSchedule?: Session[] | null;
}

export default function ParentSpectatorView({
  linkedStudent = DEFAULT_LINKED_STUDENT,
  studentSchedule,
}: ParentSpectatorViewProps) {
  const { ready, redirect } = useRequireRole(['parent']);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const student = linkedStudent;

  const sessions = studentSchedule !== undefined
    ? (studentSchedule ?? [])
    : (student
        ? MOCK_SESSIONS.filter(
            (s) =>
              student.sessionIds.includes(s.id) ||
              student.spectatingIds.includes(s.id),
          ).sort((a, b) => TIME_SLOTS.indexOf(a.time) - TIME_SLOTS.indexOf(b.time))
        : []);

  const totalSessions = sessions.length;
  const completedCount = Math.min(2, totalSessions); // Mocked progress calculation
  const progressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <AppShell>
      <PageHeader
        label="Parent Spectator Lens"
        title={student ? `${student.name.split(' ')[0]}'s Summit Day` : 'Parent Spectator Lens'}
        sub="Read-only view of your linked student's summit schedule and progress. Registration and schedule building stay in your student's hands."
      />

      {/* Read-Only Security Notice Banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-glow/30 bg-emerald/10 px-4 py-3 text-xs text-emerald-mint">
        <Shield className="h-4 w-4 shrink-0 text-emerald-glow" />
        <span>
          <strong>Spectator View Mode:</strong> You are viewing a read-only spectator lens. Schedule building, session registration, and check-in edits are restricted to student and staff accounts.
        </span>
      </div>

      {!student ? (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-2 font-display text-lg font-semibold">
            No linked student found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No student account is currently linked to your parent spectator profile.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
          {/* Main Column: Student's Schedule Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-mint" />
                Student Schedule Timeline
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                {totalSessions} Session{totalSessions !== 1 ? 's' : ''} Enrolled
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 font-display text-base font-semibold">
                  No scheduled sessions for this student
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your student has not added any sessions to their summit schedule yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s, i) => {
                  const spectating = student.spectatingIds?.includes(s.id);
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
            )}
          </div>

          {/* Side Column: Student Card & Live Progress */}
          <div className="space-y-6">
            {/* Linked Student Card */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white"
                  aria-hidden
                >
                  {student.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold">
                      {student.name}
                    </span>
                    {student.checkedIn && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-glow" />
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {student.school}
                  </div>
                  <div className="mt-1.5">
                    <TrackPill track={student.discipline} />
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'mt-4 rounded-lg px-3 py-2 text-center text-xs font-semibold',
                  student.checkedIn
                    ? 'bg-emerald/15 text-emerald-mint'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {student.checkedIn
                  ? 'Checked in · on campus'
                  : 'Not yet arrived'}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Link2 className="h-3 w-3 text-emerald-mint" />
                <span>Link confirmed by your student</span>
              </div>
            </section>

            {/* Student Progress Overview */}
            <section className="glass rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-base font-semibold">
                Daily Progress
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Completed Sessions</span>
                  <span className="text-emerald-mint font-semibold">
                    {completedCount} of {totalSessions} ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-emerald transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Live Updates Feed */}
            <section className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-emerald-mint" />
                <h2 className="font-display text-base font-semibold">
                  Live Activity Feed
                </h2>
              </div>
              <div className="space-y-3">
                {DEFAULT_UPDATES.map((u) => (
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
      )}
    </AppShell>
  );
}

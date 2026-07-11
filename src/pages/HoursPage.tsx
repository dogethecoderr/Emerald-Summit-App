import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Award, Clock3, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import SummitLogo from '../components/SummitLogo';
import { useRequireRole } from '../hooks/useRequireProfile';
import { useAuth } from '../context/AuthContext';
import { MOCK_HOURS, type HoursEntry } from '../models/hours';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function LogHoursDialog({ onAdd }: { onAdd: (e: HoursEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const parsed = parseFloat(hours);
  const canAdd = !Number.isNaN(parsed) && parsed > 0 && description.trim();

  const add = () => {
    onAdd({
      id: `local-${Date.now()}`,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      hours: parsed,
      description: description.trim(),
      status: 'pending',
    });
    toast.success(`${parsed} hour${parsed === 1 ? '' : 's'} logged`, {
      description: 'Pending admin approval — you’ll be notified.',
    });
    setOpen(false);
    setHours('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow-emerald rounded-xl bg-primary font-semibold hover:bg-emerald">
          <Plus className="mr-1.5 h-4 w-4" /> Log hours
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-md border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Log volunteer hours</DialogTitle>
          <DialogDescription>
            An admin approves entries before they count toward your certificate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="h-hours" className="mb-1.5 block text-[13px]">
              Hours
            </Label>
            <Input
              id="h-hours"
              type="number"
              min="0.5"
              step="0.5"
              placeholder="2.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-secondary/40"
            />
          </div>
          <div>
            <Label htmlFor="h-desc" className="mb-1.5 block text-[13px]">
              What did you work on?
            </Label>
            <Textarea
              id="h-desc"
              rows={3}
              placeholder="Campus signage install with the ops team…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/40"
            />
          </div>
          <Button
            onClick={add}
            disabled={!canAdd}
            className="glow-emerald w-full rounded-xl bg-primary font-semibold hover:bg-emerald"
          >
            Submit for approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HoursPage() {
  const { ready, redirect } = useRequireRole(['ambassador', 'admin']);
  const { profile } = useAuth();
  const [entries, setEntries] = useState<HoursEntry[]>(MOCK_HOURS);

  const totals = useMemo(() => {
    const approved = entries
      .filter((e) => e.status === 'approved')
      .reduce((sum, e) => sum + e.hours, 0);
    const pending = entries
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.hours, 0);
    return { approved, pending };
  }, [entries]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const name = (profile?.name as string | undefined) ?? 'Ambassador';

  return (
    <AppShell>
      <PageHeader
        label="Ambassador Service"
        title="Volunteer Hours"
        sub="Log your summit service. Approved hours generate a signed certificate PDF — ready for school requirements and college apps."
        actions={<LogHoursDialog onAdd={(e) => setEntries((p) => [e, ...p])} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          {/* totals */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Approved hours
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-emerald-mint">
                {totals.approved}
              </div>
            </div>
            <div className="glass rounded-2xl px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Pending approval
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-amber-400">
                {totals.pending}
              </div>
            </div>
          </div>

          {/* entries */}
          <div className="glass divide-y divide-border/60 rounded-2xl">
            {entries.map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald/15 text-emerald-mint">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold">
                      {e.hours} hour{e.hours === 1 ? '' : 's'}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        e.status === 'approved'
                          ? 'bg-emerald/15 text-emerald-mint'
                          : 'bg-amber-500/15 text-amber-400',
                      )}
                    >
                      {e.status}
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {e.date}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {e.description}
                  </p>
                  {e.approvedBy && (
                    <div className="mt-1 text-[11px] text-muted-foreground/80">
                      Approved by {e.approvedBy}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* certificate */}
        <aside className="sticky top-10">
          <div className="glass overflow-hidden rounded-2xl">
            <div className="border-b border-border/60 bg-gradient-to-br from-emerald/25 to-transparent p-6 text-center">
              <div className="mx-auto h-12 w-12">
                <SummitLogo />
              </div>
              <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-mint">
                Certificate of Volunteer Service
              </div>
              <div className="mt-2 font-display text-xl font-semibold">{name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                has contributed{' '}
                <span className="font-bold text-emerald-mint">
                  {totals.approved} hours
                </span>{' '}
                of service to Emerald Summit ’27
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
                <span className="border-t border-border pt-1">
                  Bharat Paliwal · Co-Director
                </span>
                <span className="border-t border-border pt-1">
                  Deepa Kannan · Co-Director
                </span>
              </div>
            </div>
            <div className="p-4">
              <Button
                onClick={() =>
                  toast.success('Certificate generated', {
                    description:
                      'A signed PDF would download here — wired to the backend later.',
                  })
                }
                disabled={totals.approved === 0}
                className="w-full rounded-xl bg-primary font-semibold hover:bg-emerald"
              >
                <Download className="mr-1.5 h-4 w-4" /> Download signed PDF
              </Button>
              <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-mint" />
                Certificates include only admin-approved hours and render
                server-side with an official signature.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

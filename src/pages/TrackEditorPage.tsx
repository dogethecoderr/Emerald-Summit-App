import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Plus,
  Save,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import TrackPill from '../components/TrackPill';
import { useRequireRole } from '../hooks/useRequireProfile';
import { useAuth } from '../context/AuthContext';
import { disciplineByName } from '../models/disciplines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULTS = {
  title: 'AI & Machine Learning Foundations',
  tagline: 'Build your first model before lunch.',
  description:
    'A hands-on introduction to machine learning for complete beginners. Live demos, a guided coding exercise, and a mini-competition where your model faces the room. Bring a laptop — loaners available at the front desk.',
  sponsor: 'Dublin Tech Collective',
  sponsorBlurb:
    'Supporting the next generation of Tri-Valley builders with mentorship and cloud credits.',
};

export default function TrackEditorPage() {
  const { ready, redirect } = useRequireRole(['ambassador', 'admin']);
  const { profile } = useAuth();

  const [title, setTitle] = useState(DEFAULTS.title);
  const [tagline, setTagline] = useState(DEFAULTS.tagline);
  const [description, setDescription] = useState(DEFAULTS.description);
  const [sponsor, setSponsor] = useState(DEFAULTS.sponsor);
  const [sponsorBlurb, setSponsorBlurb] = useState(DEFAULTS.sponsorBlurb);
  const [dirty, setDirty] = useState(false);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const disciplineName =
    (profile?.discipline as string | undefined) ?? 'techverse';
  const discipline = disciplineByName(disciplineName);

  const bind =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setDirty(true);
    };

  const save = () => {
    setDirty(false);
    toast.success('Track page published', {
      description: 'Your marketing page is live for all participants (simulated).',
    });
  };

  return (
    <AppShell>
      <PageHeader
        label={`${discipline?.label ?? 'Your'} Track · Ambassador Editor`}
        title="Activity Marketing Page"
        sub="What participants see when they browse your track. Edits publish in-app — no designer in the loop."
        actions={
          <Button
            onClick={save}
            disabled={!dirty}
            className="glow-emerald rounded-xl bg-primary font-semibold hover:bg-emerald"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {dirty ? 'Publish changes' : 'Published'}
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* editor */}
        <div className="glass space-y-5 rounded-2xl p-5 sm:p-6">
          <div>
            <Label htmlFor="t-title" className="mb-1.5 block text-[13px]">
              Activity title
            </Label>
            <Input
              id="t-title"
              value={title}
              onChange={bind(setTitle)}
              className="bg-secondary/40"
            />
          </div>
          <div>
            <Label htmlFor="t-tagline" className="mb-1.5 block text-[13px]">
              Tagline
            </Label>
            <Input
              id="t-tagline"
              value={tagline}
              onChange={bind(setTagline)}
              className="bg-secondary/40"
            />
          </div>
          <div>
            <Label htmlFor="t-desc" className="mb-1.5 block text-[13px]">
              Description
            </Label>
            <Textarea
              id="t-desc"
              rows={5}
              value={description}
              onChange={bind(setDescription)}
              className="bg-secondary/40"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-[13px]">Photos</Label>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex aspect-video items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground"
                >
                  <ImageIcon className="h-5 w-5" />
                </div>
              ))}
              <button
                onClick={() =>
                  toast('Photo upload is simulated in demo mode')
                }
                className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-emerald-glow/50 hover:text-emerald-mint"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
              <HeartHandshake className="h-4 w-4 text-emerald-mint" />
              Sponsor block
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="t-sponsor" className="mb-1.5 block text-[12px]">
                  Sponsor name
                </Label>
                <Input
                  id="t-sponsor"
                  value={sponsor}
                  onChange={bind(setSponsor)}
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <Label htmlFor="t-sblurb" className="mb-1.5 block text-[12px]">
                  Sponsor blurb
                </Label>
                <Textarea
                  id="t-sblurb"
                  rows={2}
                  value={sponsorBlurb}
                  onChange={bind(setSponsorBlurb)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* live preview */}
        <aside className="sticky top-10">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-emerald-mint" /> Live preview
          </div>
          <div className="glass overflow-hidden rounded-2xl">
            <div
              className="flex h-36 items-center justify-center"
              style={{
                background: `linear-gradient(140deg, ${discipline?.color ?? '#0C7A55'}44, ${discipline?.color ?? '#0C7A55'}11)`,
              }}
            >
              <ImageIcon className="h-8 w-8 text-white/40" />
            </div>
            <div className="p-5">
              <TrackPill track={disciplineName} />
              <h3 className="mt-2 font-display text-xl font-semibold leading-tight">
                {title || 'Untitled activity'}
              </h3>
              <p className="mt-1 text-[13px] font-medium text-emerald-mint">
                {tagline}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
              {sponsor && (
                <div className="mt-4 rounded-xl border border-border/70 bg-secondary/30 p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Presented with
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold">
                    {sponsor}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {sponsorBlurb}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Megaphone, Send } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import AnnouncementsPanel from '../components/AnnouncementsPanel';
import { useRequireProfile } from '../hooks/useRequireProfile';
import { useAuth } from '../context/AuthContext';
import {
  MOCK_ANNOUNCEMENTS,
  type Announcement,
  type AnnouncementCategory,
} from '../models/announcements';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES: AnnouncementCategory[] = [
  'General',
  'Logistics',
  'Urgent',
  'Workshop',
];

// Spec §02: ambassadors can only post to select groups; admins reach everyone.
const ADMIN_AUDIENCES = [
  'Everyone',
  'Participants',
  'Ambassadors',
  'Parents',
  'Experts',
  'TechVerse',
  'BioSphere',
  'ImagineX',
  'NovaSphere',
  'VentureVerse',
  'CivicVerse',
];
const AMBASSADOR_AUDIENCES = ['Ambassadors', 'My Track'];

function ComposeDialog({
  roleName,
  authorName,
  onPost,
}: {
  roleName: string;
  authorName: string;
  onPost: (a: Announcement) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('General');
  const [audience, setAudience] = useState(
    roleName === 'admin' ? 'Everyone' : 'Ambassadors',
  );
  const [pinned, setPinned] = useState(false);

  const audiences =
    roleName === 'admin' ? ADMIN_AUDIENCES : AMBASSADOR_AUDIENCES;
  const canPost = title.trim().length > 0 && body.trim().length > 0;

  const post = () => {
    onPost({
      id: `local-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      category,
      date: 'Now',
      pinned,
      author: authorName,
      audience,
    });
    toast.success('Announcement published', {
      description: `Sent to ${audience} — push, feed, and email (simulated).`,
    });
    setOpen(false);
    setTitle('');
    setBody('');
    setPinned(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow-emerald rounded-xl bg-primary font-semibold hover:bg-emerald">
          <Megaphone className="mr-1.5 h-4 w-4" /> Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-lg border-border">
        <DialogHeader>
          <DialogTitle className="font-display">New announcement</DialogTitle>
          <DialogDescription>
            Lands as a push notification, feed item, and email to the selected
            audience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="a-title" className="mb-1.5 block text-[13px]">
              Title
            </Label>
            <Input
              id="a-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Room change: TechVerse moves to Lab C"
              className="bg-secondary/40"
            />
          </div>
          <div>
            <Label htmlFor="a-body" className="mb-1.5 block text-[13px]">
              Message
            </Label>
            <Textarea
              id="a-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What does everyone need to know?"
              className="bg-secondary/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-[13px]">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as AnnouncementCategory)}
              >
                <SelectTrigger className="bg-secondary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-[13px]">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="bg-secondary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {roleName === 'admin' && (
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/30 px-4 py-3">
              <div>
                <div className="text-[13px] font-semibold">Pin to top</div>
                <div className="text-[11px] text-muted-foreground">
                  Keeps this announcement above the feed.
                </div>
              </div>
              <Switch checked={pinned} onCheckedChange={setPinned} />
            </div>
          )}
          <Button
            onClick={post}
            disabled={!canPost}
            className="glow-emerald w-full rounded-xl bg-primary font-semibold hover:bg-emerald"
          >
            <Send className="mr-1.5 h-4 w-4" /> Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AnnouncementsPage() {
  const { ready, redirect } = useRequireProfile();
  const { profile } = useAuth();
  const [posted, setPosted] = useState<Announcement[]>([]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const roleName = (profile?.role as string | undefined) ?? 'participant';
  const authorName = (profile?.name as string | undefined) ?? 'Summit Staff';
  const canCompose = roleName === 'admin' || roleName === 'ambassador';

  const announcements = [...posted, ...MOCK_ANNOUNCEMENTS];

  return (
    <AppShell>
      <PageHeader
        label="Live Updates"
        title="Announcements"
        sub="Logistics, schedule changes, and summit news — with downloadable forms and guides posted alongside them."
        actions={
          canCompose ? (
            <ComposeDialog
              roleName={roleName}
              authorName={authorName}
              onPost={(a) => setPosted((prev) => [a, ...prev])}
            />
          ) : undefined
        }
      />
      <AnnouncementsPanel announcements={announcements} variant="full" />
    </AppShell>
  );
}

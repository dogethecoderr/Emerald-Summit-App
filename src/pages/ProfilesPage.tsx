import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import PersonCard from '../components/PersonCard';
import { useRequireProfile } from '../hooks/useRequireProfile';
import { useAuth } from '../context/AuthContext';
import type { Visibility } from '../models/people';
import {
  getProfileSettings,
  profileToPerson,
  updateProfileSettings,
  type Profile,
} from '../services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function FieldCard({
  title,
  description,
  children,
  visibility,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  visibility?: {
    value: Visibility;
    onChange: (value: Visibility) => void;
    disabled?: boolean;
  };
}) {
  const isPublic = visibility?.value === 'public';

  return (
    <div className="rounded-xl border border-border/70 bg-secondary/30 px-4 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">{title}</div>
          {description && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {visibility && (
          <div className="flex shrink-0 items-center gap-2 self-center">
            <span
              className={cn(
                'text-[11px] font-semibold',
                isPublic ? 'text-emerald-mint' : 'text-muted-foreground',
              )}
            >
              {isPublic ? 'Visible' : 'Hidden'}
            </span>
            <Switch
              checked={isPublic}
              disabled={visibility.disabled}
              onCheckedChange={(checked) =>
                visibility.onChange(checked ? 'public' : 'private')
              }
            />
          </div>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function MyProfileSection({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => Promise<void>;
}) {
  const settings = getProfileSettings(profile);
  const roleName = (profile.role as string | undefined) ?? 'participant';

  const [name, setName] = useState((profile.name as string) ?? '');
  const [org, setOrg] = useState(settings.org);
  const [phone, setPhone] = useState((profile.phone as string | undefined) ?? '');
  const [bio, setBio] = useState((profile.bio as string | undefined) ?? '');
  const [directoryVisible, setDirectoryVisible] = useState(
    settings.directoryVisible,
  );
  const [emailVisible, setEmailVisible] = useState(settings.emailVisible);
  const [phoneVisible, setPhoneVisible] = useState(settings.phoneVisible);
  const [bioVisible, setBioVisible] = useState(settings.bioVisible);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const next = getProfileSettings(profile);
    setName((profile.name as string) ?? '');
    setOrg(next.org);
    setPhone((profile.phone as string | undefined) ?? '');
    setBio((profile.bio as string | undefined) ?? '');
    setDirectoryVisible(next.directoryVisible);
    setEmailVisible(next.emailVisible);
    setPhoneVisible(next.phoneVisible);
    setBioVisible(next.bioVisible);
  }, [profile]);

  const previewPerson = useMemo(
    () =>
      profileToPerson({
        ...profile,
        name: name.trim() || 'Summit User',
        phone,
        bio,
        org,
        directory_visible: directoryVisible,
        email_visible: emailVisible,
        phone_visible: phoneVisible,
        bio_visible: bioVisible,
      }),
    [
      profile,
      name,
      org,
      phone,
      bio,
      directoryVisible,
      emailVisible,
      phoneVisible,
      bioVisible,
    ],
  );

  const handleSave = async () => {
    if (name.trim().length === 0) {
      toast.error('Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfileSettings({
        name: name.trim(),
        org: org.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        directoryVisible,
        emailVisible,
        phoneVisible,
        bioVisible,
      });
      await onSaved();
      toast.success('Profile updated');
    } catch (error) {
      toast.error(`Could not save profile: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="mx-auto max-w-[43.2rem] space-y-5">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Preview
          </p>
          {directoryVisible ? (
            <PersonCard
              person={previewPerson}
              viewerRoleName={roleName}
              showBio
            />
          ) : (
            <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center">
              <EyeOff className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold">Hidden from directory</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Your profile is saved, but other summit attendees won&apos;t see
                you in the directory until you turn listing back on.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <FieldCard title="Full name">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border-border/60 bg-background/60 pl-10"
              />
            </div>
          </FieldCard>

          <FieldCard title="Organization">
            <Input
              id="profile-org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Emerald High School"
              className="h-11 rounded-xl border-border/60 bg-background/60"
            />
          </FieldCard>

          <FieldCard
            title="Phone"
            description="Show your phone number on your directory card."
            visibility={{
              value: phoneVisible,
              onChange: setPhoneVisible,
              disabled: !directoryVisible,
            }}
          >
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="h-11 rounded-xl border-border/60 bg-background/60"
            />
          </FieldCard>

          <FieldCard
            title="Bio"
            description="Show your bio on your directory card."
            visibility={{
              value: bioVisible,
              onChange: setBioVisible,
              disabled: !directoryVisible,
            }}
          >
            <Textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A sentence or two about yourself."
              className="rounded-xl border-border/60 bg-background/60"
            />
          </FieldCard>

          <FieldCard
            title="Email"
            description="Show your email on your directory card."
            visibility={{
              value: emailVisible,
              onChange: setEmailVisible,
              disabled: !directoryVisible,
            }}
          >
            <p className="truncate rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-muted-foreground">
              {(profile.email as string | undefined) ?? ''}
            </p>
          </FieldCard>

          <FieldCard
            title="List me in the directory"
            description="Turn off to hide your profile for now."
            visibility={{
              value: directoryVisible ? 'public' : 'private',
              onChange: (v) => setDirectoryVisible(v === 'public'),
            }}
          />

          <Button
            className="glow-emerald mt-1 h-11 rounded-xl bg-primary font-semibold hover:bg-emerald"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function ProfilesPage() {
  const { ready, redirect } = useRequireProfile();
  const { profile, refreshProfile } = useAuth();

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready || profile == null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader
        label="Emerald High School · Dublin, CA"
        title="Profiles"
        sub="Edit how you appear and choose what others can see in the directory."
      />
      <MyProfileSection profile={profile} onSaved={refreshProfile} />
    </AppShell>
  );
}

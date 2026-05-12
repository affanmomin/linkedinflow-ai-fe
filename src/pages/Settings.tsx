import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { User, Bell, Palette, Database, Download, Trash2, Save, RefreshCw, AlertTriangle, Check, Mic2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useDataStore } from '@/store/useDataStore';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name:     z.string().min(1, 'Name is required'),
  email:    z.string().email('Invalid email address'),
  timezone: z.string(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications:  z.boolean(),
  postSuccess:        z.boolean(),
  postFailure:        z.boolean(),
  batchComplete:      z.boolean(),
  weeklyReport:       z.boolean(),
});

type ProfileFormData      = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export function Settings() {
  const { user, setUser } = useAuthStore();
  const { posts } = useLinkedInStore();
  const { sheetConnection } = useDataStore();
  const { actualTheme, theme, setTheme } = useTheme();
  const [isLoading,     setIsLoading]     = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);

  const BRAND_VOICE_KEY = 'linkedinflow_brand_voice';

  const loadBrandVoice = () => {
    try {
      const saved = localStorage.getItem(BRAND_VOICE_KEY);
      return saved ? JSON.parse(saved) : { name: '', tone: 'professional', style: '', examples: '' };
    } catch {
      return { name: '', tone: 'professional', style: '', examples: '' };
    }
  };

  const [brandVoice, setBrandVoice] = useState<{
    name: string;
    tone: string;
    style: string;
    examples: string;
  }>(loadBrandVoice);
  const [brandVoiceSaved, setBrandVoiceSaved] = useState(false);

  const saveBrandVoice = () => {
    localStorage.setItem(BRAND_VOICE_KEY, JSON.stringify(brandVoice));
    setBrandVoiceSaved(true);
    setTimeout(() => setBrandVoiceSaved(false), 2000);
  };

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:     user?.name || '',
      email:    user?.email || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications:  false,
      postSuccess:        true,
      postFailure:        true,
      batchComplete:      true,
      weeklyReport:       false,
    },
  });

  const save = async (successMsg: string) => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      toast.success(successMsg);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (data: { name: string; timezone: string }) => {
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const res = await authAPI.updateProfile({ name: data.name, timezone: data.timezone });
      if (res.user) setUser({ ...user!, ...res.user });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        toast.error('Profile save not available yet — backend update in progress.');
      } else {
        toast.error(err?.response?.data?.message ?? 'Failed to save profile.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const exportCSV = () => {
    const headers = ['id', 'content', 'post_type', 'status', 'scheduled_at', 'published_at', 'created_at'];
    const rows = posts.map(p => [
      p.id,
      `"${(p.content || '').replace(/"/g, '""')}"`,
      p.post_type || '',
      p.status || '',
      p.scheduled_at || '',
      p.published_at || '',
      p.created_at || '',
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedinflow-posts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    const data = { posts, sheetConnection, exportDate: new Date().toISOString() };
    const blob  = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `linkedinflow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported.');
  };

  const clearAllData = () => {
    localStorage.clear();
    toast.success('All local data cleared.');
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="profile"       className="text-xs h-7 gap-1.5"><User className="h-3 w-3" />Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs h-7 gap-1.5"><Bell className="h-3 w-3" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance"    className="text-xs h-7 gap-1.5"><Palette className="h-3 w-3" />Appearance</TabsTrigger>
          <TabsTrigger value="data"          className="text-xs h-7 gap-1.5"><Database className="h-3 w-3" />Data</TabsTrigger>
          <TabsTrigger value="brand-voice"   className="text-xs h-7 gap-1.5"><Mic2 className="h-3 w-3" />Brand Voice</TabsTrigger>
        </TabsList>

        {/* ── Profile ──────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><User className="h-3.5 w-3.5" /></div>
                Profile Information
              </CardTitle>
              <CardDescription>Update your name, email, and timezone.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-5">
                {/* Avatar preview */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">Full name</Label>
                    <Input id="name" {...profileForm.register('name')} className="h-9 text-sm" />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                    <Input id="email" type="email" {...profileForm.register('email')} className="h-9 text-sm" />
                    {profileForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone" className="text-xs font-medium">Timezone</Label>
                  <Input id="timezone" {...profileForm.register('timezone')} className="h-9 text-sm" />
                </div>
                <Button type="submit" size="sm" disabled={savingProfile} className="gap-1.5">
                  {savingProfile
                    ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Saving...</>
                    : profileSaved
                    ? <><Check className="h-3.5 w-3.5 text-green-500" />Saved</>
                    : <><Save className="h-3.5 w-3.5" />Save changes</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ────────────────────────────────────────── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><Bell className="h-3.5 w-3.5" /></div>
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose when and how you get notified.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(() => save('Preferences saved.'))} className="space-y-0">

                <div className="space-y-0">
                  <p className="section-label pb-3">Channels</p>
                  {[
                    { name: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive updates in your inbox' },
                    { name: 'pushNotifications'  as const, label: 'Push notifications',  desc: 'Browser push notifications' },
                  ].map((item) => (
                    <div key={item.name} className="settings-row">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Switch {...notificationForm.register(item.name)} />
                    </div>
                  ))}
                </div>

                <Separator className="my-5" />

                <div className="space-y-0">
                  <p className="section-label pb-3">Events</p>
                  {[
                    { name: 'postSuccess'   as const, label: 'Post published',  desc: 'When a post publishes successfully' },
                    { name: 'postFailure'   as const, label: 'Post failed',     desc: 'When a post fails to publish' },
                    { name: 'batchComplete' as const, label: 'Batch complete',  desc: 'When bulk processing finishes' },
                    { name: 'weeklyReport'  as const, label: 'Weekly digest',   desc: 'Summary of your weekly activity' },
                  ].map((item) => (
                    <div key={item.name} className="settings-row">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Switch {...notificationForm.register(item.name)} />
                    </div>
                  ))}
                </div>

                <div className="pt-5">
                  <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
                    {isLoading
                      ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Saving…</>
                      : <><Save className="h-3.5 w-3.5" />Save preferences</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appearance ───────────────────────────────────────────── */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><Palette className="h-3.5 w-3.5" /></div>
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of LinkedInFlow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="settings-row border-b border-border pb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose light, dark, or follow your system</p>
                </div>
                <ThemeToggle />
              </div>

              {/* Theme previews */}
              <div>
                <p className="section-label mb-3">Preview</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light',  label: 'Light',  classes: 'bg-white border-gray-200' },
                    { id: 'dark',   label: 'Dark',   classes: 'bg-slate-900 border-slate-700' },
                    { id: 'system', label: 'System', classes: 'bg-gradient-to-br from-white to-slate-200 dark:from-slate-900 dark:to-slate-800 border-border' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={cn(
                        'space-y-2 text-left rounded-xl border-2 p-0.5 transition-all',
                        theme === t.id ? 'border-primary' : 'border-transparent hover:border-border',
                      )}
                    >
                      <div className={cn('h-14 rounded-lg border', t.classes)} />
                      <p className="text-xs font-medium text-center pb-1 text-muted-foreground">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Currently active</span>
                <Badge variant="outline" className="capitalize text-xs font-medium">{actualTheme}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Data ─────────────────────────────────────────────────── */}
        <TabsContent value="data" className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><Database className="h-3.5 w-3.5" /></div>
                Data Management
              </CardTitle>
              <CardDescription>Export your data or review usage statistics.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Export your data</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Download your data as JSON or CSV.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={exportData} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Export JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Export CSV
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Account statistics</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Total posts',  value: posts.length },
                      { label: 'Published',    value: posts.filter(p => p.status === 'published').length },
                      { label: 'Drafts',       value: posts.filter(p => p.status === 'draft').length },
                      { label: 'Failed',       value: posts.filter(p => p.status === 'failed').length },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold text-foreground tabular-nums">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/25">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-destructive">Danger zone</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Permanently deletes all local data including posts, credentials, and settings.
                    <strong className="text-foreground"> This action cannot be undone.</strong>
                  </p>
                  <Button variant="destructive" size="sm" onClick={clearAllData} className="gap-1.5 mt-1">
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear all data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Brand Voice ─────────────────────────────────────────── */}
        <TabsContent value="brand-voice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><Mic2 className="h-3.5 w-3.5" /></div>
                Brand Voice
              </CardTitle>
              <CardDescription>Define your writing style so AI can generate posts that sound like you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-700">
                <p className="font-semibold mb-0.5">Coming soon: AI content generation</p>
                <p>Your brand voice will be used to generate and rewrite posts that match your style. Save your preferences now.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bv-name" className="text-xs font-medium">Voice name</Label>
                <Input
                  id="bv-name"
                  placeholder="e.g. Professional, Thought Leader, Casual Expert"
                  className="h-9 text-sm"
                  value={brandVoice.name}
                  onChange={e => setBrandVoice(v => ({ ...v, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bv-tone" className="text-xs font-medium">Default tone</Label>
                <select
                  id="bv-tone"
                  value={brandVoice.tone}
                  onChange={e => setBrandVoice(v => ({ ...v, tone: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual &amp; Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bv-style" className="text-xs font-medium">Writing style notes</Label>
                <Textarea
                  id="bv-style"
                  placeholder="e.g. I use short sentences, bullet points for key insights, end posts with a question to drive comments. I avoid corporate jargon."
                  className="text-sm resize-none"
                  rows={3}
                  value={brandVoice.style}
                  onChange={e => setBrandVoice(v => ({ ...v, style: e.target.value }))}
                />
                <p className="text-[11px] text-muted-foreground">{brandVoice.style.length}/500 chars</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bv-examples" className="text-xs font-medium">Example posts (optional)</Label>
                <Textarea
                  id="bv-examples"
                  placeholder="Paste 1–3 of your best LinkedIn posts here. AI will learn your patterns."
                  className="text-sm resize-none"
                  rows={5}
                  value={brandVoice.examples}
                  onChange={e => setBrandVoice(v => ({ ...v, examples: e.target.value }))}
                />
              </div>

              <Button size="sm" onClick={saveBrandVoice} className="gap-1.5">
                {brandVoiceSaved
                  ? <><Check className="h-3.5 w-3.5 text-green-500" />Saved</>
                  : <><Save className="h-3.5 w-3.5" />Save voice</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

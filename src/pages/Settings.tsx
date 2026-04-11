import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { User, Bell, Palette, Database, Download, Trash2, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useDataStore } from '@/store/useDataStore';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
  const { user } = useAuthStore();
  const { posts } = useLinkedInStore();
  const { sheetConnection } = useDataStore();
  const { actualTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

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
      await new Promise(r => setTimeout(r, 800));
      toast.success(successMsg);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = { posts, sheetConnection, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `linkedinflow-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported.');
  };

  const clearAllData = () => {
    localStorage.clear();
    toast.success('All local data cleared.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and application preferences.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1.5 text-xs">
            <Database className="h-3.5 w-3.5" /> Data
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="icon-container-sm"><User className="h-3.5 w-3.5" /></div>
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(() => save('Profile updated.'))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" {...profileForm.register('name')} />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" {...profileForm.register('email')} />
                    {profileForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" {...profileForm.register('timezone')} />
                </div>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading
                    ? <><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
                    : <><Save className="mr-1.5 h-3.5 w-3.5" />Save changes</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="icon-container-sm"><Bell className="h-3.5 w-3.5" /></div>
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(() => save('Preferences saved.'))} className="space-y-5">
                <div className="space-y-4">
                  {[
                    { name: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive updates via email' },
                    { name: 'pushNotifications'  as const, label: 'Push notifications',  desc: 'Browser push notifications' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch {...notificationForm.register(item.name)} />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Events</p>
                  {[
                    { name: 'postSuccess'  as const, label: 'Post published',   desc: 'When a post publishes successfully' },
                    { name: 'postFailure'  as const, label: 'Post failed',      desc: 'When a post fails to publish' },
                    { name: 'batchComplete' as const, label: 'Batch complete',  desc: 'When batch processing finishes' },
                    { name: 'weeklyReport' as const, label: 'Weekly report',    desc: 'Weekly activity summary' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch {...notificationForm.register(item.name)} />
                    </div>
                  ))}
                </div>

                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading
                    ? <><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
                    : <><Save className="mr-1.5 h-3.5 w-3.5" />Save preferences</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="icon-container-sm"><Palette className="h-3.5 w-3.5" /></div>
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Choose light, dark, or system default</p>
                </div>
                <ThemeToggle />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-3">
                {['Light', 'Dark', 'System'].map((t) => (
                  <div key={t} className="space-y-2">
                    <div className={`h-16 rounded-lg border-2 transition-colors ${
                      t === 'Light'  ? 'bg-white border-border' :
                      t === 'Dark'   ? 'bg-slate-900 border-slate-700' :
                      'bg-gradient-to-br from-white to-slate-200 dark:from-slate-900 dark:to-slate-800 border-border'
                    }`} />
                    <p className="text-xs text-center text-muted-foreground">{t}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-muted-foreground">Active theme</span>
                <Badge variant="outline" className="capitalize text-xs">{actualTheme}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="icon-container-sm"><Database className="h-3.5 w-3.5" /></div>
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-1">Export data</p>
                    <p className="text-xs text-muted-foreground mb-3">Download your posts and settings as JSON.</p>
                    <Button variant="outline" size="sm" onClick={exportData}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Export all data
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Statistics</p>
                    {[
                      { label: 'Total posts',      value: posts.length },
                      { label: 'Published',         value: posts.filter(p => p.status === 'published').length },
                      { label: 'Failed',            value: posts.filter(p => p.status === 'failed').length },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-semibold text-destructive">Danger zone</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete all local data including posts, credentials, and settings. This cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm" onClick={clearAllData}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Clear all data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

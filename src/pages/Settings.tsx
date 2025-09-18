import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Clock,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useDataStore } from '@/store/useDataStore';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  timezone: z.string(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  postSuccess: z.boolean(),
  postFailure: z.boolean(),
  batchComplete: z.boolean(),
  weeklyReport: z.boolean(),
});

const automationSchema = z.object({
  autoRetry: z.boolean(),
  retryAttempts: z.number().min(1).max(5),
  delayBetweenPosts: z.number().min(1).max(60),
  enableScheduling: z.boolean(),
  maxDailyPosts: z.number().min(1).max(50),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;
type AutomationFormData = z.infer<typeof automationSchema>;

export function Settings() {
  const { user } = useAuthStore();
  const { posts, clearCredentials } = useLinkedInStore();
  const { sheetConnection } = useDataStore();
  const { theme, actualTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      postSuccess: true,
      postFailure: true,
      batchComplete: true,
      weeklyReport: false,
    },
  });

  const automationForm = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      autoRetry: true,
      retryAttempts: 3,
      delayBetweenPosts: 5,
      enableScheduling: true,
      maxDailyPosts: 10,
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const onAutomationSubmit = async (data: AutomationFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Automation settings updated');
    } catch (error) {
      toast.error('Failed to update automation settings');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      posts,
      sheetConnection,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-automation-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported successfully');
  };

  const clearAllData = () => {
    clearCredentials();
    localStorage.clear();
    toast.success('All data cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="hidden sm:flex">
            Theme: {theme}
          </Badge>
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Automation</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                      className={profileForm.formState.errors.name ? 'border-destructive' : ''}
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email')}
                      className={profileForm.formState.errors.email ? 'border-destructive' : ''}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    {...profileForm.register('timezone')}
                    placeholder="America/New_York"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch {...notificationForm.register('emailNotifications')} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch {...notificationForm.register('pushNotifications')} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Event Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Post Success</Label>
                      <p className="text-sm text-muted-foreground">When posts are published successfully</p>
                    </div>
                    <Switch {...notificationForm.register('postSuccess')} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Post Failure</Label>
                      <p className="text-sm text-muted-foreground">When posts fail to publish</p>
                    </div>
                    <Switch {...notificationForm.register('postFailure')} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Batch Complete</Label>
                      <p className="text-sm text-muted-foreground">When batch processing completes</p>
                    </div>
                    <Switch {...notificationForm.register('batchComplete')} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Report</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                    </div>
                    <Switch {...notificationForm.register('weeklyReport')} />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Settings */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Automation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={automationForm.handleSubmit(onAutomationSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Retry Failed Posts</Label>
                        <p className="text-sm text-muted-foreground">Automatically retry failed posts</p>
                      </div>
                      <Switch {...automationForm.register('autoRetry')} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="retryAttempts">Retry Attempts</Label>
                      <Input
                        id="retryAttempts"
                        type="number"
                        min="1"
                        max="5"
                        {...automationForm.register('retryAttempts', { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="delayBetweenPosts">Delay Between Posts (minutes)</Label>
                      <Input
                        id="delayBetweenPosts"
                        type="number"
                        min="1"
                        max="60"
                        {...automationForm.register('delayBetweenPosts', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Scheduling</Label>
                        <p className="text-sm text-muted-foreground">Allow posts to be scheduled</p>
                      </div>
                      <Switch {...automationForm.register('enableScheduling')} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxDailyPosts">Max Daily Posts</Label>
                      <Input
                        id="maxDailyPosts"
                        type="number"
                        min="1"
                        max="50"
                        {...automationForm.register('maxDailyPosts', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-background border-2 border-border flex items-center justify-center">
                      {/* <Sun className="h-6 w-6" /> */}
                    </div>
                    <p className="text-sm text-center">Light</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                      {/* <Moon className="h-6 w-6 text-white" /> */}
                    </div>
                    <p className="text-sm text-center">Dark</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-background to-slate-100 dark:to-slate-800 border-2 border-border flex items-center justify-center">
                      {/* <Monitor className="h-6 w-6" /> */}
                    </div>
                    <p className="text-sm text-center">System</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Current Theme Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Selected Theme</p>
                    <p className="font-medium capitalize">{theme}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Theme</p>
                    <p className="font-medium capitalize">{actualTheme}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your posts, settings, and connections as a JSON file.
                  </p>
                  <Button onClick={exportData} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Data Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Posts</span>
                      <span className="font-medium">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Successful Posts</span>
                      <span className="font-medium text-green-600">
                        {posts.filter(p => p.status === 'success').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed Posts</span>
                      <span className="font-medium text-red-600">
                        {posts.filter(p => p.status === 'failed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sheet Connection</span>
                      <Badge variant={sheetConnection ? 'default' : 'secondary'}>
                        {sheetConnection ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      This action will permanently delete all your data including posts, credentials, and settings.
                      This cannot be undone.
                    </p>
                    <Button onClick={clearAllData} variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const automationSchema = z.object({
  autoRetry: z.boolean(),
  retryAttempts: z.number().min(1).max(5),
  delayBetweenPosts: z.number().min(1).max(60),
  enableScheduling: z.boolean(),
  maxDailyPosts: z.number().min(1).max(50),
});

type AutomationFormData = z.infer<typeof automationSchema>;

export function Automation() {
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (_data: AutomationFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Automation settings updated');
    } catch {
      toast.error('Failed to update automation settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-amber-600/10 to-yellow-600/10 rounded-2xl blur-2xl" />
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-amber-900 dark:from-white dark:via-orange-100 dark:to-amber-100 bg-clip-text text-transparent">
                  Automation
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                  Configure automated posting behavior and scheduling.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/30 dark:to-amber-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <CardHeader className="relative bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-200/20 dark:border-orange-800/20 p-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 dark:text-white">Automation Settings</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Configure automated posting behavior</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pt-4">
            <form onSubmit={automationForm.handleSubmit(onSubmit)} className="space-y-6">
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
                      className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
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
                      className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
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
                      className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-400 shadow-lg hover:shadow-orange-500/25 transition-all duration-200 group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

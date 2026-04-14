import { useState } from 'react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime-300/25 via-lime-100/20 to-lime-300/18 blur-2xl" />
        <div className="relative rounded-2xl border border-black/15 bg-white/85 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-lime-300/20 p-2 text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.22)_inset]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Automation</h1>
              <p className="text-xs font-medium text-black/70">
                Configure automated posting behavior and scheduling.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="group relative overflow-hidden border-black/10 bg-white/80 text-black shadow-[0_8px_22px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:bg-white/92">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
        <CardHeader className="relative border-b border-black/10 bg-white/60 p-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="rounded-lg bg-lime-300/20 p-2 text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.22)_inset]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold text-black">Automation Settings</span>
              <p className="text-xs font-normal text-black/70">Configure automated posting behavior</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative pt-4">
          <form onSubmit={automationForm.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-black">Auto Retry Failed Posts</Label>
                    <p className="text-sm text-black/70">Automatically retry failed posts</p>
                  </div>
                  <Switch {...automationForm.register('autoRetry')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retryAttempts" className="text-black">Retry Attempts</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    min="1"
                    max="5"
                    {...automationForm.register('retryAttempts', { valueAsNumber: true })}
                    className="!border-black/20 !bg-white !text-black placeholder:!text-black/45"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delayBetweenPosts" className="text-black">Delay Between Posts (minutes)</Label>
                  <Input
                    id="delayBetweenPosts"
                    type="number"
                    min="1"
                    max="60"
                    {...automationForm.register('delayBetweenPosts', { valueAsNumber: true })}
                    className="!border-black/20 !bg-white !text-black placeholder:!text-black/45"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-black">Enable Scheduling</Label>
                    <p className="text-sm text-black/70">Allow posts to be scheduled</p>
                  </div>
                  <Switch {...automationForm.register('enableScheduling')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDailyPosts" className="text-black">Max Daily Posts</Label>
                  <Input
                    id="maxDailyPosts"
                    type="number"
                    min="1"
                    max="50"
                    {...automationForm.register('maxDailyPosts', { valueAsNumber: true })}
                    className="!border-black/20 !bg-white !text-black placeholder:!text-black/45"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="group w-full sm:w-auto !border-lime-500/35 !bg-lime-100 !text-black hover:!bg-lime-200"
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
  );
}

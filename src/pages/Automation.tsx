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
      <div className="rounded-2xl border border-[#e0dfdc] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#eef3f8] p-2 text-[#0a66c2] border border-[#dce6f1]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#191919]">Automation</h1>
              <p className="text-xs font-medium text-[#595959]">
                Configure automated posting behavior and scheduling.
              </p>
            </div>
          </div>
      </div>

      <Card className="overflow-hidden border-[#e0dfdc] bg-white text-[#191919] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <CardHeader className="border-b border-[#e0dfdc] bg-[#f3f2ee] p-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="rounded-lg bg-[#eef3f8] p-2 text-[#0a66c2] border border-[#dce6f1]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold text-[#191919]">Automation Settings</span>
              <p className="text-xs font-normal text-[#595959]">Configure automated posting behavior</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={automationForm.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#191919]">Auto Retry Failed Posts</Label>
                    <p className="text-sm text-[#595959]">Automatically retry failed posts</p>
                  </div>
                  <Switch {...automationForm.register('autoRetry')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retryAttempts" className="text-[#374151]">Retry Attempts</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    min="1"
                    max="5"
                    {...automationForm.register('retryAttempts', { valueAsNumber: true })}
                    className="!border-[#dce6f1] !bg-[#f8fafc] !text-[#191919] placeholder:!text-[#86888a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delayBetweenPosts" className="text-[#374151]">Delay Between Posts (minutes)</Label>
                  <Input
                    id="delayBetweenPosts"
                    type="number"
                    min="1"
                    max="60"
                    {...automationForm.register('delayBetweenPosts', { valueAsNumber: true })}
                    className="!border-[#dce6f1] !bg-[#f8fafc] !text-[#191919] placeholder:!text-[#86888a]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#191919]">Enable Scheduling</Label>
                    <p className="text-sm text-[#595959]">Allow posts to be scheduled</p>
                  </div>
                  <Switch {...automationForm.register('enableScheduling')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDailyPosts" className="text-[#374151]">Max Daily Posts</Label>
                  <Input
                    id="maxDailyPosts"
                    type="number"
                    min="1"
                    max="50"
                    {...automationForm.register('maxDailyPosts', { valueAsNumber: true })}
                    className="!border-[#dce6f1] !bg-[#f8fafc] !text-[#191919] placeholder:!text-[#86888a]"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="group w-full sm:w-auto !border-[#0a66c2] !bg-[#0a66c2] !text-white hover:!bg-[#004182]"
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

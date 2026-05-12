import { useState, useEffect } from 'react';
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
import { automationAPI } from '@/lib/api';
import { loadQueueSettings, saveQueueSettings, type QueueSettings } from '@/lib/queue';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

const automationSchema = z.object({
  autoRetry: z.boolean(),
  retryAttempts: z.number().min(1).max(5),
  delayBetweenPosts: z.number().min(1).max(60),
  enableScheduling: z.boolean(),
  maxDailyPosts: z.number().min(1).max(50),
});

type AutomationFormData = z.infer<typeof automationSchema>;

const PRESETS = [
  {
    label: 'Conservative',
    description: 'Safe defaults — low frequency, high reliability',
    values: { autoRetry: true, retryAttempts: 2, delayBetweenPosts: 30, enableScheduling: true, maxDailyPosts: 3 },
  },
  {
    label: 'Standard',
    description: 'Balanced posting cadence for most users',
    values: { autoRetry: true, retryAttempts: 3, delayBetweenPosts: 10, enableScheduling: true, maxDailyPosts: 5 },
  },
  {
    label: 'Aggressive',
    description: 'High-frequency for power users and agencies',
    values: { autoRetry: true, retryAttempts: 5, delayBetweenPosts: 2, enableScheduling: true, maxDailyPosts: 20 },
  },
] as const;

export function Automation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const [queue, setQueue] = useState<QueueSettings>(() => loadQueueSettings());

  const toggleQueueDay = (day: number) => {
    setQueue(q => ({
      ...q,
      days: q.days.includes(day) ? q.days.filter(d => d !== day) : [...q.days, day].sort(),
    }));
  };

  const saveQueue = () => {
    saveQueueSettings(queue);
    toast.success('Posting schedule saved.');
  };

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

  // Load automation settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingInitial(true);
        const data = await automationAPI.getSettings();
        automationForm.reset(data.settings);
      } catch (error: any) {
        console.error('Failed to load automation settings:', error);
        toast.error('Failed to load automation settings');
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadSettings();
  }, [automationForm]);

  const onSubmit = async (data: AutomationFormData) => {
    setIsLoading(true);
    try {
      await automationAPI.updateSettings(data);
      toast.success('Automation settings updated successfully');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update automation settings';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
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

      {/* Quick presets */}
      <div className="rounded-xl border border-[#e0dfdc] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] space-y-3">
        <div>
          <p className="text-sm font-semibold text-[#191919]">Quick Presets</p>
          <p className="text-xs text-[#595959] mt-0.5">Apply a preset to fill all settings at once, then fine-tune as needed.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                automationForm.reset({ ...preset.values });
                toast.success(`"${preset.label}" preset applied — save to keep changes.`);
              }}
              className="text-left rounded-lg border border-[#dce6f1] bg-[#f8fafc] hover:bg-[#eef3f8] hover:border-[#0a66c2]/40 transition-colors p-3 space-y-1 group"
            >
              <p className="text-xs font-semibold text-[#191919] group-hover:text-[#0a66c2] transition-colors">{preset.label}</p>
              <p className="text-[11px] text-[#595959] leading-snug">{preset.description}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
                <span className="text-[10px] text-[#0a66c2] font-medium">{preset.values.maxDailyPosts}/day</span>
                <span className="text-[10px] text-[#595959]">·</span>
                <span className="text-[10px] text-[#595959]">{preset.values.delayBetweenPosts}min delay</span>
                <span className="text-[10px] text-[#595959]">·</span>
                <span className="text-[10px] text-[#595959]">{preset.values.retryAttempts} retries</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Posting Schedule card */}
      <div className="rounded-xl border border-[#e0dfdc] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#191919]">Posting Schedule</p>
            <p className="text-xs text-[#595959] mt-0.5">
              Define your posting days and time. Then use "Add to Queue" in the composer to auto-fill the next free slot.
            </p>
          </div>
          <Switch
            checked={queue.enabled}
            onCheckedChange={(v) => setQueue(q => ({ ...q, enabled: v }))}
          />
        </div>

        {queue.enabled && (
          <>
            {/* Day picker */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#374151]">Post on these days</p>
              <div className="flex gap-1.5 flex-wrap">
                {(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const).map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleQueueDay(idx)}
                    className={cn(
                      'h-9 w-12 rounded-lg border text-xs font-semibold transition-colors',
                      queue.days.includes(idx)
                        ? 'bg-[#0a66c2] border-[#0a66c2] text-white'
                        : 'bg-[#f8fafc] border-[#dce6f1] text-[#595959] hover:border-[#0a66c2]/40 hover:bg-[#eef3f8]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#374151]">Posting time</Label>
              <input
                type="time"
                value={queue.time}
                onChange={(e) => setQueue(q => ({ ...q, time: e.target.value }))}
                className="h-9 rounded-lg border border-[#dce6f1] bg-[#f8fafc] px-3 text-sm text-[#191919] focus:border-[#0a66c2] focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20"
              />
            </div>

            {/* Next slots preview */}
            {queue.days.length > 0 && (
              <div className="rounded-lg bg-[#eef3f8] border border-[#dce6f1] px-3 py-2.5 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0a66c2]">Upcoming slots</p>
                {(() => {
                  const [h, m] = queue.time.split(':').map(Number);
                  const slots: string[] = [];
                  for (let i = 0; i <= 28 && slots.length < 3; i++) {
                    const d = addDays(new Date(), i);
                    d.setHours(h, m, 0, 0);
                    if (d.getTime() > Date.now() + 5 * 60 * 1000 && queue.days.includes(d.getDay())) {
                      slots.push(format(d, "EEE, MMM d 'at' h:mm a"));
                    }
                  }
                  return slots.map((s, i) => (
                    <p key={i} className="text-xs text-[#595959]">· {s}</p>
                  ));
                })()}
              </div>
            )}
          </>
        )}

        <Button
          type="button"
          size="sm"
          onClick={saveQueue}
          className="!bg-[#0a66c2] !text-white hover:!bg-[#004182] !border-[#0a66c2]"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save schedule
        </Button>
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
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-5 w-5 animate-spin text-[#0a66c2]" />
              <span className="ml-2 text-sm text-[#595959]">Loading automation settings...</span>
            </div>
          ) : (
            <form onSubmit={automationForm.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
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

              <div className="space-y-2">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

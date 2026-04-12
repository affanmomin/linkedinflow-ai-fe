import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { postsAPI, type Post } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Calendar, Clock, RefreshCw, Save, AlertCircle } from 'lucide-react';

// ── Schema ────────────────────────────────────────────────────────────────────

const editSchema = z.object({
  content:  z.string().min(1, 'Content is required').max(3000, 'Max 3000 characters'),
  link_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EditFormData = z.infer<typeof editSchema>;

// ── Local datetime helper ─────────────────────────────────────────────────────

/** Returns "YYYY-MM-DDTHH:MM" in local time — what datetime-local inputs expect */
function toLocalDatetimeString(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function localDatetimeMin(): string {
  const d = new Date(Date.now() + 60_000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EditPostModalProps {
  post:          Post | null;
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  onSaved:       (updated: Post) => void;
}

export function EditPostModal({ post, open, onOpenChange, onSaved }: EditPostModalProps) {
  const [isSaving,     setIsSaving]     = useState(false);
  // "scheduled" | "draft" — what the user wants to save as
  const [saveMode,     setSaveMode]     = useState<'draft' | 'scheduled'>('draft');
  const [scheduledAt,  setScheduledAt]  = useState('');
  const [scheduleErr,  setScheduleErr]  = useState('');

  const charLimit = 3000;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({ resolver: zodResolver(editSchema) });

  const content  = watch('content') ?? '';
  const charLeft = charLimit - content.length;

  // Populate form whenever the post changes
  useEffect(() => {
    if (!post) return;
    reset({
      content:  post.content,
      link_url: post.link_url ?? '',
    });

    if (post.status === 'scheduled' && post.scheduled_at) {
      setSaveMode('scheduled');
      setScheduledAt(toLocalDatetimeString(post.scheduled_at));
    } else {
      setSaveMode('draft');
      setScheduledAt('');
    }
    setScheduleErr('');
  }, [post, reset]);

  const handleClose = () => {
    if (!isSaving) onOpenChange(false);
  };

  const onSubmit = async (data: EditFormData) => {
    if (!post) return;

    // Validate schedule time when saving as scheduled
    if (saveMode === 'scheduled') {
      if (!scheduledAt) {
        setScheduleErr('Please pick a date and time.');
        return;
      }
      if (new Date(scheduledAt) <= new Date()) {
        setScheduleErr('Scheduled time must be in the future.');
        return;
      }
    }
    setScheduleErr('');

    setIsSaving(true);
    try {
      const result = await postsAPI.updatePost(post.id, {
        content:      data.content.trim(),
        link_url:     data.link_url || null,
        post_type:    data.link_url ? 'link' : 'text',
        scheduled_at: saveMode === 'scheduled'
          ? new Date(scheduledAt).toISOString()
          : null,                              // null → backend clears schedule → draft
      });

      onSaved(result.post);
      toast.success(
        saveMode === 'scheduled'
          ? `Post rescheduled for ${new Date(scheduledAt).toLocaleString()}`
          : 'Post saved as draft.'
      );
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to save changes.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!post) return null;

  const isScheduled = post.status === 'scheduled';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="icon-container-sm">
              {isScheduled
                ? <Calendar className="h-3.5 w-3.5" />
                : <Clock     className="h-3.5 w-3.5" />}
            </div>
            Edit {isScheduled ? 'Scheduled' : 'Draft'} Post
          </DialogTitle>
          <DialogDescription>
            Changes are saved immediately. The post will {saveMode === 'scheduled' ? 'publish at the scheduled time' : 'remain as a draft'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-1">

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="ep-content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="ep-content"
              placeholder="What's happening in your professional world?"
              className="min-h-36 resize-none"
              {...register('content')}
            />
            <div className="flex items-center justify-between">
              <span className={cn(
                'text-xs',
                charLeft < 100 ? 'text-destructive' :
                charLeft < 200 ? 'text-amber-600 dark:text-amber-400' :
                'text-muted-foreground'
              )}>
                {content.length} / {charLimit}
              </span>
              {errors.content && (
                <span className="text-xs text-destructive">{errors.content.message}</span>
              )}
            </div>
          </div>

          {/* Link URL */}
          <div className="space-y-1.5">
            <Label htmlFor="ep-link">Link URL (optional)</Label>
            <Input
              id="ep-link"
              type="url"
              placeholder="https://example.com/article"
              {...register('link_url')}
            />
            {errors.link_url && (
              <p className="text-xs text-destructive">{errors.link_url.message}</p>
            )}
          </div>

          {/* Schedule / Draft mode toggle */}
          <div className="space-y-2">
            <Label>Save as</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSaveMode('draft')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                  saveMode === 'draft'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
                )}
              >
                <Clock className="h-4 w-4" />
                Draft
              </button>
              <button
                type="button"
                onClick={() => setSaveMode('scheduled')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                  saveMode === 'scheduled'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
                )}
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </button>
            </div>

            {/* Datetime picker — shown when schedule mode selected */}
            {saveMode === 'scheduled' && (
              <div className="space-y-1.5 pt-1">
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  min={localDatetimeMin()}
                  onChange={(e) => { setScheduledAt(e.target.value); setScheduleErr(''); }}
                  className="text-sm"
                />
                {scheduleErr && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {scheduleErr}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current schedule info */}
          {isScheduled && post.scheduled_at && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-3 py-2.5 text-sm">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-blue-700 dark:text-blue-300">
                Currently scheduled for{' '}
                <span className="font-medium">
                  {new Date(post.scheduled_at).toLocaleString()}
                </span>
              </span>
              <Badge variant="outline" className="ml-auto text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                scheduled
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saveMode === 'scheduled' ? 'Save & reschedule' : 'Save as draft'}
                </>
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  Calendar,
  Clock,
  RefreshCw,
  Save,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';

// ── Schema ────────────────────────────────────────────────────────────────────

const editSchema = z.object({
  content:  z.string().min(1, 'Content is required').max(3000, 'Max 3000 characters'),
  link_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EditFormData = z.infer<typeof editSchema>;

// ── Datetime helpers ──────────────────────────────────────────────────────────

/** ISO string → "YYYY-MM-DDTHH:MM" in local time (what datetime-local expects) */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** Minimum selectable datetime = 1 minute from now, in local time */
function localMin(): string {
  const d = new Date(Date.now() + 60_000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

// ── Diff helper — only include fields that actually changed ───────────────────

type UpdatePayload = Parameters<typeof postsAPI.updatePost>[1];

function buildPayload(
  data:        EditFormData,
  post:        Post,
  saveMode:    'draft' | 'scheduled',
  scheduledAt: string,
): UpdatePayload {
  const payload: UpdatePayload = {};

  // content
  const trimmed = data.content.trim();
  if (trimmed !== post.content) payload.content = trimmed;

  // link_url
  const newLink = data.link_url?.trim() || null;
  const oldLink = post.link_url          || null;
  if (newLink !== oldLink) payload.link_url = newLink;

  // post_type — derived from link_url, never touch image posts
  if (post.post_type !== 'image') {
    const newType = newLink ? 'link' : 'text';
    if (newType !== post.post_type) payload.post_type = newType;
  }

  // scheduled_at
  if (saveMode === 'scheduled') {
    const newIso = new Date(scheduledAt).toISOString();
    // Always include when: post was a draft (new schedule) OR the time changed
    if (post.status === 'draft' || newIso !== post.scheduled_at) {
      payload.scheduled_at = newIso;
    }
  } else {
    // Save as draft: clear the schedule if one exists
    if (post.scheduled_at) payload.scheduled_at = null;
  }

  return payload;
}

// ── Post-type badge ───────────────────────────────────────────────────────────

function PostTypeBadge({ type }: { type: Post['post_type'] }) {
  const map = {
    text:  { icon: FileText,  label: 'Text',  cls: 'bg-muted text-muted-foreground border-border' },
    link:  { icon: LinkIcon,  label: 'Link',  cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' },
    image: { icon: ImageIcon, label: 'Image', cls: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800' },
  } as const;
  const { icon: Icon, label, cls } = map[type] ?? map.text;
  return (
    <Badge variant="outline" className={cn('gap-1 text-[11px]', cls)}>
      <Icon className="h-3 w-3" />
      {label} post
    </Badge>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface EditPostModalProps {
  post:         Post | null;
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  onSaved:      (updated: Post) => void;
}

export function EditPostModal({ post, open, onOpenChange, onSaved }: EditPostModalProps) {
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveMode,    setSaveMode]    = useState<'draft' | 'scheduled'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduleErr, setScheduleErr] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({ resolver: zodResolver(editSchema) });

  const content  = watch('content') ?? '';
  const linkUrl  = watch('link_url') ?? '';

  // Derive the live post_type so the badge updates as the user types
  const livePostType: Post['post_type'] =
    post?.post_type === 'image' ? 'image' : linkUrl.trim() ? 'link' : 'text';

  // Populate form when post changes
  useEffect(() => {
    if (!post) return;
    reset({ content: post.content, link_url: post.link_url ?? '' });

    if (post.status === 'scheduled' && post.scheduled_at) {
      setSaveMode('scheduled');
      setScheduledAt(toLocalInput(post.scheduled_at));
    } else {
      setSaveMode('draft');
      setScheduledAt('');
    }
    setScheduleErr('');
  }, [post, reset]);

  const handleClose = () => { if (!isSaving) onOpenChange(false); };

  const onSubmit = async (data: EditFormData) => {
    if (!post) return;

    // Validate schedule time
    if (saveMode === 'scheduled') {
      if (!scheduledAt) { setScheduleErr('Please pick a date and time.'); return; }
      if (new Date(scheduledAt) <= new Date()) {
        setScheduleErr('Scheduled time must be in the future.'); return;
      }
    }
    setScheduleErr('');

    // Build minimal diff payload
    const payload = buildPayload(data, post, saveMode, scheduledAt);

    if (Object.keys(payload).length === 0) {
      toast.info('No changes to save.');
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await postsAPI.updatePost(post.id, payload);
      onSaved(result.post);
      toast.success(
        saveMode === 'scheduled'
          ? `Post rescheduled for ${new Date(scheduledAt).toLocaleString()}`
          : payload.scheduled_at === null
            ? 'Schedule cleared — post saved as draft.'
            : 'Post saved.',
      );
      onOpenChange(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to save changes.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!post) return null;

  const isScheduled   = post.status === 'scheduled';
  const isImagePost   = post.post_type === 'image';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="icon-container-sm">
              {isScheduled ? <Calendar className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            </div>
            Edit {isScheduled ? 'Scheduled' : 'Draft'} Post
          </DialogTitle>
          <DialogDescription>
            Only changed fields are sent. The post will{' '}
            {saveMode === 'scheduled' ? 'publish at the scheduled time' : 'remain as a draft'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-1 space-y-5">

          {/* ── Current schedule banner ── */}
          {isScheduled && post.scheduled_at && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-3 py-2.5 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">
                Scheduled for{' '}
                <span className="font-semibold">
                  {new Date(post.scheduled_at).toLocaleString()}
                </span>
              </span>
            </div>
          )}

          {/* ── Content ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="ep-content">
                Content <span className="text-destructive">*</span>
              </Label>
              {/* Live post-type badge */}
              <PostTypeBadge type={livePostType} />
            </div>
            <Textarea
              id="ep-content"
              placeholder="What's happening in your professional world?"
              className="min-h-36 resize-none"
              {...register('content')}
            />
            <div className="flex items-center justify-between">
              <span className={cn(
                'text-xs',
                content.length > 2900 ? 'text-destructive' :
                content.length > 2800 ? 'text-amber-600 dark:text-amber-400' :
                'text-muted-foreground',
              )}>
                {content.length} / 3000
              </span>
              {errors.content && (
                <span className="text-xs text-destructive">{errors.content.message}</span>
              )}
            </div>
          </div>

          {/* ── Link URL (hidden for image posts) ── */}
          {!isImagePost && (
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
              <p className="text-[11px] text-muted-foreground">
                Adding a URL changes the post type to <strong>Link</strong>. Removing it reverts to <strong>Text</strong>.
              </p>
            </div>
          )}

          {/* ── Image post notice ── */}
          {isImagePost && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>This is an image post. The attached image cannot be changed here.</span>
            </div>
          )}

          {/* ── Save as: Draft / Schedule ── */}
          <div className="space-y-2">
            <Label>Save as</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { mode: 'draft',     icon: Clock,    label: 'Draft' },
                  { mode: 'scheduled', icon: Calendar, label: 'Schedule' },
                ] as const
              ).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setSaveMode(mode); setScheduleErr(''); }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                    saveMode === mode
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Datetime picker */}
            {saveMode === 'scheduled' && (
              <div className="space-y-1.5 pt-1">
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  min={localMin()}
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

            {/* Clear-schedule explanation */}
            {saveMode === 'draft' && isScheduled && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Saving as Draft will clear the existing schedule and set status back to draft.
              </p>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? (
                <><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
              ) : (
                <><Save className="mr-1.5 h-3.5 w-3.5" />
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

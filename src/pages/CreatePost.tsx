import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Image as ImageIcon,
  Send,
  Eye,
  X,
  Globe,
  Clock,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const postSchema = z.object({
  content:     z.string().min(1, 'Content is required').max(3000, 'Content must be under 3000 characters'),
  link_url:    z.string().url('Must be a valid URL').optional().or(z.literal('')),
  publish_now: z.boolean().default(false),
  schedule:    z.boolean().default(false),
  useAI:       z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

const AI_SUGGESTIONS = [
  '🚀 Excited to share our latest innovation in the LinkedIn automation space! The future of professional networking is here.',
  '💡 Just finished an amazing project combining AI and social media automation. Can\'t wait to see the impact!',
  '🎯 Consistency in LinkedIn posting can increase your reach by up to 300%. Here\'s how we\'re making it easier...',
];

export function CreatePost() {
  const [preview, setPreview] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { addPost, linkedInStatus } = useLinkedInStore();
  const isLinkedInConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } =
    useForm<PostFormData>({
      resolver: zodResolver(postSchema),
      defaultValues: { publish_now: false, useAI: false },
    });

  const content    = watch('content');
  const useAI      = watch('useAI');
  const publishNow = watch('publish_now');
  const schedule   = watch('schedule');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    },
  });

  const readFileAsBase64 = (file: File): Promise<{ base64: string; imageType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const [meta, base64] = dataUrl.split(',');
        const imageType = meta.split(':')[1].split(';')[0];
        resolve({ base64, imageType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onSubmit = async (data: PostFormData) => {
    if (data.schedule && !scheduledAt) {
      toast.error('Please pick a date and time to schedule the post.');
      return;
    }
    if (data.schedule && new Date(scheduledAt) <= new Date()) {
      toast.error('Scheduled time must be in the future.');
      return;
    }

    try {
      const postType = data.link_url ? 'link' : uploadedImage ? 'image' : 'text';

      let image_base64: string | undefined;
      let image_type: string | undefined;
      if (uploadedImage) {
        const result = await readFileAsBase64(uploadedImage);
        image_base64 = result.base64;
        image_type   = result.imageType;
      }

      const response = await postsAPI.createPost({
        content:      data.content.trim(),
        post_type:    postType,
        link_url:     data.link_url || undefined,
        publish_now:  data.schedule ? false : data.publish_now,
        scheduled_at: data.schedule ? new Date(scheduledAt).toISOString() : undefined,
        image_base64,
        image_type,
      });

      addPost(response.post);

      if (data.schedule) {
        toast.success(`Post scheduled for ${new Date(scheduledAt).toLocaleString()}`);
      } else if (data.publish_now) {
        toast.success('Post published to LinkedIn!');
      } else {
        toast.success('Post saved as draft.');
      }

      reset();
      setUploadedImage(null);
      setImagePreview(null);
      setScheduledAt('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create post');
    }
  };

  const charCount    = content?.length || 0;
  const charWarning  = charCount > 2800;
  const charDanger   = charCount > 2900;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Post</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Craft and publish content to LinkedIn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('text-xs', isLinkedInConnected ? 'badge-success' : 'bg-muted text-muted-foreground')}
          >
            {isLinkedInConnected
              ? <><CheckCircle className="mr-1 h-3 w-3" />LinkedIn connected</>
              : <><AlertCircle className="mr-1 h-3 w-3" />Not connected</>}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* LinkedIn connection alert */}
      {!isLinkedInConnected && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">LinkedIn not connected</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Connect your LinkedIn account to publish posts directly.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/linkedin-vault')}
            className="border-amber-300 dark:border-amber-700 shrink-0">
            Connect
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="icon-container-sm">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              Post Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* AI toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">AI Generation</p>
                    <p className="text-xs text-muted-foreground">Generate post content with AI</p>
                  </div>
                </div>
                <Switch
                  id="ai-toggle"
                  checked={useAI}
                  onCheckedChange={(v) => setValue('useAI', v)}
                />
              </div>

              {useAI && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setValue('content', AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)]);
                    toast.success('AI content generated!');
                  }}
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Generate suggestion
                </Button>
              )}

              {/* Content textarea */}
              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-sm font-medium">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="What's happening in your professional world?"
                  className="min-h-36 resize-none"
                  {...register('content')}
                />
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-xs',
                    charDanger ? 'text-destructive' :
                    charWarning ? 'text-amber-600 dark:text-amber-400' :
                    'text-muted-foreground'
                  )}>
                    {charCount} / 3000
                  </span>
                  {errors.content && (
                    <span className="text-xs text-destructive">{errors.content.message}</span>
                  )}
                </div>
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Image (optional)</Label>
                {!uploadedImage ? (
                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <input {...getInputProps()} />
                    <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview!}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => { setUploadedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div className="space-y-1.5">
                <Label htmlFor="link_url" className="text-sm font-medium">Link URL (optional)</Label>
                <Input
                  id="link_url"
                  type="url"
                  placeholder="https://example.com/article"
                  {...register('link_url')}
                />
                {errors.link_url && (
                  <p className="text-xs text-destructive">{errors.link_url.message}</p>
                )}
              </div>

              {/* Publish / Schedule options */}
              <div className="space-y-2">
                {/* Publish now */}
                <div className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors',
                  schedule ? 'opacity-40 pointer-events-none' : 'border-border bg-muted/30'
                )}>
                  <div className="flex items-center gap-2.5">
                    <Send className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Publish now</p>
                      <p className="text-xs text-muted-foreground">Post to LinkedIn immediately</p>
                    </div>
                  </div>
                  <Switch
                    id="publish-toggle"
                    checked={publishNow}
                    onCheckedChange={(v) => { setValue('publish_now', v); if (v) setValue('schedule', false); }}
                    disabled={!isLinkedInConnected || schedule}
                  />
                </div>

                {/* Schedule */}
                <div className={cn(
                  'rounded-lg border transition-colors',
                  publishNow ? 'opacity-40 pointer-events-none border-border bg-muted/30' : 'border-border bg-muted/30'
                )}>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Schedule for later</p>
                        <p className="text-xs text-muted-foreground">Pick a date and time to post</p>
                      </div>
                    </div>
                    <Switch
                      id="schedule-toggle"
                      checked={schedule}
                      onCheckedChange={(v) => { setValue('schedule', v); if (v) setValue('publish_now', false); }}
                      disabled={publishNow}
                    />
                  </div>

                  {schedule && (
                    <div className="px-3 pb-3">
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        min={(() => {
                          const d = new Date(Date.now() + 60_000);
                          return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
                            .toISOString()
                            .slice(0, 16);
                        })()}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                {!isLinkedInConnected && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Connect LinkedIn to publish posts. You can still schedule posts now — they'll publish once connected.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Creating…</span>
                  </div>
                ) : (
                  <>
                    {schedule
                      ? <><Calendar className="mr-1.5 h-4 w-4" />Schedule post</>
                      : publishNow
                      ? <><Send className="mr-1.5 h-4 w-4" />Publish now</>
                      : <><Clock className="mr-1.5 h-4 w-4" />Save as draft</>}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="icon-container-sm">
                <Eye className="h-3.5 w-3.5" />
              </div>
              Post Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* LinkedIn-style post mockup */}
            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">Y</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Your Name</p>
                  <p className="text-xs text-muted-foreground">Senior Professional</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{publishNow ? 'Now' : 'Draft'}</span>
                    <Globe className="h-3 w-3 ml-0.5" />
                  </div>
                </div>
              </div>

              {content ? (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Your post content will appear here…</p>
              )}

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Post preview"
                  className="mt-3 w-full rounded-lg border border-border object-cover max-h-64"
                />
              )}

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="hover:text-foreground cursor-pointer">👍 Like</span>
                <span className="hover:text-foreground cursor-pointer">💬 Comment</span>
                <span className="hover:text-foreground cursor-pointer">🔄 Repost</span>
              </div>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Est. reach', value: '~2.5K' },
                { label: 'Engagement', value: '~3.2%' },
                { label: 'Impressions', value: '~4.1K' },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

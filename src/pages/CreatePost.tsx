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
  Clock,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Calendar,
  Link as LinkIcon,
  Video,
  FileText,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LinkedInPreview } from '@/components/posts/LinkedInPreview';
import { PageTransition } from '@/components/ui/magic/page-transition';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(3000, 'Content must be under 3000 characters'),
  link_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  publish_now: z.boolean().default(false),
  schedule: z.boolean().default(false),
  useAI: z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

const AI_SUGGESTIONS = [
  '🚀 Excited to share our latest innovation in the LinkedIn automation space! The future of professional networking is here.',
  '💡 Just finished an amazing project combining AI and social media automation. Can\'t wait to see the impact!',
  '🎯 Consistency in LinkedIn posting can increase your reach by up to 300%. Here\'s how we\'re making it easier...',
];

type MediaType = 'text' | 'image' | 'link' | 'video';

const mediaTypes: { type: MediaType; icon: React.ElementType; label: string }[] = [
  { type: 'text', icon: FileText, label: 'Text' },
  { type: 'image', icon: ImageIcon, label: 'Image' },
  { type: 'link', icon: LinkIcon, label: 'Link' },
  { type: 'video', icon: Video, label: 'Video' },
];

export function CreatePost() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('text');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const { addPost, linkedInStatus } = useLinkedInStore();
  const isLinkedInConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } =
    useForm<PostFormData>({
      resolver: zodResolver(postSchema),
      defaultValues: { publish_now: false, useAI: false },
    });

  const content = watch('content');
  const useAI = watch('useAI');
  const publishNow = watch('publish_now');
  const schedule = watch('schedule');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      clearVideo();
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    },
  });

  const clearVideo = () => {
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    setUploadedVideo(null);
    setVideoObjectUrl(null);
  };

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive,
  } = useDropzone({
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
    maxSize: 200 * 1024 * 1024, // 200 MB
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        toast.error('File rejected. Use an .mp4, .mov, .avi, .webm or .mkv file under 200 MB.');
        return;
      }
      const file = accepted[0];
      if (!file) return;
      setUploadedImage(null);
      setImagePreview(null);
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
      const url = URL.createObjectURL(file);
      setUploadedVideo(file);
      setVideoObjectUrl(url);
    },
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
    if (mediaType === 'video' && !uploadedVideo && !data.video_url) {
      toast.error('Upload a video file or enter a public video URL.');
      return;
    }
    if (mediaType === 'image' && !uploadedImage) {
      toast.error('Please upload an image file.');
      return;
    }

    try {
      const response = await postsAPI.createPost({
        content: data.content.trim(),
        post_type: mediaType,
        link_url: mediaType === 'link' ? (data.link_url || undefined) : undefined,
        video_url: mediaType === 'video' && !uploadedVideo ? (data.video_url || undefined) : undefined,
        image_file: mediaType === 'image' ? (uploadedImage || undefined) : undefined,
        video_file: mediaType === 'video' && uploadedVideo ? uploadedVideo : undefined,
        publish_now: data.schedule ? false : data.publish_now,
        scheduled_at: data.schedule ? new Date(scheduledAt).toISOString() : undefined,
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
      setMediaType('text');
      clearVideo();
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create post';
      toast.error(msg);
    }
  };

  const charCount = content?.length || 0;
  const charWarning = charCount > 2800;
  const charDanger = charCount > 2900;

  const linkUrl = watch('link_url');
  const videoUrl = watch('video_url');

  return (
    <PageTransition>
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

                {/* Post type selector */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Post type</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {mediaTypes.map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setMediaType(type);
                          if (type !== 'image') { setUploadedImage(null); setImagePreview(null); }
                          if (type !== 'video') { clearVideo(); }
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors',
                          mediaType === type
                            ? 'border-primary bg-primary/8 text-primary'
                            : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image upload — shown only for image type */}
                {mediaType === 'image' && (
                  <div className="space-y-1.5">
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
                )}

                {/* Link URL — shown only for link type */}
                {mediaType === 'link' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="link_url" className="text-sm font-medium">Link URL</Label>
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
                )}

                {/* Video — drag-and-drop for preview + required public URL */}
                {mediaType === 'video' && (
                  <div className="space-y-3">
                    {/* Drop zone / local preview */}
                    {!uploadedVideo ? (
                      <div
                        {...getVideoRootProps()}
                        className={cn(
                          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                          isVideoDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50',
                        )}
                      >
                        <input {...getVideoInputProps()} />
                        <Video className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {isVideoDragActive ? 'Drop video here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          MP4, MOV, AVI, WebM up to 200 MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden border border-border bg-black">
                          <video
                            src={videoObjectUrl!}
                            controls
                            className="w-full max-h-48 object-contain"
                            preload="metadata"
                          />
                          <button
                            type="button"
                            onClick={clearVideo}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {uploadedVideo.name} · {(uploadedVideo.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    )}

                    {/* URL field — only shown when no file has been dropped */}
                    {!uploadedVideo && (
                      <div className="space-y-1.5">
                        <Label htmlFor="video_url" className="text-sm font-medium">
                          Or enter a public video URL
                        </Label>
                        <Input
                          id="video_url"
                          type="url"
                          placeholder="https://example.com/video.mp4"
                          {...register('video_url')}
                        />
                        {errors.video_url && (
                          <p className="text-xs text-destructive">{errors.video_url.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="icon-container-sm">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                  LinkedIn Preview
                  <span className="text-xs font-normal text-muted-foreground ml-1">Live</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content ? (
                  <LinkedInPreview
                    content={content}
                    linkUrl={mediaType === 'link' ? (linkUrl || undefined) : undefined}
                    postType={mediaType}
                    imagePreviewUrl={mediaType === 'image' ? (imagePreview || undefined) : undefined}
                    videoUrl={mediaType === 'video' ? (videoObjectUrl ?? videoUrl ?? undefined) : undefined}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">Start typing to see your LinkedIn post preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Character count info */}
            {content && (
              <div className={cn(
                'flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs',
                charDanger ? 'border-destructive/40 bg-destructive/5 text-destructive' :
                  charWarning ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' :
                    'border-border bg-muted/30 text-muted-foreground',
              )}>
                <span>{charCount} characters used</span>
                <span>{3000 - charCount} remaining</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

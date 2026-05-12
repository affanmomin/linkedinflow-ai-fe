import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
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
  ListOrdered,
  BookMarked,
  Trash2,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { loadQueueSettings, getNextQueueSlot } from '@/lib/queue';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LinkedInPreview } from '@/components/posts/LinkedInPreview';
import { loadTemplates, deleteTemplate, type PostTemplate } from '@/lib/templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PostAnalyzer } from '@/components/posts/PostAnalyzer';
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
  const [searchParams] = useSearchParams();
  const scheduledDateParam = searchParams.get('scheduled_date');
  const prefillContent = (() => {
    const fromSession = searchParams.get('from') === 'interview'
      ? sessionStorage.getItem('linkedinflow_composer_prefill')
      : null;
    if (fromSession) {
      sessionStorage.removeItem('linkedinflow_composer_prefill');
      return fromSession;
    }
    return searchParams.get('prefill');
  })();

  const DRAFT_KEY = 'linkedinflow_draft_post';
  const [draftSaved, setDraftSaved] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>(
    scheduledDateParam ? `${scheduledDateParam}T12:00` : ''
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('text');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const { addPost, linkedInStatus, posts } = useLinkedInStore();
  const isLinkedInConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);
  const navigate = useNavigate();

  const queueSettings = useMemo(() => loadQueueSettings(), []);
  const nextQueueSlot = useMemo(
    () => getNextQueueSlot(queueSettings, posts),
    [queueSettings, posts]
  );
  const [useQueue, setUseQueue] = useState(false);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<PostTemplate[]>([]);

  const openTemplates = () => {
    setTemplates(loadTemplates());
    setTemplatesOpen(true);
  };

  const applyTemplate = (tpl: PostTemplate) => {
    setValue('content', tpl.content);
    setMediaType(tpl.post_type as MediaType);
    setTemplatesOpen(false);
    toast.success('Template applied.');
  };

  const removeTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } =
    useForm<PostFormData>({
      resolver: zodResolver(postSchema),
      defaultValues: {
        publish_now: false,
        useAI: false,
        schedule: scheduledDateParam ? true : false,
        content: prefillContent ? decodeURIComponent(prefillContent) : '',
      },
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

  // Check for saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.content && parsed.content.length > 0) {
          setShowRestoreBanner(true);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Debounced auto-save draft
  useEffect(() => {
    if (!content || content.length === 0) return;

    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);

    draftSaveTimer.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, mediaType, savedAt: new Date().toISOString() }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1500);

    return () => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [content, mediaType]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.content) setValue('content', parsed.content);
      if (parsed.mediaType) setMediaType(parsed.mediaType);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
    setShowRestoreBanner(false);
  };

  const dismissDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowRestoreBanner(false);
  };

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
      localStorage.removeItem(DRAFT_KEY);
      setUploadedImage(null);
      setImagePreview(null);
      setScheduledAt('');
      setMediaType('text');
      setUseQueue(false);
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
      <div className="animate-fade-in">
        {/* LinkedIn Connection Badge */}
        <div className="mb-4 flex justify-end">
          <Badge
            variant="outline"
            className={cn('text-xs px-3 py-1 whitespace-nowrap', isLinkedInConnected ? 'badge-success' : 'bg-muted text-muted-foreground')}
          >
            {isLinkedInConnected
              ? <><CheckCircle className="mr-1.5 h-3 w-3" />Connected</>
              : <><AlertCircle className="mr-1.5 h-3 w-3" />Not connected</>}
          </Badge>
        </div>

        {/* LinkedIn connection alert - Compact */}
        {!isLinkedInConnected && (
          <div className="mb-3 flex items-center gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="flex-1 text-xs font-medium text-amber-800 dark:text-amber-300">
              Connect LinkedIn to publish • You can schedule now
            </p>
            <Button size="sm" variant="default" onClick={() => navigate('/dashboard/linkedin-vault')}
              className="shrink-0 h-7 text-xs">
              Connect
            </Button>
          </div>
        )}

        {showRestoreBanner && (
          <div className="mb-3 flex items-center gap-2 p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="flex-1 text-xs font-medium text-blue-800 dark:text-blue-300">
              You have an unsaved draft. Restore it?
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:underline mr-2"
              onClick={restoreDraft}
            >
              Restore
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={dismissDraft}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Post Analysis — Full Width at Top */}
        {import.meta.env.VITE_POST_ANALYZER_ENABLED === 'true' && content && content.length >= 10 && (
          <div className="mb-6 rounded-lg border border-border/50 bg-card p-4">
            <PostAnalyzer
              content={content}
              postType={mediaType}
              onTimeSelected={(hour, _day) => {
                const now = new Date();
                const targetDate = new Date(now);
                targetDate.setHours(hour, 0, 0, 0);

                // If target time has already passed today, schedule for tomorrow
                if (targetDate <= now) {
                  targetDate.setDate(targetDate.getDate() + 1);
                }

                const isoString = targetDate.toISOString().slice(0, 16);
                setScheduledAt(isoString);
                setValue('schedule', true);
                setValue('publish_now', false);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm h-full">
              <CardContent className="p-5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* AI toggle - Compact */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs font-semibold text-foreground">AI Generator</p>
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

                {/* Content textarea - Compact */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="content" className="text-xs font-semibold">
                        Your Message <span className="text-destructive">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={openTemplates}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <BookMarked className="h-3 w-3" />
                        Templates
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {draftSaved && (
                        <span className="text-[11px] text-green-600 font-medium">Draft saved</span>
                      )}
                      <span className={cn(
                        'text-xs',
                        charDanger ? 'text-destructive font-bold' :
                          charWarning ? 'text-amber-600 dark:text-amber-400 font-medium' :
                            'text-muted-foreground'
                      )}>
                        {charCount}/3000
                      </span>
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="What's on your mind? 💡"
                    className="min-h-24 resize-none text-sm"
                    {...register('content')}
                  />
                  {/* Character count bar */}
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        charDanger ? 'bg-destructive' :
                          charWarning ? 'bg-amber-500' :
                            'bg-green-500'
                      )}
                      style={{ width: `${Math.min(100, (charCount / 3000) * 100)}%` }}
                    />
                  </div>
                  {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                </div>

                {/* Post type selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Post Type</Label>
                  <div className="grid grid-cols-4 gap-2">
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
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-semibold transition-all',
                          mediaType === type
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                            : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:border-border/80',
                        )}
                      >
                        <Icon className="h-5 w-5" />
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
                          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
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
                          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
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
                        <div className="relative rounded-lg overflow-hidden border border-border bg-[#eef3f8]">
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

                {/* Publish / Schedule Section */}
                <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/30">
                  <h3 className="text-sm font-semibold">Publishing Options</h3>

                  <div className="space-y-2">
                    {/* Publish now option */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer transition-all hover:bg-muted/50"
                      style={{
                        backgroundColor: publishNow && !useQueue ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                        borderColor: publishNow && !useQueue ? 'hsl(var(--primary))' : undefined,
                      }}>
                      <input
                        type="radio"
                        checked={publishNow && !schedule && !useQueue}
                        onChange={() => { setValue('publish_now', true); setValue('schedule', false); setUseQueue(false); }}
                        disabled={!isLinkedInConnected}
                        className="h-4 w-4"
                      />
                      <Send className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Publish now</p>
                        <p className="text-xs text-muted-foreground">Post immediately to LinkedIn</p>
                      </div>
                    </label>

                    {/* Schedule option */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer transition-all hover:bg-muted/50"
                      style={{
                        backgroundColor: schedule && !useQueue ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                        borderColor: schedule && !useQueue ? 'hsl(var(--primary))' : undefined,
                      }}>
                      <input
                        type="radio"
                        checked={schedule && !useQueue}
                        onChange={() => { setValue('schedule', true); setValue('publish_now', false); setUseQueue(false); }}
                        className="h-4 w-4"
                      />
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Schedule for later</p>
                        <p className="text-xs text-muted-foreground">Pick a date and time</p>
                      </div>
                    </label>

                    {/* Save as draft option */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer transition-all hover:bg-muted/50"
                      style={{
                        backgroundColor: !publishNow && !schedule && !useQueue ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                        borderColor: !publishNow && !schedule && !useQueue ? 'hsl(var(--primary))' : undefined,
                      }}>
                      <input
                        type="radio"
                        checked={!publishNow && !schedule && !useQueue}
                        onChange={() => { setValue('publish_now', false); setValue('schedule', false); setUseQueue(false); }}
                        className="h-4 w-4"
                      />
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Save as draft</p>
                        <p className="text-xs text-muted-foreground">Edit later</p>
                      </div>
                    </label>

                    {/* Queue option — only show if queue is enabled and has a next slot */}
                    {queueSettings.enabled && nextQueueSlot && (
                      <label
                        className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer transition-all hover:bg-muted/50"
                        style={{
                          backgroundColor: useQueue ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                          borderColor: useQueue ? 'hsl(var(--primary))' : undefined,
                        }}
                      >
                        <input
                          type="radio"
                          checked={useQueue}
                          onChange={() => {
                            if (nextQueueSlot) {
                              const local = new Date(nextQueueSlot.getTime() - nextQueueSlot.getTimezoneOffset() * 60000);
                              setScheduledAt(local.toISOString().slice(0, 16));
                              setValue('schedule', true);
                              setValue('publish_now', false);
                            }
                            setUseQueue(true);
                          }}
                          className="h-4 w-4"
                        />
                        <ListOrdered className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Add to queue</p>
                          <p className="text-xs text-muted-foreground">
                            Next slot: {format(nextQueueSlot, "EEE MMM d 'at' h:mm a")}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Schedule datetime picker */}
                  {schedule && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <Label htmlFor="scheduledAt" className="text-xs font-semibold">
                        Pick a date and time
                      </Label>
                      <Input
                        id="scheduledAt"
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

                  {!isLinkedInConnected && publishNow && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded p-2">
                      Connect LinkedIn to publish posts. You can still schedule posts now — they'll publish once connected.
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Creating…</span>
                    </div>
                  ) : (
                    <>
                      {useQueue
                        ? <><ListOrdered className="mr-2 h-5 w-5" />Add to Queue</>
                        : schedule
                          ? <><Calendar className="mr-2 h-5 w-5" />Schedule Post</>
                          : publishNow
                            ? <><Send className="mr-2 h-5 w-5" />Publish Now</>
                            : <><Clock className="mr-2 h-5 w-5" />Save as Draft</>}
                    </>
                  )}
                </Button>
              </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Column - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* LinkedIn Preview Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">LinkedIn Preview</p>
                      <p className="text-xs text-muted-foreground">Real-time preview</p>
                    </div>
                  </div>

                  {content ? (
                    <LinkedInPreview
                      content={content}
                      linkUrl={mediaType === 'link' ? (linkUrl || undefined) : undefined}
                      postType={mediaType}
                      imagePreviewUrl={mediaType === 'image' ? (imagePreview || undefined) : undefined}
                      videoUrl={mediaType === 'video' ? (videoObjectUrl ?? videoUrl ?? undefined) : undefined}
                    />
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-border p-8 text-center bg-muted/30">
                      <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium text-muted-foreground">Start typing to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Post Stats Card */}
              {content && (
                <div className="p-4 rounded-xl border border-border/50 bg-muted/30 space-y-3">
                  <h4 className="text-xs font-semibold text-foreground">Post Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background border border-border/50">
                      <p className="text-xs text-muted-foreground">Characters</p>
                      <p className={cn(
                        'text-lg font-bold',
                        charDanger ? 'text-destructive' :
                          charWarning ? 'text-amber-600 dark:text-amber-400' :
                            'text-green-600 dark:text-green-400'
                      )}>
                        {charCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border/50">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-lg font-bold text-muted-foreground">
                        {3000 - charCount}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        charDanger ? 'bg-destructive' :
                          charWarning ? 'bg-amber-500' :
                            'bg-green-500'
                      )}
                      style={{ width: `${Math.min(100, (charCount / 3000) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Templates dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Saved templates</DialogTitle>
          </DialogHeader>
          {templates.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <BookMarked className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm text-muted-foreground">No templates saved yet.</p>
              <p className="text-xs text-muted-foreground">Save any post as a template from the Posts page.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {templates.map(tpl => (
                <div key={tpl.id} className="rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{tpl.name}</p>
                    <button
                      type="button"
                      onClick={() => removeTemplate(tpl.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {tpl.content}
                  </p>
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => applyTemplate(tpl)}>
                    Use this template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

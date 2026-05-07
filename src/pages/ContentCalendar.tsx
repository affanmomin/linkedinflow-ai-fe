import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isPast,
  parseISO,
  startOfDay,
  isThisWeek,
  isThisMonth,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  X,
  Pencil,
  ExternalLink,
  LayoutList,
  Trello,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI, type Post } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { NumberTicker } from '@/components/ui/magic/number-ticker';
import { LinkedInPreview } from '@/components/posts/LinkedInPreview';
import { EditPostModal } from '@/components/posts/EditPostModal';
import { PageTransition } from '@/components/ui/magic/page-transition';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'month' | 'list' | 'board';

// ── Status colours ────────────────────────────────────────────────────────────

const chipStyle: Record<Post['status'], string> = {
  draft: 'bg-amber-100  text-amber-800  border-amber-200  dark:bg-amber-900/40  dark:text-amber-300  dark:border-amber-700',
  scheduled: 'bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-900/40   dark:text-blue-300   dark:border-blue-700',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
  failed: 'bg-rose-100   text-rose-800   border-rose-200   dark:bg-rose-900/40   dark:text-rose-300   dark:border-rose-700',
};

const dotStyle: Record<Post['status'], string> = {
  draft: 'bg-amber-400',
  scheduled: 'bg-blue-500',
  published: 'bg-emerald-500',
  failed: 'bg-rose-500',
};

const statusLabel: Record<Post['status'], string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
};

const statusIcon: Record<Post['status'], React.ElementType> = {
  draft: Clock,
  scheduled: Calendar,
  published: CheckCircle,
  failed: XCircle,
};

// ── Helper: which calendar date does a post belong to? ───────────────────────

function postDate(post: Post): Date | null {
  if (post.scheduled_at) return parseISO(post.scheduled_at);
  if (post.published_at) return parseISO(post.published_at);
  return null;
}

function resolveImagePreview(post: Post): string | undefined {
  const postAny = post as Post & {
    imageBase64?: string;
    imageUrl?: string;
    image?: string;
  };

  const candidate =
    post.image_url ??
    post.image_base64 ??
    postAny.imageBase64 ??
    postAny.imageUrl ??
    postAny.image;

  if (!candidate) return undefined;
  if (candidate.startsWith('data:')) return candidate;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    return `${apiBase}${candidate}`;
  }

  // If backend returns raw base64, convert it to a data URL for preview rendering.
  const imageType = post.image_type ?? 'image/jpeg';
  return `data:${imageType};base64,${candidate}`;
}

function resolveVideoPreview(post: Post): string | undefined {
  const postAny = post as Post & { videoUrl?: string; video?: string };
  const candidate = post.video_url ?? postAny.videoUrl ?? postAny.video;
  if (!candidate) return undefined;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    return `${apiBase}${candidate}`;
  }
  return candidate;
}

function resolvePreviewType(post: Post): Post['post_type'] {
  if (post.has_video) return 'video';
  if (post.has_image) return 'image';
  if (resolveVideoPreview(post)) return 'video';
  if (resolveImagePreview(post)) return 'image';
  if (post.link_url) return 'link';
  return post.post_type;
}

// ── Draggable post chip (Month view) ─────────────────────────────────────────

function PostChip({
  post,
  onClick,
  overlay = false,
}: {
  post: Post;
  onClick?: () => void;
  overlay?: boolean;
}) {
  const isDraggable = post.status === 'draft' || post.status === 'scheduled';
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(isDraggable ? { ...attributes, ...listeners } : {})}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={post.content}
      className={cn(
        'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight cursor-pointer select-none',
        'transition-all duration-150',
        chipStyle[post.status],
        isDragging && !overlay && 'opacity-30',
        overlay && 'shadow-xl scale-105 rotate-1',
        isDraggable && 'hover:shadow-sm active:scale-[0.97]',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotStyle[post.status])} />
      <span className="truncate max-w-[90px]">{post.content}</span>
    </div>
  );
}

// ── Droppable calendar cell (Month view) ──────────────────────────────────────

function CalendarCell({
  date,
  posts,
  currentMonth,
  onPostClick,
}: {
  date: Date;
  posts: Post[];
  currentMonth: Date;
  onPostClick: (post: Post) => void;
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  const inMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const past = isPast(startOfDay(date)) && !today;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative min-h-[90px] rounded-lg border p-1.5 transition-all duration-150',
        inMonth ? 'bg-card border-border' : 'bg-muted/20 border-border/40',
        past && inMonth && 'opacity-60',
        today && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
        isOver && 'bg-primary/5 border-primary/40 scale-[1.01]',
      )}
    >
      <div className={cn(
        'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
        today ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
        !inMonth && 'opacity-40',
      )}>
        {format(date, 'd')}
      </div>
      <div className="space-y-0.5">
        {posts.slice(0, 3).map(post => (
          <PostChip key={post.id} post={post} onClick={() => onPostClick(post)} />
        ))}
        {posts.length > 3 && (
          <p className="pl-1 text-[10px] text-muted-foreground">+{posts.length - 3} more</p>
        )}
      </div>
      {isOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg">
          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Drop here</div>
        </div>
      )}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({
  posts,
  onPostClick,
}: {
  posts: Post[];
  onPostClick: (post: Post) => void;
}) {
  // Group: upcoming / this week / this month / earlier / unscheduled
  const grouped = useMemo(() => {
    const sorted = [...posts].sort((a, b) => {
      const da = postDate(a)?.getTime() ?? 0;
      const db = postDate(b)?.getTime() ?? 0;
      return db - da; // newest first
    });

    const groups: { label: string; posts: Post[] }[] = [
      { label: 'Scheduled', posts: [] },
      { label: 'This week', posts: [] },
      { label: 'This month', posts: [] },
      { label: 'Published', posts: [] },
      { label: 'Drafts (unscheduled)', posts: [] },
      { label: 'Failed', posts: [] },
    ];

    sorted.forEach(p => {
      const d = postDate(p);
      if (p.status === 'failed') { groups[5].posts.push(p); return; }
      if (p.status === 'draft' && !p.scheduled_at) { groups[4].posts.push(p); return; }
      if (p.status === 'scheduled') { groups[0].posts.push(p); return; }
      if (p.status === 'published') {
        if (d && isThisWeek(d)) { groups[1].posts.push(p); return; }
        if (d && isThisMonth(d)) { groups[2].posts.push(p); return; }
        groups[3].posts.push(p); return;
      }
    });

    return groups.filter(g => g.posts.length > 0);
  }, [posts]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="icon-container"><FileText className="h-5 w-5" /></div>
        <p className="text-sm font-medium text-foreground">No posts yet</p>
        <p className="text-xs text-muted-foreground">Create your first post to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((group, gi) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">{group.label}</h3>
          <div className="space-y-2">
            {group.posts.map((post, pi) => {
              const d = postDate(post);
              const StatusIcon = statusIcon[post.status];
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.04 + pi * 0.025, duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                  onClick={() => onPostClick(post)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-sm hover:-translate-y-px transition-all duration-150 cursor-pointer group"
                >
                  {/* Status dot */}
                  <div className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0 ring-2 ring-background', dotStyle[post.status])} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className={cn('text-[10px] py-0 h-4 gap-1', chipStyle[post.status])}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {statusLabel[post.status]}
                      </Badge>
                      {d && (
                        <span className="text-[11px] text-muted-foreground">
                          {format(d, post.status === 'scheduled' ? 'MMM d, h:mm a' : 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Board (kanban) view ───────────────────────────────────────────────────────

function BoardColumn({
  status,
  posts,
  onPostClick,
}: {
  status: Post['status'];
  posts: Post[];
  onPostClick: (post: Post) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `board-${status}` });
  const StatusIcon = statusIcon[status];

  return (
    <div className="flex flex-col min-w-[220px] w-[220px] shrink-0">
      {/* Column header */}
      <div className={cn(
        'flex items-center gap-2 rounded-t-xl px-3 py-2.5 border border-b-0',
        chipStyle[status],
      )}>
        <StatusIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs font-semibold">{statusLabel[status]}</span>
        <span className="ml-auto text-[10px] font-bold opacity-70">{posts.length}</span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[400px] rounded-b-xl border p-2 space-y-2 transition-colors duration-150',
          'bg-muted/30',
          isOver && 'bg-primary/5 border-primary/30',
        )}
      >
        {posts.map((post) => {
          const isDraggable = post.status === 'draft' || post.status === 'scheduled';
          const d = postDate(post);
          return (
            <KanbanCard
              key={post.id}
              post={post}
              isDraggable={isDraggable}
              date={d}
              onClick={() => onPostClick(post)}
            />
          );
        })}
        {posts.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/60">
            No posts
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  post,
  isDraggable,
  date,
  onClick,
}: {
  post: Post;
  isDraggable: boolean;
  date: Date | null;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(isDraggable ? { ...attributes, ...listeners } : {})}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        'rounded-lg border border-border bg-card p-2.5 text-xs cursor-pointer',
        'shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] hover:-translate-y-px transition-all duration-150',
        isDragging && 'opacity-30',
        isDraggable && 'cursor-grab active:cursor-grabbing',
      )}
    >
      <p className="text-foreground line-clamp-3 leading-relaxed mb-1.5">{post.content}</p>
      {date && (
        <p className="text-[10px] text-muted-foreground">
          {format(date, 'MMM d, h:mm a')}
        </p>
      )}
    </div>
  );
}

function BoardView({
  posts,
  onPostClick,
}: {
  posts: Post[];
  onPostClick: (post: Post) => void;
}) {
  const columns: Post['status'][] = ['draft', 'scheduled', 'published', 'failed'];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
      {columns.map(status => (
        <BoardColumn
          key={status}
          status={status}
          posts={posts.filter(p => p.status === status)}
          onPostClick={onPostClick}
        />
      ))}
    </div>
  );
}

// ── View mode tab ─────────────────────────────────────────────────────────────

const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'month', label: 'Month', icon: CalendarDays },
  { id: 'list', label: 'List', icon: LayoutList },
  { id: 'board', label: 'Board', icon: Trello },
];

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({
  post,
  onClose,
  onEdit,
  onNavigate,
}: {
  post: Post;
  onClose: () => void;
  onEdit: () => void;
  onNavigate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
      className="w-80 shrink-0 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          Preview
        </h3>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn('text-xs capitalize', chipStyle[post.status])}>
          <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5', dotStyle[post.status])} />
          {statusLabel[post.status]}
        </Badge>
        {post.scheduled_at && (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(post.scheduled_at), 'MMM d, h:mm a')}
          </span>
        )}
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 rounded-xl border border-border/60 bg-muted/20 p-2">
        <LinkedInPreview
          content={post.content}
          linkUrl={post.link_url}
          postType={resolvePreviewType(post)}
          imagePreviewUrl={resolveImagePreview(post)}
          videoUrl={resolveVideoPreview(post)}
        />
      </div>

      {(post.status === 'draft' || post.status === 'scheduled') && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={onNavigate}>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {post.status === 'draft' && (
        <Button
          size="sm"
          className="h-8 text-xs w-full"
          onClick={onNavigate}
        >
          <Send className="mr-1.5 h-3 w-3" />
          Manage in Posts
        </Button>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ContentCalendar() {
  const { posts, setPosts } = useLinkedInStore();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Build calendar days (full weeks)
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();
    posts.forEach(post => {
      const d = postDate(post);
      if (!d) return;
      const key = format(d, 'yyyy-MM-dd');
      const arr = map.get(key) ?? [];
      arr.push(post);
      map.set(key, arr);
    });
    return map;
  }, [posts]);

  const unscheduledDrafts = useMemo(
    () => posts.filter(p => p.status === 'draft' && !p.scheduled_at),
    [posts],
  );

  const monthPosts = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return posts.filter(p => {
      const d = postDate(p);
      return d && d >= start && d <= end;
    });
  }, [posts, currentMonth]);

  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const post = posts.find(p => p.id === active.id);
    if (!post || (post.status !== 'draft' && post.status !== 'scheduled')) return;

    // Board drop: over.id = "board-<status>" — support moving between draft/scheduled workflow states
    if (String(over.id).startsWith('board-')) {
      const targetStatus = String(over.id).replace('board-', '') as Post['status'];
      if (targetStatus !== 'draft' && targetStatus !== 'scheduled') {
        toast.info('Only draft and scheduled columns are editable.');
        return;
      }

      // Moving to draft clears schedule; moving to scheduled keeps existing schedule or assigns a default.
      const nextScheduledAt =
        targetStatus === 'draft'
          ? null
          : (post.scheduled_at ?? (() => {
              const d = new Date();
              d.setHours(12, 0, 0, 0);
              return d.toISOString();
            })());

      const previous = [...posts];
      setPosts(posts.map(p =>
        p.id === post.id
          ? { ...p, status: targetStatus, scheduled_at: nextScheduledAt ?? undefined }
          : p,
      ));

      try {
        const result = await postsAPI.updatePost(post.id, { scheduled_at: nextScheduledAt });
        setPosts(posts.map(p => p.id === result.post.id ? result.post : p));
        toast.success(targetStatus === 'draft' ? 'Moved to draft.' : 'Moved to scheduled.');
      } catch {
        setPosts(previous);
        toast.error('Failed to move post.');
      }
      return;
    }

    const targetDateStr = over.id as string;
    const targetDate = parseISO(targetDateStr);

    if (isPast(startOfDay(targetDate)) && !isToday(targetDate)) {
      toast.warning('Cannot schedule a post in the past.');
      return;
    }

    let newIso: string;
    if (post.scheduled_at) {
      const existing = parseISO(post.scheduled_at);
      targetDate.setHours(existing.getHours(), existing.getMinutes(), 0, 0);
      newIso = targetDate.toISOString();
    } else {
      targetDate.setHours(12, 0, 0, 0);
      newIso = targetDate.toISOString();
    }

    const previous = [...posts];
    setPosts(posts.map(p =>
      p.id === post.id
        ? { ...p, scheduled_at: newIso, status: 'scheduled' as const }
        : p,
    ));

    try {
      const result = await postsAPI.updatePost(post.id, { scheduled_at: newIso });
      setPosts(posts.map(p => p.id === result.post.id ? result.post : p));
      toast.success(`Scheduled for ${format(targetDate, 'MMM d, yyyy')}`);
    } catch {
      setPosts(previous);
      toast.error('Failed to reschedule post.');
    }
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts(posts.map(p => p.id === updated.id ? updated : p));
    setSelectedPost(updated);
  };

  const hasPreview = selectedPost !== null;

  return (
    <PageTransition>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-5 animate-fade-in">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Planner</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plan, schedule, and visualise your LinkedIn content.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View switcher */}
              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
                {views.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setViewMode(v.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                      viewMode === v.id
                        ? 'bg-background text-foreground shadow-[var(--shadow-xs)]'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <v.icon className="h-3.5 w-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>

              <Button size="sm" onClick={() => navigate('/dashboard/create-post')}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New post
              </Button>
            </div>
          </div>

          {/* ── Stats strip ──────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: posts.length, color: 'text-foreground' },
              { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Scheduled', value: posts.filter(p => p.status === 'scheduled').length, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Published', value: posts.filter(p => p.status === 'published').length, color: 'text-emerald-600 dark:text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="card-base px-4 py-3 flex items-center gap-3">
                <div>
                  <p className={cn('text-xl font-semibold tabular-nums', s.color)}>
                    <NumberTicker value={s.value} />
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main content area ─────────────────────────────── */}
          <div className={cn('flex gap-5', hasPreview ? 'items-start' : '')}>

            {/* ── Left: unscheduled sidebar (month view only) ── */}
            {viewMode === 'month' && (
              <div className="hidden w-48 shrink-0 lg:flex lg:flex-col gap-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unscheduled</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Drag onto a day</p>
                </div>
                <div className="space-y-1.5 overflow-y-auto custom-scrollbar max-h-[520px] pr-0.5">
                  {unscheduledDrafts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground">No unscheduled drafts</p>
                      <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs" onClick={() => navigate('/dashboard/create-post')}>
                        <Plus className="mr-1 h-3 w-3" />Create
                      </Button>
                    </div>
                  ) : (
                    unscheduledDrafts.map(post => (
                      <PostChip key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Center: active view ────────────────────────── */}
            <div className="flex-1 min-w-0 rounded-2xl border border-border/60 bg-card/70 p-3 sm:p-4">

              {/* Month view */}
              {viewMode === 'month' && (
                <div className="space-y-3">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-base font-semibold min-w-[140px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h2>
                      <Button variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCurrentMonth(new Date())}>
                        Today
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {[
                        { label: 'This month', value: monthPosts.length, color: 'text-foreground' },
                        { label: 'Scheduled', value: monthPosts.filter(p => p.status === 'scheduled').length, color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Published', value: monthPosts.filter(p => p.status === 'published').length, color: 'text-emerald-600 dark:text-emerald-400' },
                      ].map(s => (
                        <div key={s.label} className="text-center hidden sm:block">
                          <p className={cn('text-base font-semibold tabular-nums', s.color)}>
                            <NumberTicker value={s.value} />
                          </p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day-of-week header */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map(day => (
                      <CalendarCell
                        key={day.toISOString()}
                        date={day}
                        posts={postsByDate.get(format(day, 'yyyy-MM-dd')) ?? []}
                        currentMonth={currentMonth}
                        onPostClick={setSelectedPost}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* List view */}
              {viewMode === 'list' && (
                <ListView posts={posts} onPostClick={setSelectedPost} />
              )}

              {/* Board view */}
              {viewMode === 'board' && (
                <BoardView posts={posts} onPostClick={setSelectedPost} />
              )}
            </div>

            {/* ── Right: preview panel ────────────────────────── */}
            <AnimatePresence>
              {selectedPost && (
                <PreviewPanel
                  post={selectedPost}
                  onClose={() => setSelectedPost(null)}
                  onEdit={() => setEditingPost(selectedPost)}
                  onNavigate={() => navigate('/dashboard/posts')}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.33,1,0.68,1)' }}>
          {activePost && <PostChip post={activePost} overlay />}
        </DragOverlay>

        {/* Edit modal */}
        <EditPostModal
          post={editingPost}
          open={editingPost !== null}
          onOpenChange={(o) => { if (!o) setEditingPost(null); }}
          onSaved={handlePostUpdated}
        />
      </DndContext>
    </PageTransition>
  );
}

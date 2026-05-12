import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageError } from '@/components/ui/page-error';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '@/lib/api';
import {
  MessageSquare,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Plus,
  Activity,
  ArrowRight,
  CalendarDays,
  FileText,
  Linkedin,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { cn } from '@/lib/utils';
import { NumberTicker } from '@/components/ui/magic/number-ticker';
import { BorderBeam } from '@/components/ui/magic/border-beam';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { format, subDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { loadQueueSettings, getNextQueueSlot } from '@/lib/queue';
import { motion } from 'framer-motion';

// ── Metric Card ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  delay?: number;
  onClick?: () => void;
}

function MetricCard({ title, value, sub, icon: Icon, color, bg, delay = 0, onClick }: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-3',
        onClick && 'cursor-pointer hover:-translate-y-0.5 transition-transform',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black uppercase tracking-wide">{title}</span>
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', bg)}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
      </div>
      <div>
        <p className={cn('text-3xl font-bold tracking-tight tabular-nums leading-tight', color)}>
          <NumberTicker value={value} delay={delay} />
        </p>
        <p className="text-xs text-[#86888a] mt-2">{sub}</p>
      </div>
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-md)] px-3 py-2.5 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { posts, linkedInStatus, setPosts } = useLinkedInStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Array<{ id: string; text: string; tag: string; capturedAt: string }>>([]);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() =>
    localStorage.getItem('linkedinflow_onboarding_dismissed') === '1'
  );

  const isLinkedInConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);

  const fetchPosts = () => {
    setIsLoading(true);
    setError(null);
    postsAPI.getPosts()
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => setError('Could not load data. Check your connection and try again.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('linkedinflow_ideas');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setIdeas(parsed);
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('linkedinflow_onboarding_dismissed', '1');
    setOnboardingDismissed(true);
  };

  const weeklyIdeas = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return ideas.filter(idea => new Date(idea.capturedAt).getTime() >= cutoff);
  }, [ideas]);

  const [dailyPromptDismissed, setDailyPromptDismissed] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sessionStorage.getItem(`linkedinflow_daily_prompt_${today}`) === '1';
  });

  const queueSettings = useMemo(() => loadQueueSettings(), []);

  const nextQueueSlot = useMemo(
    () => getNextQueueSlot(queueSettings, posts),
    [queueSettings, posts]
  );

  const slotLabel = useMemo(() => {
    if (!nextQueueSlot) return null;
    if (isToday(nextQueueSlot)) return `today at ${format(nextQueueSlot, 'h:mm a')}`;
    if (isTomorrow(nextQueueSlot)) return `tomorrow at ${format(nextQueueSlot, 'h:mm a')}`;
    return format(nextQueueSlot, "EEE MMM d 'at' h:mm a");
  }, [nextQueueSlot]);

  const showDailyPrompt = !dailyPromptDismissed && ideas.length > 0 && queueSettings.enabled && !!nextQueueSlot;

  const dismissDailyPrompt = () => {
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(`linkedinflow_daily_prompt_${today}`, '1');
    setDailyPromptDismissed(true);
  };

  const onboardingSteps = [
    { label: 'Connect your LinkedIn account', done: isLinkedInConnected, href: '/dashboard/linkedin-vault' },
    { label: 'Capture your first idea', done: ideas.length > 0, href: '/dashboard/ideas' },
    { label: 'Create your first post', done: posts.length > 0, href: '/dashboard/create-post' },
  ];
  const allOnboardingDone = onboardingSteps.every(s => s.done);
  const showOnboarding = !onboardingDismissed && !allOnboardingDone && !isLoading;

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const failedCount    = posts.filter(p => p.status === 'failed').length;
  const draftCount     = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

  const recentPosts = useMemo(
    () => [...posts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    [posts],
  );

  const scheduledPosts = useMemo(
    () => [...posts]
      .filter((post) => post.status === 'scheduled' && post.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
      .slice(0, 4),
    [posts],
  );

  const pendingDocs = useMemo(
    () => [...posts]
      .filter((post) => post.status !== 'published')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3),
    [posts],
  );

  const workflowHealth = posts.length > 0
    ? Math.round(((publishedCount + scheduledCount) / posts.length) * 100)
    : 0;

  // Last 30 days — with X axis labels every 7 days
  const activityData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(new Date(), 29 - i);
      const key = format(day, 'yyyy-MM-dd');
      const count = posts.filter(p => {
        if (p.status !== 'published' || !p.published_at) return false;
        return format(parseISO(p.published_at), 'yyyy-MM-dd') === key;
      }).length;
      return {
        date: format(day, 'MMM d'),
        count,
        // Show label only every 6 days so it's not crowded
        label: i % 6 === 0 ? format(day, 'MMM d') : '',
      };
    });
  }, [posts]);

  const hasActivity = activityData.some(d => d.count > 0);

  const metrics = [
    {
      title: 'Total Posts',
      value: posts.length,
      icon: FileText,
      sub: 'All time',
      color: 'text-[#0a66c2]',
      bg: 'bg-[#0a66c2]/10',
      onClick: () => navigate('/dashboard/posts'),
    },
    {
      title: 'Published',
      value: publishedCount,
      icon: CheckCircle,
      sub: posts.length > 0 ? `${Math.round((publishedCount / posts.length) * 100)}% success rate` : 'No posts yet',
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      onClick: () => navigate('/dashboard/posts?tab=published'),
    },
    {
      title: 'Scheduled',
      value: scheduledCount,
      icon: Calendar,
      sub: scheduledCount > 0 ? 'Queued to publish' : 'Nothing scheduled',
      color: 'text-[#0a66c2]',
      bg: 'bg-[#0a66c2]/10',
      onClick: () => navigate('/dashboard/posts?tab=scheduled'),
    },
    {
      title: 'Failed',
      value: failedCount,
      icon: Activity,
      sub: failedCount > 0 ? 'Needs attention' : 'All clear',
      color: failedCount > 0 ? 'text-red-600' : 'text-[#86888a]',
      bg: failedCount > 0 ? 'bg-red-500/10' : 'bg-[#eef3f8]',
      onClick: () => navigate('/dashboard/posts?tab=failed'),
    },
  ];

  const statusMeta: Record<string, { dot: string; label: string; badge: string }> = {
    published:  { dot: 'bg-green-500',  label: 'Published',  badge: 'badge-success' },
    draft:      { dot: 'bg-amber-400',  label: 'Draft',      badge: 'badge-warning' },
    scheduled:  { dot: 'bg-blue-500',   label: 'Scheduled',  badge: 'badge-info' },
    failed:     { dot: 'bg-red-500',    label: 'Failed',     badge: 'badge-error' },
    publishing: { dot: 'bg-[#0a66c2]', label: 'Publishing', badge: 'badge-info' },
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
          <CalendarDays className="h-3.5 w-3.5" />
          {format(new Date(), 'MMM yyyy')} - {publishedCount + scheduledCount} active
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/content-calendar")}>
          <CalendarDays className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Calendar</span>
        </Button>
        <Button size="sm" onClick={() => navigate("/dashboard/create-post")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New post
        </Button>
      </div>

      {error && <PageError message={error} onRetry={fetchPosts} />}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
          : metrics.map((m, i) => (
              <MetricCard key={m.title} {...m} delay={i * 0.06} />
            ))}
      </div>

      {!isLoading && posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <div className="flex items-center justify-center">
            <div className="icon-container"><MessageSquare className="h-5 w-5" /></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Welcome to LinkedInFlow</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first post to get started. You can write, schedule, or bulk import posts.</p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button size="sm" onClick={() => navigate('/dashboard/create-post')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create your first post
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/posts?import=1')}>
              Import from spreadsheet
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isLinkedInConnected && (
        <div className="rounded-xl border border-[#dce6f1] bg-gradient-to-r from-[#eef3f8] to-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/20">
            <Linkedin className="h-5 w-5 text-[#0a66c2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Connect your LinkedIn account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Link LinkedIn to start publishing and scheduling posts directly from LinkedInFlow.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => navigate('/dashboard/linkedin-vault')}
          >
            Connect LinkedIn
          </Button>
        </div>
      )}

      {showOnboarding && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Get started</p>
            <button onClick={dismissOnboarding} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
          </div>
          <div className="space-y-2">
            {onboardingSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-3 cursor-pointer" onClick={() => !step.done && navigate(step.href)}>
                <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  step.done ? 'border-green-500 bg-green-500' : 'border-border'
                )}>
                  {step.done && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                <span className={cn('text-xs', step.done ? 'line-through text-muted-foreground' : 'text-foreground')}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-3">
          <Card className="dashboard-panel border border-gray-200">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                    <div className="icon-container-sm">
                      <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    Publishing activity
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Published posts over the last 30 days.
                  </p>
                </div>
                <span className="section-label">Last 30 days</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <Skeleton className="h-[232px] w-full rounded-[1rem]" />
              ) : hasActivity ? (
                <ResponsiveContainer width="100%" height={232}>
                  <AreaChart data={activityData} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={24}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Published"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#actGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[232px] flex-col items-center justify-center gap-2 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">No published posts yet</p>
                  <p className="text-xs text-muted-foreground">Activity will appear here after your first publish.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="dashboard-panel border border-gray-200 h-fit">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                  <div className="icon-container-sm">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  Workflow health
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Planning coverage based on published and scheduled posts.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-40 w-40 rounded-full" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="relative flex h-40 w-40 items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(hsl(var(--primary)) 0 ${workflowHealth}%, hsl(var(--muted)) ${workflowHealth}% 100%)`,
                        }}
                      />
                      <div className="absolute inset-3 rounded-full border border-border/70 bg-card shadow-inner flex flex-col items-center justify-center text-center">
                        <p className="text-[54px] font-semibold tracking-tight tabular-nums leading-none">{workflowHealth}</p>
                        <p className="mt-1 text-xs text-muted-foreground">workflow score</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isLoading && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Published', value: publishedCount, color: 'text-green-600 dark:text-green-400' },
                      { label: 'Scheduled', value: scheduledCount, color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Drafts', value: draftCount, color: 'text-amber-600 dark:text-amber-400' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/25 px-3 py-3 text-center">
                        <p className={cn('text-lg font-semibold tabular-nums', item.color)}>{item.value}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-panel border border-gray-200 h-fit flex flex-col">
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                    <div className="icon-container-sm">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    Recent posts
                  </CardTitle>
                  {!isLoading && posts.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/dashboard/posts')}>
                      Manage all
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[400px]">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 py-1">
                        <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : recentPosts.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentPosts.map((post, i) => {
                      const meta = statusMeta[post.status];
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                          className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', meta.dot)} />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="line-clamp-1 text-[13px] leading-relaxed text-foreground">{post.content}</p>
                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                              <span>{meta.label}</span>
                              <span>·</span>
                              <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                              {post.status === 'scheduled' && post.scheduled_at && (
                                <>
                                  <span>·</span>
                                  <span className="text-blue-600 dark:text-blue-400">
                                    Sends {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={cn('shrink-0 capitalize text-[10px] font-medium', meta.badge)}>
                            {post.status}
                          </Badge>
                        </motion.div>
                      );
                    })}
                    {posts.length > 8 && (
                      <div className="pt-3 text-center">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/dashboard/posts')}>
                          View all {posts.length} posts
                          <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="icon-container mx-auto">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No posts yet</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Create your first post to start building your audience.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/dashboard/create-post')}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Create your first post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          {showDailyPrompt && (
            <Card className="dashboard-panel border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-white h-fit">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Today's action</p>
                  </div>
                  <button
                    onClick={dismissDailyPrompt}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    dismiss
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You have <span className="font-semibold text-foreground">{ideas.length} idea{ideas.length !== 1 ? 's' : ''}</span> captured.
                  Your next queue slot is <span className="font-semibold text-foreground">{slotLabel}</span>.
                </p>
                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => navigate('/dashboard/ai-interview')}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Turn an idea into a post
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="dashboard-panel border border-gray-200 h-fit">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                  <div className="icon-container-sm">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  Documents
                </CardTitle>
                <span className="section-label">Queue</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-[1.1rem]" />
                  ))}
                </div>
              ) : pendingDocs.length > 0 ? (
                <div className="space-y-3">
                  {scheduledPosts[0]?.scheduled_at && (
                    <div className="rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-primary">
                      Next scheduled: {format(new Date(scheduledPosts[0].scheduled_at), 'MMM d, h:mm a')}
                    </div>
                  )}
                  {pendingDocs.map((post) => {
                  const meta = statusMeta[post.status];
                  const dueLabel = post.status === 'scheduled' && post.scheduled_at
                    ? `Due ${format(new Date(post.scheduled_at), 'MMM d, h:mm a')}`
                    : `Created ${format(new Date(post.created_at), 'MMM d')}`;

                  return (
                    <div key={post.id} className="rounded-[1.1rem] border border-border/70 bg-background px-4 py-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline" className={cn('text-[10px] font-medium', meta.badge)}>
                          {meta.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{dueLabel}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground leading-relaxed">
                        {post.content}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{post.post_type} post</span>
                        <span>{post.link_url ? 'Link attached' : 'No link'}</span>
                      </div>
                    </div>
                  );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-foreground">No drafts or scheduled posts</p>
                  <p className="mt-1 text-xs text-muted-foreground">Your upcoming content will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-panel border border-gray-200 h-fit">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                  <div className="icon-container-sm">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </div>
                  This week's ideas
                </CardTitle>
                <span className="section-label">{weeklyIdeas.length} captured</span>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {weeklyIdeas.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No ideas captured this week</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/ideas')}>
                    Capture idea
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {weeklyIdeas.slice(0, 3).map((idea) => {
                    const tagColors: Record<string, string> = {
                      win: 'bg-green-100 text-green-700',
                      lesson: 'bg-blue-100 text-blue-700',
                      opinion: 'bg-purple-100 text-purple-700',
                      thought: 'bg-gray-100 text-gray-700',
                      update: 'bg-sky-100 text-sky-700',
                      question: 'bg-orange-100 text-orange-700',
                    };
                    const tagClass = tagColors[idea.tag] ?? 'bg-amber-100 text-amber-700';
                    return (
                      <div key={idea.id} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                        <p className="flex-1 min-w-0 line-clamp-1 text-xs text-foreground">{idea.text}</p>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', tagClass)}>
                          {idea.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={cn('dashboard-panel relative overflow-hidden border border-gray-200 h-fit', isLinkedInConnected && 'border-emerald-200/70 dark:border-emerald-800/50')}>
            {isLinkedInConnected && (
              <BorderBeam size={120} duration={20} colorFrom="#10b981" colorTo="#34d399" borderWidth={1.5} />
            )}
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                <div className="icon-container-sm">
                  <Users className="h-3.5 w-3.5" />
                </div>
                LinkedIn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-3 py-2.5">
                <span className={cn('h-2 w-2 rounded-full shrink-0', isLinkedInConnected ? 'bg-green-500 pulse-dot' : 'bg-muted-foreground/40')} />
                <span className={cn('text-xs font-medium', isLinkedInConnected ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground')}>
                  {isLinkedInConnected ? 'Connected' : 'Not connected'}
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { icon: CheckCircle, label: 'Published', value: publishedCount, color: 'text-green-600 dark:text-green-400' },
                    { icon: CalendarDays, label: 'Scheduled', value: scheduledCount, color: 'text-blue-600 dark:text-blue-400' },
                    { icon: Clock, label: 'Drafts', value: draftCount, color: 'text-amber-600 dark:text-amber-400' },
                    { icon: XCircle, label: 'Failed', value: failedCount, color: 'text-red-600 dark:text-red-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <span className={cn('text-sm font-semibold tabular-nums', item.color)}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {!isLinkedInConnected ? (
                <Button size="sm" className="w-full" onClick={() => navigate('/dashboard/linkedin-vault')}>
                  Connect LinkedIn
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('/dashboard/posts')}>
                  Manage posts
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

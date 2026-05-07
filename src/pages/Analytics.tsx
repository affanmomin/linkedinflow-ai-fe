import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Play,
  Plus,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';

type DateRange = '7d' | '30d' | '90d';

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-md)] px-3 py-2.5 text-xs">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.fill || p.stroke }} />
          {p.name}: <span className="font-semibold text-foreground ml-auto pl-3">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function Analytics() {
  const { posts, setPosts } = useLinkedInStore();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  // Passive background fetch if store is empty
  useEffect(() => {
    if (posts.length === 0) {
      postsAPI.getPosts()
        .then(d => setPosts(d.posts ?? []))
        .catch(() => {});
    }
  }, []);

  const rangeDays  = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const monthCount = dateRange === '7d' ? 1 : dateRange === '30d' ? 3 : 6;

  // ── Derived stats ────────────────────────────────────────────────────────────
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount     = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const failedCount    = posts.filter(p => p.status === 'failed').length;
  const successRate    = posts.length > 0 ? Math.round((publishedCount / posts.length) * 100) : 0;

  // ── Activity by date range ───────────────────────────────────────────────────
  const activityData = useMemo(() => {
    return Array.from({ length: rangeDays }, (_, i) => {
      const day    = subDays(new Date(), rangeDays - 1 - i);
      const dayStr = day.toDateString();
      const label  = rangeDays === 7 ? format(day, 'EEE') : format(day, 'M/d');
      const total  = posts.filter(p => new Date(p.created_at).toDateString() === dayStr).length;
      const published = posts.filter(p =>
        new Date(p.created_at).toDateString() === dayStr && p.status === 'published',
      ).length;
      return { name: label, total, published };
    });
  }, [posts, rangeDays]);

  // ── Status distribution ──────────────────────────────────────────────────────
  const statusData = useMemo(() => {
    return [
      { name: 'Published', value: publishedCount, color: '#10B981' },
      { name: 'Draft',     value: draftCount,     color: '#F59E0B' },
      { name: 'Scheduled', value: scheduledCount, color: '#3B82F6' },
      { name: 'Failed',    value: failedCount,    color: '#EF4444' },
    ].filter(s => s.value > 0);
  }, [publishedCount, draftCount, scheduledCount, failedCount]);

  // ── Post type distribution ───────────────────────────────────────────────────
  const typeData = useMemo(() => {
    return [
      { name: 'Text',  value: posts.filter(p => p.post_type === 'text').length,  color: '#8B5CF6' },
      { name: 'Image', value: posts.filter(p => p.post_type === 'image').length, color: '#06B6D4' },
      { name: 'Link',  value: posts.filter(p => p.post_type === 'link').length,  color: '#F97316' },
      { name: 'Video', value: posts.filter(p => p.post_type === 'video').length, color: '#EF4444' },
    ].filter(s => s.value > 0);
  }, [posts]);

  // ── Upcoming scheduled ──────────────────────────────────────────────────────
  const scheduledPosts = useMemo(() =>
    posts
      .filter(p => p.status === 'scheduled' && p.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()),
    [posts],
  );

  // ── Recent posts ────────────────────────────────────────────────────────────
  const recentPosts = useMemo(() =>
    [...posts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    [posts],
  );

  // ── Monthly trend ────────────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const today  = new Date();
    return Array.from({ length: monthCount }, (_, i) => {
      const d    = new Date(today.getFullYear(), today.getMonth() - (monthCount - 1 - i), 1);
      const mo   = d.getMonth();
      const yr   = d.getFullYear();
      const total     = posts.filter(p => { const pd = new Date(p.created_at); return pd.getMonth() === mo && pd.getFullYear() === yr; }).length;
      const published = posts.filter(p => { const pd = new Date(p.created_at); return pd.getMonth() === mo && pd.getFullYear() === yr && p.status === 'published'; }).length;
      return { name: months[mo], total, published };
    });
  }, [posts, monthCount]);

  const statusMeta = {
    published: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', badge: 'badge-success' },
    draft:     { icon: Clock,       color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30',     badge: 'badge-warning' },
    scheduled: { icon: Calendar,    color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-900/30',       badge: 'badge-info' },
    failed:    { icon: XCircle,     color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-100 dark:bg-rose-900/30',       badge: 'badge-error' },
  } as const;

  const typeIcon = { text: FileText, image: ImageIcon, link: LinkIcon, video: Play } as const;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">LinkedIn activity and post performance.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Date range toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-border bg-muted/50">
            {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  'h-7 px-3 text-xs font-medium rounded-md transition-colors',
                  dateRange === r
                    ? 'bg-background text-foreground shadow-[var(--shadow-xs)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard/create-post')}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create post
          </Button>
        </div>
      </div>

      {/* ── Summary metrics ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Posts',  value: posts.length,  icon: MessageSquare, color: 'text-primary',                                       bg: 'bg-primary/10'       },
          { label: 'Published',    value: publishedCount,icon: CheckCircle,   color: 'text-emerald-600 dark:text-emerald-400',              bg: 'bg-emerald-500/10'   },
          { label: 'Success Rate', value: successRate,   icon: TrendingUp,    color: 'text-violet-600 dark:text-violet-400',                bg: 'bg-violet-500/10',  suffix: '%' },
          { label: 'Scheduled',    value: scheduledCount,icon: Calendar,      color: 'text-amber-600 dark:text-amber-400',                  bg: 'bg-amber-500/10'     },
        ].map((s) => (
          <div key={s.label} className="metric-card space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="section-label">{s.label}</span>
              <div className={cn('flex items-center justify-center w-7 h-7 rounded-md', s.bg)}>
                <s.icon className={cn('h-3.5 w-3.5', s.color)} />
              </div>
            </div>
            <p className={cn('text-[26px] font-bold tracking-tight tabular-nums leading-none', s.color)}>
              {s.value}{s.suffix ?? ''}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview"  className="text-xs h-7 gap-1.5"><BarChart3 className="h-3 w-3" />Overview</TabsTrigger>
          <TabsTrigger value="posts"     className="text-xs h-7 gap-1.5"><MessageSquare className="h-3 w-3" />Posts</TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs h-7 gap-1.5">
            <Calendar className="h-3 w-3" />Scheduled
            {scheduledCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 text-[10px] px-1.5 py-0 h-4 badge-info border">
                {scheduledCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="text-xs h-7 gap-1.5"><Target className="h-3 w-3" />Breakdown</TabsTrigger>
        </TabsList>

        {/* ── Overview ───────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Activity bar chart */}
            <Card>
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <div className="icon-container-sm"><BarChart3 className="h-3.5 w-3.5" /></div>
                    Activity
                  </CardTitle>
                  <span className="section-label">Last {dateRange}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {posts.length === 0 ? (
                  <EmptyChart label="Create posts to see activity" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={activityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.6 }} />
                        <Bar dataKey="total"     name="Created"   fill="hsl(var(--muted-foreground) / 0.25)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="published" name="Published" fill="hsl(var(--primary))"                 radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-3 pl-1">
                      <LegendDot color="hsl(var(--muted-foreground) / 0.4)" label="Created" />
                      <LegendDot color="hsl(var(--primary))"                label="Published" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status pie */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="icon-container-sm"><Target className="h-3.5 w-3.5" /></div>
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {posts.length === 0 || statusData.length === 0 ? (
                  <EmptyChart label="No data yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} posts`, name]}
                        content={<ChartTooltip />}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={7}
                        formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                        wrapperStyle={{ paddingTop: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly trend */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="icon-container-sm"><TrendingUp className="h-3.5 w-3.5" /></div>
                  Monthly Trend
                </CardTitle>
                <span className="section-label">Last {monthCount} month{monthCount > 1 ? 's' : ''}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {posts.length === 0 ? (
                <EmptyChart label="No posts yet" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.6 }} />
                      <Bar dataKey="total"     name="Created"   fill="#94a3b8" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="published" name="Published" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-3 pl-1">
                    <LegendDot color="#94a3b8" label="Created" />
                    <LegendDot color="#10b981" label="Published" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Posts ──────────────────────────────────────────────── */}
        <TabsContent value="posts">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><MessageSquare className="h-3.5 w-3.5" /></div>
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="icon-container mx-auto">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No posts yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Create your first post to see it here.</p>
                  </div>
                  <Button size="sm" onClick={() => navigate('/dashboard/create-post')}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />Create post
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentPosts.map((post) => {
                    const meta     = statusMeta[post.status];
                    const Icon     = meta.icon;
                    const TypeIcon = typeIcon[post.post_type] ?? FileText;
                    return (
                      <div key={post.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', meta.bg)}>
                          <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-[13px] text-foreground line-clamp-1 leading-relaxed">{post.content}</p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                            <Badge variant="outline" className={cn('text-[10px] capitalize', meta.badge)}>
                              <Icon className="mr-1 h-3 w-3" />{post.status}
                            </Badge>
                            <span className="flex items-center gap-1"><TypeIcon className="h-3 w-3" />{post.post_type}</span>
                            <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                            {post.scheduled_at && post.status === 'scheduled' && (
                              <span className="text-blue-600 dark:text-blue-400">
                                · Sends {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Scheduled ──────────────────────────────────────────── */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="icon-container-sm"><Calendar className="h-3.5 w-3.5" /></div>
                Upcoming Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="icon-container mx-auto">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No scheduled posts</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Schedule a post to see your queue.</p>
                  </div>
                  <Button size="sm" onClick={() => navigate('/dashboard/create-post')}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />Schedule a post
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledPosts.map((post, idx) => {
                    const scheduledDate = new Date(post.scheduled_at!);
                    const isToday       = scheduledDate.toDateString() === new Date().toDateString();
                    const isPast        = scheduledDate < new Date();
                    return (
                      <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
                        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <span className="text-[9px] font-semibold uppercase leading-none">
                            {format(scheduledDate, 'MMM')}
                          </span>
                          <span className="text-base font-bold leading-tight">{scheduledDate.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-foreground line-clamp-1 leading-relaxed">{post.content}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px]">
                            <span className={cn(
                              'font-medium',
                              isPast  ? 'text-rose-600 dark:text-rose-400' :
                              isToday ? 'text-amber-600 dark:text-amber-400' :
                                        'text-blue-600 dark:text-blue-400',
                            )}>
                              {isPast ? 'Overdue · ' : isToday ? 'Today · ' : ''}
                              {format(scheduledDate, 'h:mm a')}
                            </span>
                            {isPast && (
                              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <AlertCircle className="h-3 w-3" />
                                Pending publish
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">#{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Breakdown ──────────────────────────────────────────── */}
        <TabsContent value="breakdown" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Status bars */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="icon-container-sm"><Target className="h-3.5 w-3.5" /></div>
                  By Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Published', count: publishedCount, color: 'bg-emerald-500' },
                  { label: 'Draft',     count: draftCount,     color: 'bg-amber-400'  },
                  { label: 'Scheduled', count: scheduledCount, color: 'bg-blue-500'   },
                  { label: 'Failed',    count: failedCount,    color: 'bg-rose-500'   },
                ].map((item) => {
                  const pct = posts.length > 0 ? Math.round((item.count / posts.length) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground tabular-nums">{item.count} · {pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', item.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {posts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No posts yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Type breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="icon-container-sm"><FileText className="h-3.5 w-3.5" /></div>
                  By Content Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeData.length === 0 ? (
                  <EmptyChart label="No posts yet" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {typeData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} posts`, name]}
                          content={<ChartTooltip />}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {typeData.map((d) => (
                        <LegendDot key={d.name} color={d.color} label={`${d.name} (${d.value})`} />
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Publishing rate */}
          <Card>
            <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-primary/20">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${successRate * 3.6}deg, hsl(var(--muted)) 0deg)`,
                    mask: 'radial-gradient(circle at center, transparent 55%, black 56%)',
                    WebkitMask: 'radial-gradient(circle at center, transparent 55%, black 56%)',
                  }}
                />
                <span className="text-xl font-bold text-primary relative z-10">{successRate}%</span>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-base font-semibold text-foreground">Publishing Rate</p>
                <p className="text-sm text-muted-foreground">
                  {publishedCount} of {posts.length} posts successfully published to LinkedIn.
                  {failedCount > 0 && ` ${failedCount} failed — check the Posts page.`}
                </p>
              </div>
              <div className="sm:ml-auto shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/posts')}>
                  View all posts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
      <BarChart3 className="h-8 w-8 text-muted-foreground/25" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function LegendDot({ color, label, opacity = 1 }: { color: string; label: string; opacity?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color, opacity }} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

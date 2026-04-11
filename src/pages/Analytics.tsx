import { useMemo } from 'react';
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
import { cn } from '@/lib/utils';

export function Analytics() {
  const { posts } = useLinkedInStore();
  const navigate = useNavigate();

  // ── Derived stats ───────────────────────────────────────────────────────────
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount     = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const failedCount    = posts.filter(p => p.status === 'failed').length;
  const successRate    = posts.length > 0
    ? Math.round((publishedCount / posts.length) * 100)
    : 0;

  // ── Weekly activity (last 7 days) ───────────────────────────────────────────
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toDateString();
      const total     = posts.filter(p => new Date(p.created_at).toDateString() === dateStr).length;
      const published = posts.filter(p => new Date(p.created_at).toDateString() === dateStr && p.status === 'published').length;
      return { name: days[date.getDay()], total, published };
    });
  }, [posts]);

  // ── Status distribution ────────────────────────────────────────────────────
  const statusData = useMemo(() => {
    return [
      { name: 'Published', value: publishedCount, color: '#10B981' },
      { name: 'Draft',     value: draftCount,     color: '#F59E0B' },
      { name: 'Scheduled', value: scheduledCount, color: '#3B82F6' },
      { name: 'Failed',    value: failedCount,    color: '#EF4444' },
    ].filter(s => s.value > 0);
  }, [publishedCount, draftCount, scheduledCount, failedCount]);

  // ── Post type distribution ─────────────────────────────────────────────────
  const typeData = useMemo(() => {
    return [
      { name: 'Text',  value: posts.filter(p => p.post_type === 'text').length,  color: '#8B5CF6' },
      { name: 'Image', value: posts.filter(p => p.post_type === 'image').length, color: '#06B6D4' },
      { name: 'Link',  value: posts.filter(p => p.post_type === 'link').length,  color: '#F97316' },
    ].filter(s => s.value > 0);
  }, [posts]);

  // ── Upcoming scheduled posts ───────────────────────────────────────────────
  const scheduledPosts = useMemo(() =>
    posts
      .filter(p => p.status === 'scheduled' && p.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()),
    [posts]
  );

  // ── Recent published posts ─────────────────────────────────────────────────
  const recentPosts = useMemo(() =>
    [...posts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    [posts]
  );

  // ── Monthly activity (last 6 months) ──────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const total = posts.filter(p => {
        const pd = new Date(p.created_at);
        return pd.getMonth() === monthIdx && pd.getFullYear() === year;
      }).length;
      const published = posts.filter(p => {
        const pd = new Date(p.created_at);
        return pd.getMonth() === monthIdx && pd.getFullYear() === year && p.status === 'published';
      }).length;
      return { name: months[monthIdx], total, published };
    });
  }, [posts]);

  // ── Status icon helper ─────────────────────────────────────────────────────
  const statusMeta = {
    published: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', badge: 'badge-success' },
    draft:     { icon: Clock,        color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/30',   badge: 'badge-warning' },
    scheduled: { icon: Calendar,     color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/30',     badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400' },
    failed:    { icon: XCircle,      color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-100 dark:bg-rose-900/30',     badge: 'badge-error' },
  } as const;

  const typeIcon = { text: FileText, image: ImageIcon, link: LinkIcon } as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your LinkedIn posting activity and performance overview.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/create-post')}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create post
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts',   value: posts.length,   icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Published',     value: publishedCount, icon: CheckCircle,   color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Success Rate',  value: `${successRate}%`, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Scheduled',     value: scheduledCount, icon: Calendar,      color: 'text-amber-600 dark:text-amber-400' },
        ].map((s) => (
          <Card key={s.label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={cn('h-5 w-5 shrink-0', s.color)} />
              <div>
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"  className="text-xs"><BarChart3 className="h-3 w-3 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="posts"     className="text-xs"><MessageSquare className="h-3 w-3 mr-1.5" />Posts</TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs">
            <Calendar className="h-3 w-3 mr-1.5" />Scheduled
            {scheduledCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {scheduledCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="text-xs"><Target className="h-3 w-3 mr-1.5" />Breakdown</TabsTrigger>
        </TabsList>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Weekly activity bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="icon-container-sm">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  Weekly Activity
                </CardTitle>
                <p className="text-xs text-muted-foreground">Posts created in the last 7 days</p>
              </CardHeader>
              <CardContent className="pt-2">
                {posts.length === 0 ? (
                  <EmptyChart label="No posts yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                      />
                      <Bar dataKey="total"     name="Total"     fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.35} />
                      <Bar dataKey="published" name="Published" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <div className="flex gap-4 mt-2">
                  <LegendDot color="hsl(var(--primary))" opacity={0.35} label="Total created" />
                  <LegendDot color="hsl(var(--primary))" label="Published" />
                </div>
              </CardContent>
            </Card>

            {/* Status distribution pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="icon-container-sm">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  Status Distribution
                </CardTitle>
                <p className="text-xs text-muted-foreground">Breakdown of all posts by status</p>
              </CardHeader>
              <CardContent className="pt-2">
                {posts.length === 0 ? (
                  <EmptyChart label="No posts yet" />
                ) : statusData.length === 0 ? (
                  <EmptyChart label="No data to display" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} posts`, name]}
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="icon-container-sm">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                6-Month Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground">Posts created and published per month</p>
            </CardHeader>
            <CardContent className="pt-2">
              {posts.length === 0 ? (
                <EmptyChart label="No posts yet" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    />
                    <Bar dataKey="total"     name="Total"     fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="published" name="Published" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-2">
                <LegendDot color="#94a3b8" label="Total created" />
                <LegendDot color="#10b981" label="Published" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Posts ─────────────────────────────────────────────────────────── */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="icon-container-sm">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                Recent Posts
              </CardTitle>
              <p className="text-xs text-muted-foreground">Latest posts with status</p>
            </CardHeader>
            <CardContent className="pt-4">
              {recentPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="icon-container mx-auto mb-3">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">No posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first post to see it here.</p>
                  <Button size="sm" onClick={() => navigate('/create-post')}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Create post
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentPosts.map((post) => {
                    const meta = statusMeta[post.status];
                    const Icon = meta.icon;
                    const TypeIcon = typeIcon[post.post_type] ?? FileText;
                    return (
                      <div key={post.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', meta.bg)}>
                          <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{post.content}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className={cn('text-xs capitalize', meta.badge)}>
                              <Icon className="mr-1 h-3 w-3" />
                              {post.status}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {post.post_type}
                            </span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            {post.scheduled_at && post.status === 'scheduled' && (
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                · Scheduled {new Date(post.scheduled_at).toLocaleString()}
                              </span>
                            )}
                            {post.published_at && (
                              <span>· Published {new Date(post.published_at).toLocaleDateString()}</span>
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

        {/* ── Scheduled ─────────────────────────────────────────────────────── */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="icon-container-sm">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                Upcoming Scheduled Posts
              </CardTitle>
              <p className="text-xs text-muted-foreground">Posts queued for future publishing</p>
            </CardHeader>
            <CardContent className="pt-4">
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="icon-container mx-auto mb-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">No scheduled posts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule a post to see it here.
                  </p>
                  <Button size="sm" onClick={() => navigate('/create-post')}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Schedule a post
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledPosts.map((post, idx) => {
                    const scheduledDate = new Date(post.scheduled_at!);
                    const isToday = scheduledDate.toDateString() === new Date().toDateString();
                    const isPast  = scheduledDate < new Date();
                    return (
                      <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <span className="text-[10px] font-semibold uppercase leading-none">
                            {scheduledDate.toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-base font-bold leading-none">{scheduledDate.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{post.content}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className={cn(
                              'font-medium',
                              isPast ? 'text-rose-600 dark:text-rose-400' : isToday ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                            )}>
                              {isPast ? 'Overdue · ' : isToday ? 'Today · ' : ''}
                              {scheduledDate.toLocaleString()}
                            </span>
                            {isPast && (
                              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <AlertCircle className="h-3 w-3" />
                                Pending publish
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">#{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Breakdown ─────────────────────────────────────────────────────── */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Status counts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="icon-container-sm">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  Status Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">Posts by publish status</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {[
                  { label: 'Published', count: publishedCount, total: posts.length, color: 'bg-emerald-500' },
                  { label: 'Draft',     count: draftCount,     total: posts.length, color: 'bg-amber-500' },
                  { label: 'Scheduled', count: scheduledCount, total: posts.length, color: 'bg-blue-500' },
                  { label: 'Failed',    count: failedCount,    total: posts.length, color: 'bg-rose-500' },
                ].map((item) => {
                  const pct = posts.length > 0 ? Math.round((item.count / posts.length) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.count} · {pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', item.color)}
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

            {/* Post type breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="icon-container-sm">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  Post Type Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">Distribution by content type</p>
              </CardHeader>
              <CardContent className="pt-2">
                {typeData.length === 0 ? (
                  <EmptyChart label="No posts yet" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {typeData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} posts`, name]}
                          contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', fontSize: 12 }}
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

          {/* Publishing rate card */}
          <Card>
            <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
                <span className="text-2xl font-bold text-primary">{successRate}%</span>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-base font-semibold text-foreground">Publishing Rate</p>
                <p className="text-sm text-muted-foreground">
                  {publishedCount} of {posts.length} posts successfully published to LinkedIn.
                  {failedCount > 0 && ` ${failedCount} post${failedCount > 1 ? 's' : ''} failed — check the Posts page to retry.`}
                </p>
              </div>
              <div className="sm:ml-auto shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate('/posts')}>
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

// ── Small helpers ──────────────────────────────────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function LegendDot({ color, label, opacity = 1 }: { color: string; label: string; opacity?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color, opacity }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

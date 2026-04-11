import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '@/lib/api';
import {
  MessageSquare,
  Users,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Plus,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useDataStore } from '@/store/useDataStore';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { posts, linkedInStatus, setPosts } = useLinkedInStore();
  const { sheetConnection } = useDataStore();
  const navigate = useNavigate();

  const isLinkedInConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);

  useEffect(() => {
    postsAPI.getPosts()
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => {});
  }, []);

  const successfulPosts = posts.filter(p => p.status === 'published').length;
  const failedPosts    = posts.filter(p => p.status === 'failed').length;
  const draftPosts     = posts.filter(p => p.status === 'draft').length;
  const recentPosts    = posts.slice(0, 5);

  const stats = [
    {
      title: 'Total Posts',
      value: posts.length,
      icon: MessageSquare,
      sub: 'All time',
    },
    {
      title: 'Success Rate',
      value: posts.length > 0 ? `${Math.round((successfulPosts / posts.length) * 100)}%` : '—',
      icon: Target,
      sub: `${successfulPosts} published`,
    },
    {
      title: 'Drafts',
      value: draftPosts,
      icon: Calendar,
      sub: 'Pending publish',
    },
    {
      title: 'Failed',
      value: failedPosts,
      icon: Activity,
      sub: 'Needs attention',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your LinkedIn automation overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Analytics
          </Button>
          <Button size="sm" onClick={() => navigate('/create-post')}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className="icon-container-sm">
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LinkedIn status */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="icon-container-sm">
                <Users className="h-3.5 w-3.5" />
              </div>
              LinkedIn Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Connection</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium',
                  isLinkedInConnected ? 'badge-success' : 'bg-muted text-muted-foreground'
                )}
              >
                <div className={cn(
                  'h-1.5 w-1.5 rounded-full mr-1.5',
                  isLinkedInConnected ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                )} />
                {isLinkedInConnected ? 'Connected' : 'Not connected'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: 'Published', value: successfulPosts, color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
                { label: 'Drafts',    value: draftPosts,     color: 'text-amber-600 dark:text-amber-400',   icon: Clock },
                { label: 'Failed',    value: failedPosts,    color: 'text-rose-600 dark:text-rose-400',     icon: XCircle },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <item.icon className={cn('h-4 w-4 mx-auto mb-1', item.color)} />
                  <p className={cn('text-lg font-semibold', item.color)}>{item.value}</p>
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            {!isLinkedInConnected && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/linkedin-vault')}
              >
                Connect LinkedIn
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Data sources */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="icon-container-sm">
                <Activity className="h-3.5 w-3.5" />
              </div>
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Google Sheets</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium',
                  sheetConnection ? 'badge-success' : 'bg-muted text-muted-foreground'
                )}
              >
                {sheetConnection ? 'Connected' : 'Not connected'}
              </Badge>
            </div>

            {sheetConnection ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sheet name</span>
                  <span className="font-medium">{sheetConnection.sheetName}</span>
                </div>
                {sheetConnection.lastSync && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last sync</span>
                    <span className="font-medium">
                      {new Date(sheetConnection.lastSync).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/data-management')}
                >
                  Connect a data source
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="icon-container-sm">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            Recent Posts
          </CardTitle>
          {recentPosts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/create-post')}>
              View all
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentPosts.length > 0 ? (
            <div className="divide-y divide-border">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs shrink-0',
                      post.status === 'published' ? 'badge-success' :
                      post.status === 'failed'    ? 'badge-error' :
                                                    'badge-warning'
                    )}
                  >
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="icon-container mx-auto mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No posts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first post to get started.
              </p>
              <Button size="sm" onClick={() => navigate('/create-post')}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

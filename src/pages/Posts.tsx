import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI, type Post } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published' | 'failed';

const statusConfig = {
  published: { label: 'Published', icon: CheckCircle, badge: 'badge-success' },
  draft:     { label: 'Draft',     icon: Clock,       badge: 'badge-warning' },
  scheduled: { label: 'Scheduled', icon: Calendar,    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' },
  failed:    { label: 'Failed',    icon: XCircle,     badge: 'badge-error' },
};

const typeIcon = {
  text:  FileText,
  image: ImageIcon,
  link:  LinkIcon,
};

function PostCard({
  post,
  onDelete,
  onPublish,
}: {
  post: Post;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  const [deleting,   setDeleting]   = useState(false);
  const [publishing, setPublishing] = useState(false);
  const cfg     = statusConfig[post.status];
  const Icon    = cfg.icon;
  const TypeIcon = typeIcon[post.post_type] ?? FileText;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await postsAPI.deletePost(post.id);
      onDelete(post.id);
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await postsAPI.publishPost(post.id);
      onPublish(post.id);
      toast.success('Post published to LinkedIn!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
      {/* Type icon */}
      <div className="icon-container-sm shrink-0 mt-0.5">
        <TypeIcon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm text-foreground line-clamp-3 leading-relaxed">{post.content}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className={cn('text-xs capitalize', cfg.badge)}>
            <Icon className="mr-1 h-3 w-3" />
            {cfg.label}
          </Badge>
          <span>Created {new Date(post.created_at).toLocaleDateString()}</span>
          {post.status === 'scheduled' && post.scheduled_at && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              · Scheduled for {new Date(post.scheduled_at).toLocaleString()}
            </span>
          )}
          {post.published_at && (
            <span>· Published {new Date(post.published_at).toLocaleDateString()}</span>
          )}
          {post.link_url && (
            <span className="truncate max-w-[160px]">· {post.link_url}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {post.status === 'draft' && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs"
            onClick={handlePublish}
            disabled={publishing || deleting}
          >
            {publishing
              ? <RefreshCw className="h-3 w-3 animate-spin" />
              : <><Send className="mr-1 h-3 w-3" />Publish</>}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleting || publishing}
        >
          {deleting
            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

export function Posts() {
  const { posts, setPosts, removePost } = useLinkedInStore();
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const draftCount     = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const failedCount    = posts.filter(p => p.status === 'failed').length;

  useEffect(() => {
    setIsFetching(true);
    postsAPI.getPosts()
      .then(data => setPosts(data.posts ?? []))
      .catch(() => toast.error('Failed to load posts.'))
      .finally(() => setIsFetching(false));
  }, []);

  const handleDelete = (id: string) => removePost(id);

  const handlePublish = (id: string) => {
    // Update local store: mark as published
    const updated = posts.map(p =>
      p.id === id ? { ...p, status: 'published' as const, published_at: new Date().toISOString() } : p
    );
    setPosts(updated);
  };

  const filtered = (status: StatusFilter) =>
    status === 'all' ? posts : posts.filter(p => p.status === status);

  const EmptyState = ({ label }: { label: string }) => (
    <div className="text-center py-12">
      <div className="icon-container mx-auto mb-3">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">No {label} posts</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {label === 'draft'
          ? 'Save a post as draft and it will appear here.'
          : `No ${label} posts yet.`}
      </p>
      <Button size="sm" onClick={() => navigate('/create-post')}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Create post
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your drafts, published posts, and failed posts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsFetching(true);
              postsAPI.getPosts()
                .then(data => { setPosts(data.posts ?? []); toast.success('Refreshed.'); })
                .catch(() => toast.error('Failed to refresh.'))
                .finally(() => setIsFetching(false));
            }}
            disabled={isFetching}
          >
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/create-post')}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create post
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Drafts',    value: draftCount,     icon: Clock,     color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Scheduled', value: scheduledCount, icon: Calendar,  color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Published', value: publishedCount, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Failed',    value: failedCount,    icon: XCircle,   color: 'text-rose-600 dark:text-rose-400' },
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

      {/* Posts list */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="icon-container-sm">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            All Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isFetching ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading posts…</span>
            </div>
          ) : (
            <Tabs defaultValue="draft">
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="text-xs gap-1.5">
                  All
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{posts.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-xs gap-1.5">
                  Drafts
                  {draftCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {draftCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="text-xs gap-1.5">
                  Scheduled
                  {scheduledCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {scheduledCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="published" className="text-xs gap-1.5">
                  Published
                  {publishedCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{publishedCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="failed" className="text-xs gap-1.5">
                  Failed
                  {failedCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                      {failedCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {(['all', 'draft', 'scheduled', 'published', 'failed'] as StatusFilter[]).map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {filtered(tab).length === 0 ? (
                    <EmptyState label={tab} />
                  ) : (
                    <div className="space-y-2">
                      {filtered(tab).map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onDelete={handleDelete}
                          onPublish={handlePublish}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

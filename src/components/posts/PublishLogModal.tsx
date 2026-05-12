import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { postsAPI, type PostPublishLog } from '@/lib/api';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishLogModalProps {
  postId: string | null;
  onClose: () => void;
}

export function PublishLogModal({ postId, onClose }: PublishLogModalProps) {
  const [logs, setLogs] = useState<PostPublishLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    postsAPI.getLogs(postId)
      .then(data => setLogs(data.logs ?? []))
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) {
          setLogs([]);
        } else {
          setError('Could not load publish history.');
        }
      })
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <Dialog open={Boolean(postId)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish History</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-destructive py-4 text-center">{error}</p>
        )}

        {!loading && !error && logs.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No publish attempts recorded yet.
          </p>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                    {log.status === 'failed'  && <XCircle    className="h-4 w-4 text-red-500 shrink-0" />}
                    {log.status === 'timeout' && <Clock      className="h-4 w-4 text-amber-500 shrink-0" />}
                    <span className="font-medium">Attempt {log.attempt_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {log.http_status && (
                      <Badge variant="outline" className={cn(
                        'text-[10px] px-1.5 py-0',
                        log.http_status < 300 ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700',
                      )}>
                        HTTP {log.http_status}
                      </Badge>
                    )}
                    <span>{format(new Date(log.created_at), 'MMM d, h:mm:ss a')}</span>
                  </div>
                </div>

                {log.linkedin_urn && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-green-600">Published: </span>
                    <span className="font-mono text-[11px]">{log.linkedin_urn}</span>
                  </p>
                )}

                {log.error_code && (
                  <p className="text-xs text-red-600 mt-1">
                    <span className="font-semibold">{log.error_code}:</span>{' '}
                    {log.error_message ?? 'No details available'}
                  </p>
                )}

                {log.duration_ms != null && (
                  <p className="text-[11px] text-muted-foreground mt-1">{log.duration_ms}ms</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

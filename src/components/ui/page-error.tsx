import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function PageError({
  title = 'Something went wrong',
  message = 'Failed to load data.',
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center text-center gap-3',
        className,
      )}
    >
      <div className="icon-container bg-destructive/10 text-destructive">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

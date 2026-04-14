import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: React.ElementType };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 gap-3',
        className,
      )}
    >
      <div className="icon-container mx-auto">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} className="gap-1.5 mt-1">
          {action.icon && <action.icon className="h-3.5 w-3.5" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

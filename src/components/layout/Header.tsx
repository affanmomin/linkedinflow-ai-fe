import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();
  const { linkedInStatus } = useLinkedInStore();
  const linkedInConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);

  return (
    <header className="h-14 border-b border-border bg-background shrink-0 flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-8 w-8 p-0"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* LinkedIn status indicator */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className={cn(
            'h-2 w-2 rounded-full',
            linkedInConnected ? 'bg-emerald-500' : 'bg-muted-foreground/40'
          )} />
          <span className="text-xs text-muted-foreground">
            {linkedInConnected ? 'LinkedIn connected' : 'LinkedIn disconnected'}
          </span>
        </div>

        <div className="h-4 w-px bg-border hidden md:block" />

        <ThemeToggle />

        <div className="h-4 w-px bg-border" />

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

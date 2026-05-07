import { Bell, CalendarDays, Menu, Search, Sparkles, Check, XCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const routeTitles: Record<string, string> = {
  '/':                  'Dashboard',
  '/posts':            'Posts',
  '/content-calendar': 'Planner',
  '/create-post':      'Create Post',
  '/analytics':        'Analytics',
  '/linkedin-vault':   'LinkedIn Vault',
  '/automation':       'Automation',
  '/settings':         'Settings',
};

const topTabs = [
  { label: 'Overview', href: '/' },
  { label: 'Posts', href: '/posts' },
  { label: 'Planner', href: '/content-calendar' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Automation', href: '/automation' },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();
  const { linkedInStatus, notifications, markAllNotificationsRead, clearNotifications } = useLinkedInStore();
  const location = useLocation();
  const navigate = useNavigate();
  const connected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);
  const pageTitle = routeTitles[location.pathname] ?? '';
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const notificationIcon = (type: 'success' | 'error' | 'info') => {
    if (type === 'success') return Check;
    if (type === 'error') return XCircle;
    return Info;
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[#dce6f1] bg-[#f8f9fb]/95 px-4 py-4 backdrop-blur-lg lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-xl p-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="min-w-[180px]">
          <span className="block text-[32px] font-semibold tracking-tight text-foreground leading-none">{pageTitle}</span>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-2 lg:px-6">
          <div className="relative w-full max-w-[520px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search"
              placeholder="Search"
              className="h-11 rounded-full border border-border bg-card pl-10 pr-4 text-sm shadow-[var(--shadow-xs)]"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-full"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-0">
              <div className="flex items-center justify-between px-3 py-2.5">
                <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
                {notifications.length > 0 && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={markAllNotificationsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <ScrollArea className="max-h-[360px]">
                  <div className="space-y-0 p-1">
                    {notifications.slice(0, 8).map((notification) => {
                      const Icon = notificationIcon(notification.type);
                      return (
                        <DropdownMenuItem
                          key={notification.id}
                          className={cn(
                            'flex items-start gap-3 rounded-xl px-3 py-3 focus:bg-muted',
                            !notification.read && 'bg-muted/40',
                          )}
                        >
                          <div className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            notification.type === 'success' && 'bg-primary/10 text-primary',
                            notification.type === 'error' && 'bg-destructive/10 text-destructive',
                            notification.type === 'info' && 'bg-tertiary/15 text-tertiary',
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                              {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bell className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">No notifications yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Published and failed posts will appear here.</p>
                </div>
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="flex items-center justify-between px-3 py-2">
                    <button
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={clearNotifications}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear all
                    </button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex h-10 w-10 rounded-full"
            onClick={() => navigate('/dashboard/content-calendar')}
            aria-label="Open calendar"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden xl:inline-flex h-10 rounded-full px-4"
            onClick={() => navigate('/dashboard/create-post')}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Create
          </Button>

          <ThemeToggle />

          <div
            role="status"
            aria-label={connected ? 'LinkedIn account connected' : 'LinkedIn account not connected'}
            className="hidden xl:flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs shadow-[var(--shadow-xs)]"
          >
            <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', connected ? 'bg-primary' : 'bg-muted-foreground/50')} />
            <span className="font-medium text-foreground">{connected ? 'Connected' : 'Not connected'}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-[var(--shadow-xs)]">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 hidden lg:flex items-center gap-6 border-t border-border pt-3">
        {topTabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'relative pb-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'text-foreground after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:rounded-full after:bg-primary',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

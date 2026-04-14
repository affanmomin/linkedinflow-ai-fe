import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  LogOut,
  X,
  Linkedin,
  Share2,
  LineChart,
  Lock,
  Sliders,
  Zap,
  FileText,
  CalendarDays,
  FileUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navSections = [
  {
    label: 'Workspace',
    items: [
      { title: 'Dashboard',   href: '/',                 icon: LayoutDashboard },
      { title: 'Posts',       href: '/posts',            icon: FileText        },
      { title: 'Import Posts',href: '/posts?import=1',   icon: FileUp          },
      { title: 'Planner',     href: '/content-calendar', icon: CalendarDays    },
      { title: 'Create Post', href: '/create-post',      icon: Share2          },
    ],
  },
  {
    label: 'Insights',
    items: [
      { title: 'Analytics',      href: '/analytics',      icon: LineChart },
      { title: 'LinkedIn Vault', href: '/linkedin-vault', icon: Lock      },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Automation', href: '/automation', icon: Zap     },
      { title: 'Settings',   href: '/settings',   icon: Sliders },
    ],
  },
];

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user }          = useAuthStore();
  const { posts } = useLinkedInStore();

  const draftCount     = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

  const badgeFor = (href: string) => {
    if (href === '/posts' && draftCount + scheduledCount > 0)
      return draftCount + scheduledCount;
    return null;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-[280px] flex flex-col overflow-hidden lg:overflow-visible',
          'border-r border-white/10 bg-[#050607] text-white backdrop-blur-xl',
          'lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-[28px] lg:border lg:border-white/10 lg:shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
          isCollapsed ? 'lg:w-[90px]' : 'lg:w-[250px]',
          'transition-transform duration-200 ease-in-out lg:sticky lg:top-4 lg:self-start lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute right-0 translate-x-1/2 top-20 z-20 h-9 w-9 items-center justify-center rounded-full border-2 border-lime-300/45 bg-[#0d1117] text-lime-300 shadow-[0_8px_18px_rgba(0,0,0,0.45)] ring-2 ring-black/40 hover:bg-[#151b24] hover:text-lime-200 hover:border-lime-300/70 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        {/* Brand */}
        <div className={cn('flex h-16 items-center border-b border-white/10 shrink-0', isCollapsed ? 'justify-center px-2' : 'justify-between px-5')}>
          <button
            className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}
            onClick={() => { navigate('/'); setIsOpen(false); }}
            aria-label="Go to Dashboard"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-lime-300 shadow-sm shrink-0">
              <Linkedin className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="text-left leading-tight">
                <span className="block text-sm font-semibold text-white">LinkedInFlow</span>
                <span className="block text-[11px] text-white/55">Control center</span>
              </div>
            )}
          </button>

          <button
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-hidden pt-4 pb-3', isCollapsed ? 'px-2 space-y-4' : 'px-4 space-y-5')}>
          {navSections.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="section-label mb-2 px-2 text-white/45">
                  {section.label}
                </p>
              )}
              <div className={cn(isCollapsed ? 'space-y-2' : 'space-y-1')}>
                {section.items.map((item) => {
                  const itemPath = item.href.split('?')[0];
                  const isActive = location.pathname === itemPath;
                  const badge    = badgeFor(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'sidebar-item',
                        isCollapsed && 'mx-auto h-10 w-10 justify-center rounded-full !px-0',
                        isActive && 'active',
                      )}
                      title={item.title}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="flex-1">{item.title}</span>}
                      {badge !== null && !isCollapsed && (
                        <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-lime-300/20 text-lime-300 text-[10px] font-semibold px-1 leading-none">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Account */}
        <div className={cn('shrink-0 border-t border-white/10 space-y-2', isCollapsed ? 'p-2' : 'p-4')}>
          <div className={cn('flex rounded-2xl border border-white/10 bg-white/5', isCollapsed ? 'items-center justify-center px-2 py-3' : 'items-center gap-3 px-3 py-3')}>
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-lime-300 ring-2 ring-lime-300/30">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-white/55 truncate">{user?.email || ''}</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={cn('sidebar-item w-full', isCollapsed ? 'justify-center px-2' : 'justify-start')}
            title="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

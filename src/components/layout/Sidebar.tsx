import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  LogOut,
  X,
  Linkedin,
  Share2,
  Database,
  LineChart,
  Lock,
  Sliders,
  Zap,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useLinkedInStore } from '@/store/useLinkedInStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { posts } = useLinkedInStore();
  const pendingCount = posts.filter(p => p.status === 'draft' || p.status === 'scheduled').length;

  const navSections = [
    {
      label: 'Main',
      items: [
        { title: 'Dashboard',   href: '/',            icon: LayoutDashboard },
        { title: 'Create Post', href: '/create-post', icon: Share2 },
        { title: 'Posts',       href: '/posts',       icon: FileText, badge: pendingCount > 0 ? pendingCount : null },
      ],
    },
    {
      label: 'Data',
      items: [
        // { title: 'Data Management', href: '/data-management', icon: Database },
        { title: 'Analytics',       href: '/analytics',       icon: LineChart },
        { title: 'LinkedIn Vault',  href: '/linkedin-vault',  icon: Lock },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { title: 'Automation', href: '/automation', icon: Zap },
        { title: 'Settings',   href: '/settings',   icon: Sliders },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-60 flex flex-col',
          'bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]',
          'transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Linkedin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">LinkedInFlow</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-7 w-7 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {'badge' in item && item.badge ? (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-semibold px-1">
                            {item.badge}
                          </span>
                        ) : null}
                        {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="shrink-0 border-t border-border p-3 space-y-1">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

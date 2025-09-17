import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-64 border-0 bg-muted/50 focus:bg-background"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BentoCard({ children, className, onClick }: BentoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-4',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Spotlight effect on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.06),transparent_60%)]" />
      </div>
      {children}
    </div>
  );
}

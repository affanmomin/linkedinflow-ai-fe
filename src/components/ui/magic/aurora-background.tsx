import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div className={cn('relative flex flex-col', className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute -inset-[10px] opacity-40 dark:opacity-30 blur-[60px]',
            '[background:repeating-linear-gradient(100deg,hsl(var(--primary)/0.15)_0%,hsl(201_100%_70%/0.1)_7%,transparent_10%,transparent_12%,hsl(var(--primary)/0.08)_16%),repeating-linear-gradient(100deg,hsl(var(--primary)/0.1)_0%,hsl(201_100%_80%/0.08)_5%,transparent_10%)]',
            '[background-size:300%,_200%]',
            '[background-position:50%_50%,50%_50%]',
            'animate-aurora',
          )}
        />
        {showRadialGradient && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.06),transparent)]" />
        )}
      </div>
      {children}
    </div>
  );
}

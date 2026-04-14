import { cn } from '@/lib/utils';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'animate-shimmer bg-[length:200%_auto] bg-clip-text text-transparent',
        'bg-gradient-to-r from-primary via-sky-400 to-primary',
        className,
      )}
    >
      {children}
    </span>
  );
}

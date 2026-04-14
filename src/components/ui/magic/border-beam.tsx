import { cn } from '@/lib/utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  anchor?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = '#0ea5e9',
  colorTo = '#6366f1',
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          '--size': size,
          '--duration': duration,
          '--anchor': anchor,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]',
        '[background:linear-gradient(transparent,transparent),linear-gradient(to_right,var(--color-from),var(--color-to))]',
        '[background-clip:padding-box,border-box] [background-origin:padding-box,border-box]',
        '[mask:linear-gradient(transparent,transparent),conic-gradient(from_calc(var(--anchor)*1deg),transparent_calc(0.5*360deg/var(--size)),white_calc(360deg/var(--size)),transparent_calc(1.5*360deg/var(--size)))]',
        '[mask-composite:intersect]',
        'animate-border-beam',
        className,
      )}
    />
  );
}

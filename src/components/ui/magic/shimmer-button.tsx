import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children: React.ReactNode;
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '100px',
      background = 'hsl(var(--primary))',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as React.CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-shadow duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(10,102,194,0.4)] active:scale-[0.98]',
          'before:absolute before:inset-0 before:overflow-hidden before:[border-radius:var(--radius)] before:[container-type:inline-size]',
          'before:translate-x-[-100%] before:animate-shimmer-slide before:[background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]',
          '[--duration:3] before:[aspect-ratio:1] before:w-[100cqw] before:[translate:0_-100%]',
          className,
        )}
        ref={ref}
        {...props}
      >
        <span className="z-10 w-48 whitespace-pre text-center text-sm font-semibold leading-none tracking-tight text-white">
          {children}
        </span>
        <div
          className={cn(
            'absolute inset-0 z-10 overflow-hidden [border-radius:var(--radius)]',
            'after:absolute after:inset-[var(--cut)] after:[background:var(--bg)] after:[border-radius:var(--radius)]',
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = 'ShimmerButton';

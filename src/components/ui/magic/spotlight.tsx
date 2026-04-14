import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = 'hsl(var(--primary))' }: SpotlightProps) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute z-[1] h-[169%] w-[138%] animate-spotlight opacity-0 lg:w-[84%]',
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse cx="1924.71" cy="273.501" rx="1924.71" ry="273.501" transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)" fill={fill} fillOpacity="0.21" />
      </g>
      <defs>
        <filter id="filter" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
}

interface MouseSpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export function MouseSpotlight({ children, className }: MouseSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', () => setVisible(true));
    el.addEventListener('mouseleave', () => setVisible(false));
    return () => {
      el.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {visible && (
        <div
          className="pointer-events-none absolute z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.08),transparent_70%)] transition-opacity duration-300"
          style={{ left: pos.x, top: pos.y }}
        />
      )}
      {children}
    </div>
  );
}

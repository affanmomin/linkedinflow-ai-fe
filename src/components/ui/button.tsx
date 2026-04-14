import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-black/30',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:translate-y-[-1px] hover:shadow-[0_5px_0_rgba(0,0,0,0.45)]',
        destructive:
          'bg-rose-600 text-white shadow-[0_3px_0_rgba(136,19,55,0.45)] hover:translate-y-[-1px]',
        outline:
          'bg-white text-black shadow-[0_2px_0_rgba(0,0,0,0.22)] hover:bg-black/5',
        secondary:
          'bg-lime-200 text-black shadow-[0_2px_0_rgba(0,0,0,0.25)] hover:bg-lime-300',
        ghost: 'border-transparent text-black hover:bg-black/5',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

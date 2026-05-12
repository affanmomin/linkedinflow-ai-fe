import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-[#e0dfdc]',
  {
    variants: {
      variant: {
        default:
          'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-[0_4px_20px_rgba(10,102,194,0.24)]',
        destructive:
          'bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-[0_4px_20px_rgba(239,68,68,0.2)]',
        outline:
          'bg-[#f3f2ee] text-[#191919] border-[#e0dfdc] hover:bg-[#eef3f8] shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
        secondary:
          'bg-[#eef3f8] text-[#0a66c2] border-[#dce6f1] hover:bg-[#dce6f1] shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
        ghost: 'border-transparent text-[#191919] hover:bg-[#eef3f8]',
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

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-prodet-blue bg-prodet-blue text-white shadow-[0_2px_8px_rgba(9,82,150,0.18)] hover:bg-prodet-blue-hover hover:border-prodet-blue-hover active:bg-prodet-blue-press',
        quote:
          'border border-prodet-blue bg-prodet-blue text-white shadow-[0_2px_8px_rgba(9,82,150,0.18)] hover:bg-prodet-blue-hover hover:border-prodet-blue-hover active:bg-prodet-blue-press',
        success:
          'border border-prodet-green bg-prodet-green text-white hover:bg-prodet-green-hover hover:border-prodet-green-hover',
        navy:
          'border border-[var(--color-surface-navy)] bg-[var(--color-surface-navy)] text-white hover:bg-[var(--color-surface-navy-soft)]',
        dark:
          'border border-[var(--color-surface-navy)] bg-[var(--color-surface-navy)] text-white hover:bg-[var(--color-surface-navy-soft)]',
        secondary:
          'border border-prodet-line bg-prodet-blue-tint text-prodet-blue hover:bg-prodet-blue-tint-strong',
        outline:
          'border border-prodet-blue bg-transparent text-prodet-blue hover:bg-prodet-blue-tint active:bg-prodet-blue-tint-strong',
        neutral:
          'border border-prodet-line bg-white text-prodet-text hover:border-prodet-blue-tint-strong hover:bg-prodet-blue-tint',
        ghost: 'text-prodet-text hover:bg-prodet-blue-tint hover:text-prodet-blue',
        destructive:
          'border border-[var(--color-danger)] bg-[var(--color-danger)] text-white hover:opacity-90',
        inverse:
          'border border-white/80 bg-white text-prodet-blue hover:bg-white/90',
        link: 'h-auto rounded-none px-0 text-prodet-blue underline-offset-4 hover:text-prodet-blue-hover hover:underline',
      },
      size: {
        xs: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

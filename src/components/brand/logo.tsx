import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-9 w-[146px]',
  md: 'h-11 w-[182px]',
  lg: 'h-14 w-[228px]',
};

export function Logo({ className, size = 'md', ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 520 180"
      role="img"
      aria-label="Prodet Tunisie"
      className={cn('overflow-visible', sizeClasses[size], className)}
      {...props}
    >
      <title>Prodet Tunisie</title>
      <path
        d="M76 108C170 22 370 -8 470 56"
        fill="none"
        stroke="var(--color-primary)"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path
        d="M138 132C190 182 340 182 410 132"
        fill="none"
        stroke="var(--color-support)"
        strokeLinecap="round"
        strokeWidth="9"
      />
      <path
        d="M320 56l8 14 14 8-14 8-8 14-8-14-14-8 14-8z"
        fill="var(--color-accent)"
      />
      <path d="M356 48l5 8 8 5-8 5-5 8-5-8-8-5 8-5z" fill="var(--color-accent)" />
      <text
        x="94"
        y="126"
        fill="var(--color-primary)"
        fontFamily="var(--font-display)"
        fontSize="112"
        fontWeight="700"
        letterSpacing="-0.08em"
      >
        Prodet
      </text>
    </svg>
  );
}

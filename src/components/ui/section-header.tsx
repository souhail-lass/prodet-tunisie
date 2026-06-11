import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const sectionHeaderVariants = cva('flex gap-5', {
  variants: {
    align: {
      start: 'items-start text-start',
      center: 'items-center text-center',
      split: 'items-start justify-between text-start',
    },
    tone: {
      default: 'text-foreground',
      inverse: 'text-white',
    },
    spacing: {
      default: 'mb-8 lg:mb-10',
      compact: 'mb-5 lg:mb-7',
      none: 'mb-0',
    },
  },
  compoundVariants: [
    {
      align: 'center',
      class: 'mx-auto max-w-3xl flex-col',
    },
    {
      align: 'start',
      class: 'max-w-3xl flex-col',
    },
    {
      align: 'split',
      class: 'flex-col sm:flex-row sm:items-end',
    },
  ],
  defaultVariants: {
    align: 'start',
    tone: 'default',
    spacing: 'default',
  },
});

type HeadingLevel = 1 | 2 | 3;

export interface SectionHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof sectionHeaderVariants> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  level?: HeadingLevel;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  level = 2,
  align,
  tone,
  spacing,
  className,
  titleClassName,
  descriptionClassName,
  ...props
}: SectionHeaderProps) {
  const Heading = `h${level}` as ElementType;
  const isInverse = tone === 'inverse';

  return (
    <header
      className={cn(sectionHeaderVariants({ align, tone, spacing, className }))}
      {...props}
    >
      <div className={cn(align === 'split' && 'max-w-3xl')}>
        {eyebrow ? (
          <p className={cn('eyebrow-label', isInverse && '!text-prodet-sky')}>{eyebrow}</p>
        ) : null}
        <Heading
          className={cn(
            'public-section-title',
            eyebrow && 'mt-3',
            isInverse && '!text-white',
            titleClassName,
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p
            className={cn(
              'public-subtitle mt-4',
              isInverse && '!text-white/78',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

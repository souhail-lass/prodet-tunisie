import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

interface ProdetPackshotProps {
  title: string;
  subtitle: string;
  weightLabel: string;
  manufacturedByLabel: string;
  className?: string;
  compact?: boolean;
}

export function ProdetPackshot({
  title,
  subtitle,
  weightLabel,
  manufacturedByLabel,
  className,
  compact = false,
}: ProdetPackshotProps) {
  return (
    <div
      className={cn(
        'relative mx-auto aspect-[10/12] w-full',
        compact ? 'max-w-[250px]' : 'max-w-[410px]',
        className,
      )}
    >
      <div className="absolute start-[15%] top-[2%] h-[11%] w-[24%] rounded-[1rem] border-[1.5px] border-border bg-white shadow-industrial" />
      <div className="absolute inset-x-[7%] bottom-[2%] top-[10%] rounded-[2.5rem] border-[1.5px] border-border bg-white shadow-industrial" />
      <div className="absolute end-[9%] top-[11%] h-[18%] w-[31%] rounded-[2rem] border-[1.5px] border-border bg-white shadow-industrial">
        <div className="absolute inset-[19%] rounded-[1.4rem] bg-background" />
      </div>

      <div className="absolute inset-x-[18%] bottom-[17%] top-[34%] overflow-hidden rounded-[1.5rem] border-[1.5px] border-border bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,1)_0%,rgba(247,250,253,1)_62%,rgba(228,239,248,1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-primary" />
        <div className="absolute bottom-0 end-0 h-[54%] w-[28%] bg-[var(--color-primary-strong)] [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)]" />
        <div className="absolute inset-x-[11%] top-[14%]">
          <p className="font-display text-primary text-[clamp(1.2rem,2vw,1.7rem)] font-bold tracking-[-0.06em] uppercase">
            {title}
          </p>
          <p className="text-primary mt-3 text-sm font-medium">{subtitle}</p>
          <div className="catalog-divider mt-6" />
        </div>
        <div className="absolute inset-x-[11%] bottom-[12%] flex items-end justify-between gap-4">
          <div>
            <p className="product-code text-white/84">{manufacturedByLabel}</p>
            <Logo size="sm" className="mt-3 h-7 w-[110px]" />
          </div>
          <p className="font-display tabular text-[clamp(1.4rem,2vw,2rem)] font-semibold text-white">
            {weightLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

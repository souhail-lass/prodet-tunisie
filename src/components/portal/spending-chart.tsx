'use client';

import { useMemo, useState } from 'react';
import type { MonthlySpend } from '@/features/client-portal/spending';

const moneyFmt = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 });

/**
 * 12-month spending bars — pure CSS (no chart dependency). Bars grow in with
 * a staggered reveal; the active (hovered or current) month shows its amount
 * in the header readout.
 */
export function SpendingChart({
  monthly,
  currency,
  locale,
  title,
}: {
  monthly: MonthlySpend[];
  currency: string;
  locale: string;
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const months = useMemo(() => {
    const monthFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'fr', {
      month: 'short',
      timeZone: 'UTC',
    });
    const longFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'fr', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return monthly.map((m) => {
      const date = new Date(`${m.key}-01T00:00:00Z`);
      return { ...m, short: monthFmt.format(date), long: longFmt.format(date) };
    });
  }, [monthly, locale]);

  const max = Math.max(...monthly.map((m) => m.total), 1);
  const current = months.length - 1;
  const shown = active ?? current;
  const readout = months[shown];

  return (
    <figure className="fin-chart" aria-label={title}>
      <figcaption className="fin-chart__readout" aria-live="polite">
        <span className="fin-chart__readout-month">{readout?.long}</span>
        <span className="fin-chart__readout-value">
          {moneyFmt.format(readout?.total ?? 0)} <small>{currency}</small>
        </span>
      </figcaption>
      <div className="fin-chart__bars" onPointerLeave={() => setActive(null)}>
        {months.map((m, i) => (
          <button
            key={m.key}
            type="button"
            className={`fin-chart__col${i === shown ? ' is-active' : ''}${i === current ? ' is-current' : ''}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`${m.long} — ${moneyFmt.format(m.total)} ${currency}`}
          >
            <span
              className="fin-chart__bar"
              style={{
                height: `${Math.max((m.total / max) * 100, m.total > 0 ? 4 : 1.5)}%`,
                animationDelay: `${i * 45}ms`,
              }}
            />
            <span className="fin-chart__month">{m.short}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}

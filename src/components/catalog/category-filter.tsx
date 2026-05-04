import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import type { ProductCategory } from '@/data/types';
import { localizedCategoryName } from '@/data/queries';
import { cn } from '@/lib/utils';

export function CategoryFilter({
  categories,
  locale,
  activeCategoryKey,
}: {
  categories: readonly ProductCategory[];
  locale: Locale;
  activeCategoryKey?: string;
}) {
  const t = useTranslations('common.labels');
  return (
    <nav aria-label={t('filterByCategory')} className="flex flex-wrap gap-2">
      <CategoryChip href="/catalogue" label={t('categoryAll')} active={!activeCategoryKey} />
      {categories.map((c) => (
        <CategoryChip
          key={c.key}
          href={`/catalogue/categorie/${c.slug}`}
          label={localizedCategoryName(c, locale)}
          active={activeCategoryKey === c.key}
        />
      ))}
    </nav>
  );
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      {label}
    </Link>
  );
}

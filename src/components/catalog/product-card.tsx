import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { localizedProductName } from '@/data/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = useTranslations('common');
  const tCat = useTranslations('catalogue.page');
  const name = localizedProductName(product, locale);
  const description = product.shortDescByLocale[locale];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <p className="text-primary text-xs font-medium tracking-wider uppercase">
          {tCat('manufacturedBadge')}
        </p>
        <CardTitle>
          <Link href={`/catalogue/${product.slug}`} className="hover:underline">
            {name}
          </Link>
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {t('labels.code')}&nbsp;: {product.code} · {product.conditionnement}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-muted-foreground text-sm">{description}</p>
        <div className="mt-auto flex items-center justify-between">
          <Link
            href={`/catalogue/${product.slug}`}
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            {t('actions.viewDetails')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

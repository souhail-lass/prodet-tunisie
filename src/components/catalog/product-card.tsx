import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { localizedProductName } from '@/data/queries';
import { ProductVisual } from '@/components/catalog/product-visual';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = useTranslations('common');
  const name = localizedProductName(product, locale);
  const description = product.shortDescByLocale[locale];

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      <CardHeader className="p-0">
        <ProductVisual product={product} locale={locale} className="aspect-[4/3] rounded-none border-0" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="product-code text-primary">{product.code}</p>
          <span className="bg-secondary text-muted-foreground rounded-full px-3 py-1 text-xs">
            {product.conditionnement}
          </span>
        </div>

        <div>
          <CardTitle className="text-xl">
            <Link href={`/catalogue/${product.slug}`} className="hover:underline">
              {name}
            </Link>
          </CardTitle>
          <p className="text-muted-foreground mt-3 text-sm leading-7">{description}</p>
        </div>

        <p className="text-muted-foreground text-xs">
          {t('labels.unit')}&nbsp;: <span className="tabular">{product.unitOfSale}</span>
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href={`/devis?product=${product.slug}`}>{t('actions.requestQuote')}</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full px-4">
            <Link href={`/catalogue/${product.slug}`}>
              {t('actions.viewDetails')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

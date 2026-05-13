import { FileText } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { siteContent } from '@/data/site-content';
import { ProductVisual } from '@/components/catalog/product-visual';
import { Button } from '@/components/ui/button';
import { QuoteButton } from '@/components/ui/quote-modal';
import { CertificationsBadges } from './certifications-badges';

export function ProductHero({
  product,
  useCaseLabel,
}: {
  product: Product;
  useCaseLabel: string;
}) {
  const copy = siteContent.product;
  const badgeLabel =
    product.category === 'manufactured' ? copy.badgeManufactured : copy.badgeCommercialized;
  const defaultProductSelection = [product.name, product.formats[0]?.label].filter(Boolean).join(' — ');

  return (
    <section id="product-hero" className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div>
        <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
          <ProductVisual product={product} priority className="aspect-[4/5] rounded-none" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{copy.imageCaption}</p>
      </div>

      <div>
        <nav className="text-sm text-muted-foreground">
          <Link href="/catalogue" className="cursor-pointer hover:text-primary">
            Catalogue
          </Link>
          <span className="mx-2">›</span>
          <span>{useCaseLabel}</span>
          <span className="mx-2">›</span>
          <span className="text-prodet-text">{product.name}</span>
        </nav>

        <span className="mt-5 inline-flex rounded-full bg-[#EAF7EF] px-3 py-1 text-xs font-semibold text-support">
          {badgeLabel}
        </span>
        <h1 className="mt-4 text-3xl font-bold text-prodet-text lg:text-[32px]">{product.name}</h1>
        <p className="mt-3 text-[17px] leading-7 text-muted-foreground">{product.tagline}</p>

        <div className="mt-6 border-t border-border pt-6">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">Format</th>
                <th className="pb-2 font-medium">Code (réf. Prodet)</th>
              </tr>
            </thead>
            <tbody>
              {product.formats.map((format) => (
                <tr key={format.label} className="rounded-xl bg-secondary">
                  <td className="rounded-s-xl px-4 py-3 font-medium text-prodet-text">
                    {format.label}
                  </td>
                  <td className="rounded-e-xl px-4 py-3 text-muted-foreground">
                    {format.code ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="grid gap-3">
            <QuoteButton
              productName={defaultProductSelection}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em]"
            >
              {copy.stickyCta}
            </QuoteButton>

            {product.technicalSheetUrl ? (
              <Button asChild variant="outline" className="w-full rounded-full px-6 py-3 text-sm font-semibold">
                <a href={product.technicalSheetUrl} download>
                  <FileText className="h-4 w-4" aria-hidden />
                  Télécharger la fiche technique
                </a>
              </Button>
            ) : (
              <QuoteButton
                productName={defaultProductSelection}
                variant="outline"
                className="w-full rounded-full px-6 py-3 text-sm font-semibold"
              >
                {copy.technicalSheetFallback}
              </QuoteButton>
            )}
          </div>
        </div>

        <div className="mt-6">
          <CertificationsBadges product={product} />
        </div>
      </div>
    </section>
  );
}

import { Link, type Locale } from '@/i18n/routing';

interface ProductBreadcrumbProps {
  locale: Locale;
  productName: string;
}

export function ProductBreadcrumb({ locale, productName }: ProductBreadcrumbProps) {
  const rootLabel = locale === 'en' ? 'All Products' : 'Tous les produits';
  const ariaLabel = locale === 'en' ? 'Breadcrumb' : 'Fil d’Ariane';

  return (
    <nav aria-label={ariaLabel} className="text-[13px] font-medium">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/catalogue" className="text-[#1F9C49] transition-colors hover:text-[#1B5FA7]">
            {rootLabel}
          </Link>
        </li>
        <li className="text-[#9CA3AF]" aria-hidden>
          /
        </li>
        <li className="text-[#6B7280]" aria-current="page">
          {productName}
        </li>
      </ol>
    </nav>
  );
}

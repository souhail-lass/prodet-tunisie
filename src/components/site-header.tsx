import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const t = useTranslations('common');
  const tHeader = useTranslations('header');

  const nav = [
    { href: '/catalogue', label: t('navigation.catalog') },
    { href: '/secteurs', label: t('navigation.sectors') },
    { href: '/a-propos', label: t('navigation.about') },
    { href: '/contact', label: t('navigation.contact') },
  ] as const;

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-md focus:px-3 focus:py-2"
      >
        {tHeader('skipToContent')}
      </a>
      <div className="mx-auto flex h-16 max-w-(--container-2xl) items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-foreground text-lg font-semibold tracking-tight">
          {t('site.name')}
        </Link>
        <nav aria-label={tHeader('primaryNavLabel')} className="hidden flex-1 md:block">
          <ul className="flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <LocaleSwitcher />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/devis">{t('actions.requestQuote')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

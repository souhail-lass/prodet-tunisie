import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';
import { getPublicEnv } from '@/lib/env';
import { WhatsAppLink } from '@/components/whatsapp-link';

const mobileNavByLocale = {
  fr: ['Catalogue', 'Secteurs', 'À propos', 'Contact'],
  en: ['Catalog', 'Sectors', 'About', 'Contact'],
  ar: ['الكتالوج', 'القطاعات', 'من نحن', 'اتصال'],
} as const;

export function SiteHeader() {
  const t = useTranslations('common');
  const tHeader = useTranslations('header');
  const locale = useLocale() as keyof typeof mobileNavByLocale;
  const env = getPublicEnv();
  const hasWhatsApp = Boolean(env.NEXT_PUBLIC_DEFAULT_WHATSAPP_E164);

  const nav = [
    { href: '/catalogue', label: t('navigation.catalog') },
    { href: '/secteurs', label: t('navigation.sectors') },
    { href: '/a-propos', label: t('navigation.about') },
    { href: '/contact', label: t('navigation.contact') },
  ] as const;

  return (
    <header className="border-border/80 bg-background/94 supports-[backdrop-filter]:bg-background/84 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-md focus:px-3 focus:py-2"
      >
        {tHeader('skipToContent')}
      </a>
      <div className="section-shell flex items-center gap-5 py-4">
        <Link href="/" className="shrink-0" aria-label={t('site.name')}>
          <Logo size="md" />
        </Link>
        <nav aria-label={tHeader('primaryNavLabel')} className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground rounded-full px-4 py-2 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          {hasWhatsApp ? (
            <WhatsAppLink
              size="sm"
              variant="ghost"
              className="hidden rounded-full border border-transparent px-3 text-muted-foreground xl:inline-flex"
            />
          ) : null}
          <LocaleSwitcher />
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/devis">{t('actions.requestQuote')}</Link>
          </Button>
        </div>
      </div>
      <nav
        aria-label={tHeader('primaryNavLabel')}
        className="border-border/70 section-shell flex gap-2 overflow-x-auto border-t py-3 lg:hidden"
      >
        {nav.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-border bg-card text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm"
          >
            {mobileNavByLocale[locale][index]}
          </Link>
        ))}
      </nav>
    </header>
  );
}

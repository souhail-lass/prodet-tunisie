import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Separator } from '@/components/ui/separator';

export function SiteFooter() {
  const t = useTranslations('common');
  const tFooter = useTranslations('footer');
  const year = new Date().getFullYear();

  const columns = [
    {
      title: tFooter('company'),
      links: [
        { href: '/a-propos', label: t('navigation.about') },
        { href: '/contact', label: t('navigation.contact') },
      ],
    },
    {
      title: tFooter('catalog'),
      links: [
        { href: '/catalogue', label: t('navigation.catalog') },
        { href: '/devis', label: t('navigation.quote') },
      ],
    },
    {
      title: tFooter('sectors'),
      links: [{ href: '/secteurs', label: t('navigation.sectors') }],
    },
  ] as const;

  return (
    <footer className="border-border bg-secondary/30 mt-24 border-t">
      <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-foreground text-base font-semibold">{t('site.name')}</p>
            <p className="text-muted-foreground mt-3 text-sm">{tFooter('address')}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-foreground text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="text-muted-foreground flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{tFooter('rights', { year })}</p>
          <ul className="flex flex-wrap items-center gap-4">
            <li>
              <Link href="/mentions-legales" className="hover:text-foreground">
                {tFooter('legalLinks.mentions')}
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-foreground">
                {tFooter('legalLinks.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-foreground">
                {tFooter('legalLinks.cookies')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/logo';
import { Separator } from '@/components/ui/separator';

const footerCopy = {
  fr: {
    summary:
      "Une présence web plus claire, plus produit et plus crédible pour les acheteurs B2B de Prodet.",
    proofPills: ['Fabrication tunisienne', 'Devis sur demande', 'Grand Tunis'],
  },
  en: {
    summary:
      'A clearer, more product-led and more credible web presence for Prodet’s B2B buyers.',
    proofPills: ['Made in Tunisia', 'Quote on request', 'Greater Tunis'],
  },
  ar: {
    summary: 'حضور ويب أوضح وأكثر تركيزًا على المنتج وأكثر مصداقية لمشتري Prodet المهنيين.',
    proofPills: ['تصنيع تونسي', 'عرض سعر عند الطلب', 'تونس الكبرى'],
  },
} as const;

export function SiteFooter() {
  const t = useTranslations('common');
  const tFooter = useTranslations('footer');
  const locale = useLocale() as keyof typeof footerCopy;
  const copy = footerCopy[locale];
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
    <footer className="border-border/80 bg-secondary/36 mt-20 border-t">
      <div className="section-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo size="md" />
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-7">{copy.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {copy.proofPills.map((pill) => (
                <li
                  key={pill}
                  className="border-border bg-card rounded-full border px-3 py-1 text-xs text-muted-foreground"
                >
                  {pill}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-5 text-sm">{tFooter('address')}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display text-foreground text-sm font-semibold">{col.title}</p>
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

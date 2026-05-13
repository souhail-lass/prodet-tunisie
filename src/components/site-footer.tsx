import { Link } from '@/i18n/routing';
import { companyInfo } from '@/data/company';
import { Logo } from '@/components/brand/logo';

export function SiteFooter() {
  const columns = [
    {
      title: 'Produits',
      links: [
        { href: '/catalogue?useCase=linge-textiles', label: 'Linge & textiles' },
        { href: '/catalogue?useCase=cuisine-degraissage', label: 'Cuisine & dégraissage' },
        { href: '/catalogue?useCase=surfaces-vitres', label: 'Surfaces & vitres' },
      ],
    },
    {
      title: 'Secteurs',
      links: [
        { href: '/catalogue?sector=hotels', label: 'Hôtels & hébergement' },
        { href: '/catalogue?sector=restaurants-cafes', label: 'Restaurants & cafés' },
        { href: '/secteurs', label: 'Voir tous les secteurs' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { href: '/a-propos', label: 'À propos' },
        { href: '/contact', label: 'Contact' },
      ],
    },
  ] as const;

  return (
    <footer className="mt-20 bg-prodet-navy text-white">
      <div className="section-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Link href="/" className="inline-flex cursor-pointer items-center">
              <Logo size="lg" variant="light" />
            </Link>
            <p className="mt-4 max-w-sm text-[13px] leading-6 text-white/60">{companyInfo.footerTagline}</p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/74">
              Prodet Tunisie présente une gamme de produits d’entretien et d’hygiène pour les
              professionnels, avec des formats lisibles, un contact direct et un devis sur
              demande.
            </p>
            <div className="mt-6 rounded-[24px] border border-white/12 bg-white/8 p-4 text-sm text-white/82">
              <p>{companyInfo.addressFull}</p>
              <p className="mt-2">{companyInfo.phoneDisplay}</p>
              <p className="mt-2">{companyInfo.email}</p>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white/82">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="cursor-pointer text-white/72 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {col.title === 'Contact' ? (
                <Link
                  href="/devis"
                  className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-medium text-white transition-colors hover:bg-white/18 hover:text-white"
                >
                  Demander un devis
                </Link>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-white/12 pt-6 text-xs text-white/62 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {companyInfo.copyrightYear} {companyInfo.name} · Tous droits réservés
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/mentions-legales" className="cursor-pointer hover:text-white">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="cursor-pointer hover:text-white">
              Confidentialité
            </Link>
            <Link href="/cookies" className="cursor-pointer hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getPublicEnv } from '@/lib/env';

const copy = {
  fr: {
    address: "20 Rue de Somalie, L'Aouina",
    hours: 'Lun.–ven. · 8h–17h',
    delivery: 'Livraison Grand Tunis',
    contact: 'Contact direct',
    whatsapp: 'WhatsApp',
  },
  en: {
    address: "20 Rue de Somalie, L'Aouina",
    hours: 'Mon–Fri · 8am–5pm',
    delivery: 'Greater Tunis delivery',
    contact: 'Direct contact',
    whatsapp: 'WhatsApp',
  },
  ar: {
    address: '20 نهج الصومال، العوينة',
    hours: 'الاثنين–الجمعة · 8ص–5م',
    delivery: 'توصيل في تونس الكبرى',
    contact: 'اتصال مباشر',
    whatsapp: 'واتساب',
  },
} as const;

export function TopUtilityBar() {
  const locale = useLocale() as keyof typeof copy;
  const env = getPublicEnv();
  const phone = env.NEXT_PUBLIC_DEFAULT_WHATSAPP_E164?.replace(/[^0-9]/gu, '');
  const t = copy[locale];

  return (
    <div className="border-border/70 bg-card/86 border-b backdrop-blur">
      <div className="section-shell flex flex-wrap items-center gap-x-5 gap-y-1 py-2 text-[0.76rem] text-muted-foreground">
        <span>{t.address}</span>
        <span className="hidden sm:inline">•</span>
        <span className="tabular">{t.hours}</span>
        <span className="hidden sm:inline">•</span>
        <span>{t.delivery}</span>
        <div className="ms-auto flex items-center gap-4">
          {phone ? (
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {t.whatsapp}
            </a>
          ) : (
            <Link href="/contact" className="text-foreground hover:text-primary font-medium">
              {t.contact}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

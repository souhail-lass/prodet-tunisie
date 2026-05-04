import { useTranslations } from 'next-intl';

interface LegalPageProps {
  titleKey: 'mentions.title' | 'privacy.title' | 'cookies.title';
  introKey: 'mentions.intro' | 'privacy.intro' | 'cookies.intro';
}

export function LegalPage({ titleKey, introKey }: LegalPageProps) {
  const t = useTranslations('legal');
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">{t(titleKey)}</h1>
      <p className="text-muted-foreground mt-6">{t(introKey)}</p>
      <p className="text-muted-foreground mt-4 text-sm">{t('comingSoon')}</p>
    </article>
  );
}

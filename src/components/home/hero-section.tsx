import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ProdetPackshot } from '@/components/brand/prodet-packshot';
import { LabelText } from '@/components/typography/label-text';
import { WhatsAppLink } from '@/components/whatsapp-link';
import type { HomeContent } from './content';

export function HeroSection({ content }: { content: HomeContent }) {
  const tCommon = useTranslations('common');

  return (
    <section className="catalog-divider border-border/80 border-b">
      <div className="section-shell py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <LabelText>{content.hero.eyebrow}</LabelText>
            <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold sm:text-5xl lg:text-[3.8rem]">
              {content.hero.title}
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              {content.hero.subtitle}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {content.hero.microClaims.map((claim) => (
                <li
                  key={claim}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {claim}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/devis">{tCommon('actions.requestQuote')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="/catalogue">{tCommon('actions.viewCatalog')}</Link>
              </Button>
              <WhatsAppLink className="rounded-full" />
            </div>
          </div>

          <div className="relative">
            <div className="surface-panel relative overflow-hidden p-4 sm:p-6">
              <div className="grid-blueprint absolute inset-0 opacity-55" />
              <div className="relative">
                <ProdetPackshot
                  title={content.hero.packshotTitle}
                  subtitle={content.hero.packshotSubtitle}
                  weightLabel={content.hero.packshotWeight}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

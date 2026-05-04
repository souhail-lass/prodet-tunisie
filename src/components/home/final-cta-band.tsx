import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ProdetPackshot } from '@/components/brand/prodet-packshot';
import type { HomeContent } from './content';

export function FinalCtaBand({ content }: { content: HomeContent }) {
  const tCommon = useTranslations('common');

  return (
    <section>
      <div className="section-shell py-14">
        <div className="surface-panel-strong grid gap-8 overflow-hidden p-7 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="product-code text-white/70">Devis</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{content.cta.title}</h2>
            <p className="mt-4 max-w-2xl text-white/84">{content.cta.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-6 text-[var(--color-primary-strong)] hover:bg-white/92"
              >
                <Link href="/devis">{tCommon('actions.requestQuote')}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/24 bg-white/10 px-6 text-white hover:bg-white/16 hover:text-white"
              >
                <Link href="/contact">{tCommon('actions.contactUs')}</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[2rem] bg-white/8 blur-2xl" />
            <div className="relative">
              <ProdetPackshot
                compact
                title={content.hero.packshotTitle}
                subtitle={content.hero.packshotSubtitle}
                weightLabel={content.hero.packshotWeight}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

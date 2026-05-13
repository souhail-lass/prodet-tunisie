import { Phone } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { companyInfo } from '@/data/company';
import { siteContent } from '@/data/site-content';
import { Button } from '@/components/ui/button';

export function FinalCtaBand() {
  const copy = siteContent.home.finalCta;

  return (
    <section className="bg-transparent">
      <div className="section-shell py-18 lg:py-20">
        <div className="ink-panel relative overflow-hidden rounded-[40px] px-6 py-8 text-white shadow-[0_34px_72px_-44px_rgba(11,61,115,0.5)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div aria-hidden className="brand-grid absolute inset-0 opacity-10" />
          <div
            aria-hidden
            className="absolute -right-12 top-0 h-64 w-64 rounded-full border border-white/10"
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-prodet-sky/10 blur-3xl"
          />
          <div className="relative grid gap-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/58">
                Demande de devis
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl lg:text-[46px]">
                {copy.title}
              </h2>
              <p className="mt-5 max-w-3xl text-[16px] leading-8 text-white/74">
                {copy.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="cursor-pointer rounded-full bg-white px-6 text-sm font-semibold text-prodet-text hover:bg-[#F1F6FB]"
                >
                  <Link href="/devis">Demander un devis</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/18 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/16 hover:text-white"
                >
                  <a href={companyInfo.phoneHref} className="cursor-pointer">
                    <Phone className="h-4 w-4" aria-hidden />
                    {companyInfo.phoneDisplay}
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/12 bg-white/10 p-6 backdrop-blur-sm sm:p-7">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/58">
                Contact direct
              </p>
              <p className="mt-4 text-base leading-8 text-white/78">{copy.responseLine}</p>
              <div className="mt-8 space-y-3 text-sm text-white/82">
                <p>{companyInfo.addressFull}</p>
                <a
                  href={companyInfo.emailHref}
                  className="block text-white transition-colors hover:text-white"
                >
                  {companyInfo.email}
                </a>
                <a
                  href={companyInfo.phoneHref}
                  className="block tabular text-white transition-colors hover:text-white"
                >
                  {companyInfo.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

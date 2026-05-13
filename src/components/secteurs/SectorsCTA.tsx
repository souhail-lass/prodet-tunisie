import { ClipboardPlus, Phone } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function SectorsCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0D3B73] px-6 py-16 text-center">
      <div
        className="pointer-events-none absolute -right-[150px] -top-[250px] h-[500px] w-[500px] rounded-full bg-[rgba(255,255,255,0.03)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-[560px]">
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#33B5F6]">
          VOTRE SECTEUR N&apos;EST PAS LISTÉ ?
        </p>
        <h2 className="mb-2.5 text-[30px] font-semibold leading-[1.2] text-white">
          Décrivez-nous votre activité
        </h2>
        <p className="mb-9 text-[14px] leading-[1.7] text-[rgba(255,255,255,0.6)]">
          Expliquez-nous votre activité. Nous vous orientons vers les bons formats.
        </p>

        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/devis"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3 text-[14px] font-medium text-[#0D3B73] transition-colors hover:text-[#0D3B73]"
          >
            <ClipboardPlus className="h-[15px] w-[15px]" aria-hidden />
            Demander un devis
          </Link>
          <a
            href="tel:+21671758468"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-[0.5px] border-[rgba(255,255,255,0.35)] bg-transparent px-7 py-3 text-[14px] font-medium text-white transition-colors hover:border-white hover:text-white"
          >
            <Phone className="h-[15px] w-[15px]" aria-hidden />
            71 758 468
          </a>
        </div>
      </div>
    </section>
  );
}

import { ExternalLink, MapPin, Navigation } from 'lucide-react';

const googleMapsHref = 'https://maps.app.goo.gl/JWfu6nT3M3jtCaoB7';
const directionsHref = "https://maps.google.com/maps/dir//Prodet+Tunisie+L'Aouina+Tunis";

export function ContactMapSection() {
  return (
    <section className="bg-[#F8F7F4] pb-0 pt-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mb-6">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B5FA7]">
            NOUS TROUVER
          </p>
          <h2 className="text-[28px] font-semibold leading-[1.2] text-[#1C2B3A]">
            Notre site à L&apos;Aouina, Tunis
          </h2>
        </header>

        <div className="overflow-hidden rounded-[14px] border-[0.5px] border-[#E5E7EB]">
          <iframe
            src="https://www.google.com/maps?q=Prodet%20Tunisie%2C%2020%20Rue%20de%20Somalie%2C%20L%27Aouina%2C%20Tunis%202045&hl=fr&z=16&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Prodet Tunisie — 20 Rue de Somalie, L'Aouina, Tunis"
            className="h-[280px] w-full md:h-[400px]"
          />

          <div className="flex flex-col gap-3 border-t-[0.5px] border-[#E5E7EB] bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <p className="flex items-center gap-2 text-[13px] text-[#374151]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1B5FA7]" aria-hidden />
                20 Rue de Somalie, L&apos;Aouina, Tunis 2045
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <a
                href={googleMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-[0.5px] border-[#1B5FA7] px-4 py-2 text-[13px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF] sm:w-auto"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Ouvrir dans Google Maps
              </a>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5FA7] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0D3B73] hover:text-white sm:w-auto"
              >
                <Navigation className="h-3.5 w-3.5" aria-hidden />
                Itinéraire
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

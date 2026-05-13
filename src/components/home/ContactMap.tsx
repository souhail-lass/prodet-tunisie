import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';

const contactRows = [
  {
    label: 'ADRESSE',
    value: ['20 Rue de Somalie', "L'Aouina, Tunis 2045"],
    icon: MapPin,
  },
  {
    label: 'TÉLÉPHONE',
    value: ['+216 71 758 468'],
    icon: Phone,
  },
  {
    label: 'EMAIL',
    value: ['prodet.tunisie@gmail.com'],
    icon: Mail,
  },
  {
    label: 'HORAIRES',
    value: ['Lun – Ven · 8h00 – 17h00'],
    icon: Clock,
    pill: 'Livraison selon zone',
  },
] as const;

export function ContactMap() {
  return (
    <section className="bg-[#F8F7F4] py-[72px]">
      <div className="mx-auto max-w-[1400px] px-6">
        <header className="mb-8">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B5FA7]">
            NOUS TROUVER
          </p>
          <h2 className="text-[30px] font-semibold leading-[1.2] text-[#1C2B3A]">
            Notre site à L&apos;Aouina, Tunis
          </h2>
        </header>

        <div className="grid overflow-hidden rounded-[12px] border-[0.5px] border-[#E5E7EB] bg-white lg:grid-cols-[1fr_320px]">
          <iframe
            src="https://www.google.com/maps?q=Prodet%20Tunisie%2C%2020%20Rue%20de%20Somalie%2C%20L%27Aouina%2C%20Tunis%202045&hl=fr&z=16&output=embed"
            width="100%"
            height="320"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localisation Prodet Tunisie — 20 Rue de Somalie, L'Aouina, Tunis"
            className="h-[320px] w-full"
          />

          <aside className="flex flex-col gap-5 bg-white px-6 py-7">
            <h3 className="text-[16px] font-medium text-[#1C2B3A]">Prodet Tunisie</h3>

            <div className="space-y-5">
              {contactRows.map((row) => {
                const Icon = row.icon;

                return (
                  <div key={row.label} className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <Icon className="h-[15px] w-[15px] text-[#1B5FA7]" aria-hidden />
                    </div>
                    <div>
                      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.03em] text-[#9CA3AF]">
                        {row.label}
                      </p>
                      <p className="whitespace-pre-line text-[13px] leading-[1.5] text-[#1C2B3A]">
                        {row.value.join('\n')}
                      </p>
                      {'pill' in row ? (
                        <span className="mt-1.5 inline-block rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] text-[#1B5FA7]">
                          {row.pill}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href="https://maps.app.goo.gl/JWfu6nT3M3jtCaoB7"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5FA7] px-3 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0D3B73] hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Ouvrir dans Google Maps
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

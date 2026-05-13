import {
  BadgePercent,
  Factory,
  HeadphonesIcon,
  MapPin,
  Package,
  Phone,
  TrendingDown,
} from 'lucide-react';

const distinctionCards = [
  {
    title: 'Fabricant local',
    description:
      "Nos produits sont fabriqués à L'Aouina, Tunis. Approvisionnement direct sans délais d'importation ni marges d'intermédiaires.",
    accent: "L'Aouina · Tunis",
    icon: Factory,
    accentIcon: MapPin,
    iconBg: 'rgba(51, 181, 246, 0.15)',
    iconColor: '#33B5F6',
  },
  {
    title: 'Formats professionnels',
    description:
      "Bidons 5L, 10L, 20L conçus pour l'usage intensif en restauration, hôtellerie et collectivités. Volumes sur mesure disponibles sur devis.",
    accent: '5L · 10L · 20L · sur mesure',
    icon: Package,
    accentIcon: Package,
    iconBg: 'rgba(31, 156, 73, 0.15)',
    iconColor: '#1F9C49',
  },
  {
    title: 'Rapport qualité / prix',
    description:
      'Tarifs compétitifs sans marges intermédiaires. Conditions grossiste pour les volumes réguliers et les revendeurs professionnels.',
    accent: 'Tarifs grossiste disponibles',
    icon: BadgePercent,
    accentIcon: TrendingDown,
    iconBg: 'rgba(51, 181, 246, 0.15)',
    iconColor: '#33B5F6',
  },
  {
    title: 'Relation directe',
    description:
      "Commandes par téléphone, email ou WhatsApp. Vous parlez à l'équipe, pas à un bot. Réponse directe et suivi personnalisé.",
    accent: '71 758 468',
    icon: HeadphonesIcon,
    accentIcon: Phone,
    iconBg: 'rgba(31, 156, 73, 0.15)',
    iconColor: '#1F9C49',
  },
] as const;

export function WhyProdet() {
  return (
    <section className="relative overflow-hidden bg-[#0D3B73] py-20">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:24px_24px]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-[1400px] px-6">
        <header className="text-center">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#33B5F6]">
            POURQUOI PRODET
          </p>
          <h2 className="text-[30px] font-bold leading-[1.2] text-white">
            Ce qui nous distingue
          </h2>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {distinctionCards.map((card) => {
            const Icon = card.icon;
            const AccentIcon = card.accentIcon;

            return (
              <article
                key={card.title}
                className="grid grid-cols-[80px_minmax(0,1fr)] rounded-[14px] border-[0.5px] border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] p-7 transition-all duration-200 ease-out hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.10)]"
              >
                <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: card.iconColor }}
                    aria-hidden
                  />
                </div>
                <div>
                  <h3 className="mb-1.5 text-[16px] font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-[1.65] text-[rgba(255,255,255,0.65)]">
                    {card.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.15)] px-3 py-1 text-[11px] font-medium text-white">
                    <AccentIcon className="h-3 w-3" aria-hidden />
                    {card.accent}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

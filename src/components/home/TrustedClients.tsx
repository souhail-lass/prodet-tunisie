import { Lock } from 'lucide-react';

// TODO: Replace these placeholder cards with real client logos
// Structure: <img src="/images/clients/[client-name].png" className="h-8 object-contain grayscale hover:grayscale-0 transition" />
// When real logos are added, remove the initials circle and name — just show the logo
const clientPlaceholders = [
  { initials: 'HH', name: 'Hôtel partenaire', tag: 'Hôtellerie', color: '#1B5FA7' },
  { initials: 'RC', name: 'Résidence', tag: 'Hébergement', color: '#0D3B73' },
  { initials: 'RE', name: 'Restaurant', tag: 'Restauration', color: '#1F9C49' },
  { initials: 'CO', name: 'Collectivité', tag: 'Secteur public', color: '#33B5F6' },
  { initials: 'SN', name: 'Soc. nettoyage', tag: 'Nettoyage', color: '#7C3AED' },
] as const;

const activeSectors = [
  'Hôtels & hébergement',
  'Restaurants & cafés',
  'Sociétés de nettoyage',
  'Entreprises',
  'Institutions',
  'Revendeurs & grossistes',
] as const;

export function TrustedClients() {
  return (
    <section className="bg-white py-[72px]">
      <div className="mx-auto max-w-[1400px] px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B5FA7]">
              ILS NOUS FONT CONFIANCE
            </p>
            <h2 className="text-[30px] font-semibold leading-[1.2] text-[#1C2B3A]">
              Nos clients professionnels
            </h2>
          </div>
          <p className="text-[12px] italic text-[#9CA3AF]">
            Établissements avec qui nous travaillons activement
          </p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {clientPlaceholders.map((client) => (
            <div
              key={client.name}
              className="flex h-20 items-center justify-center rounded-[10px] border-[0.5px] border-[#E5E7EB] bg-white px-6 py-4"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[14px] font-medium text-white"
                style={{ backgroundColor: client.color }}
              >
                {client.initials}
              </div>
              <div className="ml-3 min-w-0">
                <p className="truncate text-[13px] font-medium text-[#1C2B3A]">{client.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">{client.tag}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-7 flex items-center justify-center gap-1.5 text-center text-[11px] italic text-[#9CA3AF]">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Logos affichés avec accord des établissements concernés
        </p>

        <div className="mt-6 flex flex-wrap gap-2 border-t-[0.5px] border-[#E5E7EB] pt-5">
          <span className="mr-2 self-center text-[12px] text-[#9CA3AF]">Secteurs actifs :</span>
          {activeSectors.map((sector) => (
            <span
              key={sector}
              className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-medium text-[#1B5FA7]"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

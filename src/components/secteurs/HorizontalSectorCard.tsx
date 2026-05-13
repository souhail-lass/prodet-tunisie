import {
  Briefcase,
  Building,
  ClipboardPlus,
  Landmark,
  Package,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { SectorPageCard, SectorPageIconName } from './sector-page-data';

const iconByName: Record<SectorPageIconName, LucideIcon> = {
  Briefcase,
  Building,
  Landmark,
  Package,
  Sparkles,
  UtensilsCrossed,
};

export function HorizontalSectorCard({ sector }: { sector: SectorPageCard }) {
  const Icon = iconByName[sector.icon];

  return (
    <article className="group overflow-hidden rounded-2xl border-[0.5px] border-[#E5E7EB] bg-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#1B5FA7] hover:shadow-[0_4px_24px_rgba(27,95,167,0.08)]">
      <div className="relative h-[168px] overflow-hidden">
        <img src={sector.image} alt={sector.alt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,59,115,0.78)_0%,rgba(13,59,115,0.18)_70%)]" />
        <div className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Icon className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div className="absolute bottom-0 left-0 p-5">
          <h2 className="text-[20px] font-bold leading-tight text-white">{sector.name}</h2>
          <p className="mt-1 text-[12px] font-medium text-white/70">{sector.summary}</p>
        </div>
      </div>

      <div className="flex min-h-[236px] flex-col gap-4 p-5">
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
            Besoins clés
          </p>
          <ul className="flex flex-wrap gap-2">
            {sector.supplies.map((item) => (
              <li
                key={item}
                className="rounded-full border-[0.5px] border-[#E5E7EB] bg-[#F8F7F4] px-3 py-1.5 text-[12px] font-medium text-[#374151]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {sector.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-medium text-[#1B5FA7]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/catalogue?sector=${sector.id}`}
            className="text-[13px] font-medium text-[#1B5FA7] underline-offset-4 hover:text-[#1B5FA7] hover:underline"
          >
            Voir les produits →
          </Link>
          <Link
            href="/devis"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border-[0.5px] border-[#1B5FA7] px-4 py-[7px] text-[12px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF] hover:text-[#1B5FA7]"
          >
            <ClipboardPlus className="h-3.5 w-3.5" aria-hidden />
            Devis
          </Link>
        </div>
      </div>
    </article>
  );
}

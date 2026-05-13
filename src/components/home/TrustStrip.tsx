import { Factory, FileText, Package, Truck, Users } from 'lucide-react';

const trustItems = [
  { label: 'Fabrication tunisienne', icon: Factory },
  { label: 'Formats professionnels', icon: Package },
  { label: 'Devis sur demande', icon: FileText },
  { label: 'Relation directe B2B', icon: Users },
  { label: 'Livraison selon zone', icon: Truck },
] as const;

export function TrustStrip() {
  return (
    <section className="border-b-[0.5px] border-t-[3px] border-b-[#E5E7EB] border-t-[#1B5FA7] bg-white py-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-6 sm:flex sm:flex-wrap sm:items-center sm:justify-around sm:gap-2">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          const hasDivider = index < trustItems.length - 1;

          return (
            <div
              key={item.label}
              className={`flex items-center justify-center gap-2 text-[12px] font-medium text-[#374151] ${
                hasDivider ? 'lg:border-r lg:border-[#E5E7EB] lg:pr-10' : ''
              }`}
            >
              <Icon className="h-[22px] w-[22px] shrink-0 text-[#1B5FA7]" aria-hidden />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

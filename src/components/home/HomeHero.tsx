import { Check, LayoutGrid, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';

const trustItems = [
  'Formats B2B 5L · 10L · 20L',
  'Devis sur demande',
  'Livraison selon zone',
] as const;

const bottles = [
  {
    name: 'Eau de Javel',
    subLabel: 'Désinfectant',
    size: '5 L',
    color: '#1B5FA7',
    width: 90,
    bodyHeight: 160,
    capHeight: 12,
    transform: 'translateY(8px)',
  },
  {
    name: 'Prolax Liquide',
    subLabel: 'Lessive pro',
    size: '20 KG',
    color: '#0D3B73',
    width: 115,
    bodyHeight: 210,
    capHeight: 15,
    transform: 'translateY(-16px)',
  },
  {
    name: 'Liquide Vaisselle',
    subLabel: 'Cuisine',
    size: '5 L',
    color: '#1F9C49',
    width: 90,
    bodyHeight: 150,
    capHeight: 12,
    transform: 'translateY(4px)',
  },
] as const;

export function HomeHero() {
  return (
    <section className="relative min-h-[520px] overflow-x-hidden overflow-y-visible bg-[#0D3B73]">
      <div
        className="pointer-events-none absolute -top-[100px] right-[300px] h-[280px] w-[280px] rounded-full bg-[rgba(51,181,246,0.08)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-[60px] h-[180px] w-[180px] rounded-full bg-[rgba(27,95,167,0.18)]"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto grid min-h-[520px] max-w-[1400px] gap-12 px-6 lg:grid-cols-[52fr_48fr]">
        <div className="flex flex-col justify-center gap-6 py-[72px]">
          <div className="flex w-fit items-center gap-1.5 rounded-full border-[0.5px] border-[rgba(51,181,246,0.3)] bg-[rgba(51,181,246,0.15)] px-3.5 py-[5px] text-[11px] font-medium text-[#33B5F6]">
            <MapPin className="h-3 w-3" aria-hidden />
            Fabrication tunisienne · L&apos;Aouina, Tunis
          </div>

          <div className="h-0.5 w-12 bg-[#33B5F6]" aria-hidden />

          <h1 className="max-w-[620px] text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-white sm:text-[36px] lg:text-[44px]">
            Produits d&apos;entretien{' '}
            <span className="text-[#33B5F6]">professionnels</span> fabriqués en Tunisie.
          </h1>

          <p className="max-w-[460px] text-[14px] leading-[1.75] text-[rgba(255,255,255,0.65)]">
            Prodet fabrique et distribue des solutions de nettoyage pour hôtels, restaurants,
            cafés, entreprises, sociétés de nettoyage et collectivités en Tunisie.
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-[22px] py-[11px] text-[13px] font-medium text-[#0D3B73] transition-colors hover:text-[#0D3B73]"
            >
              <LayoutGrid className="h-[15px] w-[15px]" aria-hidden />
              Voir le catalogue
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center justify-center rounded-lg border-[0.5px] border-[rgba(255,255,255,0.35)] bg-transparent px-[22px] py-[11px] text-[13px] font-medium text-white transition-colors hover:border-white hover:text-white"
            >
              Demander un devis
            </Link>
          </div>

          <div className="flex flex-wrap gap-4">
            {trustItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.45)]"
              >
                <Check className="h-[13px] w-[13px] shrink-0 text-[#33B5F6]" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mb-0 hidden min-h-[300px] items-end justify-center pb-0 min-[480px]:flex lg:justify-end">
          <div className="mb-0 flex items-end justify-center gap-7 pb-0">
            {bottles.map((bottle) => (
              <ProductBottle key={bottle.name} bottle={bottle} />
            ))}
          </div>
          <p className="absolute bottom-4 left-0 w-full text-center text-[11px] text-[rgba(255,255,255,0.35)]">
            Image illustrative · Produits fabriqués à L&apos;Aouina, Tunis
          </p>
        </div>
      </div>
    </section>
  );
}

function ProductBottle({ bottle }: { bottle: (typeof bottles)[number] }) {
  const [amount, unit] = bottle.size.split(' ');

  return (
    <div
      className="flex shrink-0 flex-col items-center"
      style={{ width: bottle.width, transform: bottle.transform }}
    >
      <div
        className="rounded-t-[3px]"
        style={{
          width: Math.round(bottle.width * 0.42),
          height: bottle.capHeight,
          backgroundColor: bottle.color,
        }}
      />
      <div
        className="flex w-full flex-col overflow-hidden rounded-md border border-[rgba(255,255,255,0.12)] bg-white"
        style={{ minHeight: bottle.bodyHeight }}
      >
        <div className="flex-1 bg-white" />
        <div
          className="flex flex-col items-center justify-center px-1.5 py-2 text-center"
          style={{
            minHeight: Math.round(bottle.bodyHeight * 0.45),
            backgroundColor: bottle.color,
          }}
        >
          <p className="text-[8px] uppercase leading-none tracking-[0.08em] text-[rgba(255,255,255,0.6)]">
            PRODET
          </p>
          <p className="mt-1 text-[10px] font-bold leading-[1.1] text-white">
            {bottle.name}
          </p>
          <p className="mt-1 text-[7px] leading-none text-[rgba(255,255,255,0.7)]">
            {bottle.subLabel}
          </p>
          <p className="mt-1.5 text-[18px] font-bold leading-none text-white">
            {amount}
            <span className="ml-0.5 text-[9px] text-[rgba(255,255,255,0.75)]">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

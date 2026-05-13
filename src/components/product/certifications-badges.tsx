import type { Product } from '@/data/types';

export function CertificationsBadges({ product }: { product: Product }) {
  const badges = [
    ...(product.biodegradability
      ? [{ label: `Biodégradabilité ${product.biodegradability}` }]
      : []),
    ...(product.certifications ?? []).map((label) => ({ label })),
  ];

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className="inline-flex rounded-full bg-[#EAF7EF] px-3 py-1 text-xs font-semibold text-support"
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

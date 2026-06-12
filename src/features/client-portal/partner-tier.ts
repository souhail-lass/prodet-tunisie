/**
 * Partner status tiers based on the client's year-to-date spend.
 *
 * ⚠️ EDIT THESE to match Prodet's real commercial terms. Tiers should reflect
 * something the client actually gets (priority delivery, a rebate, a dedicated
 * contact). Set `reward` to that benefit — leaving it empty keeps the tier as
 * pure recognition (still motivating via the goal-gradient effect, but honest).
 * Thresholds are YTD spend in TND (TTC).
 */
export type PartnerTierId = 'bronze' | 'silver' | 'gold';

type TierDef = { id: PartnerTierId; label: string; min: number; reward?: string };

const TIERS: TierDef[] = [
  { id: 'bronze', label: 'Bronze', min: 5_000, reward: '' },
  { id: 'silver', label: 'Argent', min: 20_000, reward: '' },
  { id: 'gold', label: 'Or', min: 50_000, reward: '' },
];

export type PartnerTier = {
  id: PartnerTierId | null;
  label: string | null;
  reward: string | null;
  /** The next tier to reach, or null when already at the top. */
  nextLabel: string | null;
  /** TND remaining to reach the next tier (0 when topped out). */
  remainingToNext: number;
  /** 0–100 progress toward the next tier (100 when topped out). */
  progressPct: number;
};

export function computePartnerTier(ytdSpend: number): PartnerTier {
  const sorted = [...TIERS].sort((a, b) => a.min - b.min);
  let current: TierDef | null = null;
  for (const t of sorted) if (ytdSpend >= t.min) current = t;

  const currentIdx = current ? sorted.findIndex((t) => t.id === current!.id) : -1;
  const next = sorted[currentIdx + 1] ?? null;

  if (!next) {
    return {
      id: current?.id ?? null,
      label: current?.label ?? null,
      reward: current?.reward || null,
      nextLabel: null,
      remainingToNext: 0,
      progressPct: 100,
    };
  }

  const floor = current?.min ?? 0;
  const span = next.min - floor;
  const progressPct = span > 0 ? Math.min(100, Math.max(0, Math.round(((ytdSpend - floor) / span) * 100))) : 0;

  return {
    id: current?.id ?? null,
    label: current?.label ?? null,
    reward: current?.reward || null,
    nextLabel: next.label,
    remainingToNext: Math.max(0, Math.round(next.min - ytdSpend)),
    progressPct,
  };
}

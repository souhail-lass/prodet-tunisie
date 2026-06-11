export const portalRecurrenceModes = ['once', 'weekly', 'every_14d', 'monthly', 'custom'] as const;
export type PortalRecurrenceMode = (typeof portalRecurrenceModes)[number];

/** Human-readable recurrence for internal notes / history. */
export function formatRecurrenceLabel(
  mode: PortalRecurrenceMode | unknown,
  detail: string | null | undefined,
): string | null {
  const m =
    typeof mode === 'string' && (portalRecurrenceModes as readonly string[]).includes(mode)
      ? (mode as PortalRecurrenceMode)
      : 'once';
  const d = typeof detail === 'string' ? detail.trim() : '';
  switch (m) {
    case 'once':
      return null;
    case 'weekly':
      return 'Chaque semaine';
    case 'every_14d':
      return 'Toutes les 2 semaines';
    case 'monthly':
      return 'Chaque mois';
    case 'custom':
      return d.length > 0 ? d : null;
    default:
      return null;
  }
}

export const recurrenceSelectOptionsFr = [
  { value: 'once' as const, label: 'Une seule fois' },
  { value: 'weekly' as const, label: 'Chaque semaine' },
  { value: 'every_14d' as const, label: 'Toutes les 2 semaines' },
  { value: 'monthly' as const, label: 'Chaque mois' },
  { value: 'custom' as const, label: 'Autre cadence…' },
] as const satisfies ReadonlyArray<{ value: PortalRecurrenceMode; label: string }>;

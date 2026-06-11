import { Plus, Trash2 } from 'lucide-react';

export type QuantityControlProps = {
  value?: number;
  onChange?: (next: number) => void;
  addLabel?: string;
  max?: number;
  className?: string;
};

/**
 * Mirrors the design-system QuantityControl (.pds-qty).
 * At 0 → a green "Ajouter au devis" button; otherwise a stepper whose
 * decrement turns into a trash action at qty 1.
 */
export function QuantityControl({
  value = 0,
  onChange,
  addLabel = 'Ajouter au devis',
  max = 9999,
  className = '',
}: QuantityControlProps) {
  const set = (n: number) => onChange?.(Math.max(0, Math.min(max, n)));

  if (value <= 0) {
    return (
      <div className={['pds-qty', className].filter(Boolean).join(' ')}>
        <button type="button" className="pds-qty__add" onClick={() => set(1)}>
          <Plus /> {addLabel}
        </button>
      </div>
    );
  }

  const atOne = value === 1;
  return (
    <div className={['pds-qty', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={`pds-qty__step pds-qty__step--left ${atOne ? 'pds-qty__step--trash' : ''}`}
        onClick={() => set(value - 1)}
        aria-label={atOne ? 'Retirer du devis' : 'Diminuer'}
      >
        {atOne ? <Trash2 /> : <span>&minus;</span>}
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="pds-qty__field"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
          set(Number.isNaN(n) ? 0 : n);
        }}
        aria-label="Quantité"
      />
      <button
        type="button"
        className="pds-qty__step pds-qty__step--right"
        onClick={() => set(value + 1)}
        aria-label="Augmenter"
      >
        +
      </button>
    </div>
  );
}

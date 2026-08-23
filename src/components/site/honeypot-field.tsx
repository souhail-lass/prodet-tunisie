'use client';

/**
 * Spam honeypot: a field a human never sees and never fills, but a naive
 * form-filling bot will. The server actions reject any submission where it
 * carries a value.
 *
 * Positioned off-screen rather than `display:none` / `hidden` — bots commonly
 * skip fields that are explicitly hidden, which is precisely the population we
 * want to catch. `aria-hidden` + `tabIndex={-1}` keep it away from screen
 * readers and keyboard order, so it costs real users nothing.
 */
export function HoneypotField({
  value,
  onChange,
  id = 'website',
}: {
  value: string;
  onChange: (next: string) => void;
  id?: string;
}) {
  return (
    <div className="hp-field" aria-hidden="true">
      <label htmlFor={id}>Ne remplissez pas ce champ</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Check, ChevronDown } from 'lucide-react';

function fieldId(id: string | undefined, prefix: string, label?: string) {
  if (id) return id;
  if (label) return `${prefix}-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return undefined;
}

/* ---------- Input (.pds-field / .pds-input) ---------- */
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required = false, icon, id, className = '', ...rest },
  ref,
) {
  const theId = fieldId(id, 'pds', label);
  const inputCls = ['pds-input', icon ? 'pds-input--has-icon' : '', error ? 'pds-input--error' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="pds-field">
      {label ? (
        <label className="pds-field__label" htmlFor={theId}>
          {label}
          {required ? <span className="pds-field__req">*</span> : null}
        </label>
      ) : null}
      <div className="pds-input-wrap">
        {icon ? <span className="pds-input-wrap__icon">{icon}</span> : null}
        <input ref={ref} id={theId} className={inputCls} aria-invalid={!!error} required={required} {...rest} />
      </div>
      {error ? <span className="pds-field__error">{error}</span> : hint ? <span className="pds-field__hint">{hint}</span> : null}
    </div>
  );
});

/* ---------- Select (.pds-field / .pds-select) ---------- */
export type SelectOption = { value: string; label: string };
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required = false, options = [], placeholder, value, id, className = '', children, ...rest },
  ref,
) {
  const theId = fieldId(id, 'pds-sel', label);
  const isPlaceholder = !!placeholder && (value === '' || value == null);
  const selCls = ['pds-select', isPlaceholder ? 'pds-select--placeholder' : '', className].filter(Boolean).join(' ');
  return (
    <div className="pds-field">
      {label ? (
        <label className="pds-field__label" htmlFor={theId}>
          {label}
          {required ? <span className="pds-field__req">*</span> : null}
        </label>
      ) : null}
      <div className="pds-select-wrap">
        <select ref={ref} id={theId} className={selCls} value={value} aria-invalid={!!error} required={required} {...rest}>
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        <span className="pds-select-wrap__chev">
          <ChevronDown />
        </span>
      </div>
      {error ? <span className="pds-field__error">{error}</span> : hint ? <span className="pds-field__hint">{hint}</span> : null}
    </div>
  );
});

/* ---------- Textarea (.pds-field / .pds-textarea) ---------- */
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required = false, id, className = '', ...rest },
  ref,
) {
  const theId = fieldId(id, 'pds-ta', label);
  const cls = ['pds-textarea', error ? 'pds-textarea--error' : '', className].filter(Boolean).join(' ');
  return (
    <div className="pds-field">
      {label ? (
        <label className="pds-field__label" htmlFor={theId}>
          {label}
          {required ? <span className="pds-field__req">*</span> : null}
        </label>
      ) : null}
      <textarea ref={ref} id={theId} className={cls} aria-invalid={!!error} required={required} {...rest} />
      {error ? <span className="pds-field__error">{error}</span> : hint ? <span className="pds-field__hint">{hint}</span> : null}
    </div>
  );
});

/* ---------- Checkbox / radio (.pds-check) ---------- */
export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  count?: number;
  radio?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, count, radio = false, className = '', ...rest },
  ref,
) {
  const cls = ['pds-check', radio ? 'pds-check--radio' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input ref={ref} type={radio ? 'radio' : 'checkbox'} {...rest} />
      <span className="pds-check__box">{radio ? <span className="pds-check__dot" /> : <Check strokeWidth={3.2} />}</span>
      {label ? <span>{label}</span> : null}
      {count != null ? <span className="pds-check__count">({count})</span> : null}
    </label>
  );
});

'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Lock, Send } from 'lucide-react';

type ContactFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const initialValues: ContactFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  company: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const inputClassName = useMemo(
    () =>
      'w-full rounded-lg border-[0.5px] border-[#D1D5DB] bg-white px-3.5 py-2.5 text-[14px] text-[#1C2B3A] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#9CA3AF] focus:border-[#1B5FA7] focus:shadow-[0_0_0_3px_rgba(27,95,167,0.08)]',
    [],
  );

  function updateField(
    field: keyof ContactFormValues,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    window.location.href = buildMailtoHref(values);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-[14px] border-[0.5px] border-[#E5E7EB] bg-white p-9 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-[#1F9C49]" aria-hidden />
        <h2 className="mt-4 text-[18px] font-semibold text-[#1C2B3A]">Message envoyé</h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.6] text-[#6B7280]">
          Votre client email s&apos;est ouvert avec votre message. L&apos;équipe Prodet vous
          contactera directement.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setErrors({});
            setSubmitted(false);
          }}
          className="mt-6 inline-flex items-center justify-center rounded-lg border-[0.5px] border-[#1B5FA7] px-5 py-2.5 text-[13px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF]"
        >
          Nouveau message
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-[14px] border-[0.5px] border-[#E5E7EB] bg-white p-6 sm:p-9">
      <h2 className="text-[20px] font-semibold text-[#1C2B3A]">
        Contacter l&apos;équipe Prodet
      </h2>
      <p className="mb-7 mt-2 text-[13px] leading-[1.6] text-[#6B7280]">
        Renseignez vos coordonnées, choisissez un sujet et laissez votre message. Nous vous
        répondons directement par téléphone ou email.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="contact-first-name"
            label="Prénom"
            error={errors.firstName}
            required
          >
            <input
              id="contact-first-name"
              type="text"
              autoComplete="given-name"
              value={values.firstName}
              onChange={(event) => updateField('firstName', event)}
              aria-invalid={Boolean(errors.firstName)}
              className={fieldClass(inputClassName, errors.firstName)}
            />
          </Field>

          <Field id="contact-last-name" label="Nom" error={errors.lastName} required>
            <input
              id="contact-last-name"
              type="text"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => updateField('lastName', event)}
              aria-invalid={Boolean(errors.lastName)}
              className={fieldClass(inputClassName, errors.lastName)}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="contact-phone" label="Téléphone" error={errors.phone} required>
            <input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+216 XX XXX XXX"
              value={values.phone}
              onChange={(event) => updateField('phone', event)}
              aria-invalid={Boolean(errors.phone)}
              className={fieldClass(inputClassName, errors.phone)}
            />
          </Field>

          <Field id="contact-email" label="Email" error={errors.email} required>
            <input
              id="contact-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateField('email', event)}
              aria-invalid={Boolean(errors.email)}
              className={fieldClass(inputClassName, errors.email)}
            />
          </Field>
        </div>

        <Field id="contact-company" label="Société / Établissement" error={errors.company}>
          <input
            id="contact-company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(event) => updateField('company', event)}
            aria-invalid={Boolean(errors.company)}
            className={fieldClass(inputClassName, errors.company)}
          />
        </Field>

        <Field id="contact-subject" label="Sujet" error={errors.subject} required>
          <input
            id="contact-subject"
            type="text"
            placeholder="Ex: Question produit, fiche technique, disponibilité..."
            value={values.subject}
            onChange={(event) => updateField('subject', event)}
            aria-invalid={Boolean(errors.subject)}
            className={fieldClass(inputClassName, errors.subject)}
          />
        </Field>

        <Field id="contact-message" label="Message" error={errors.message} required>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Écrivez votre question ou votre demande ici..."
            value={values.message}
            onChange={(event) => updateField('message', event)}
            aria-invalid={Boolean(errors.message)}
            className={fieldClass(inputClassName, errors.message)}
          />
        </Field>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1B5FA7] px-4 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0D3B73]"
        >
          Envoyer le message
          <Send className="h-4 w-4" aria-hidden />
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
          <Lock className="h-[13px] w-[13px]" aria-hidden />
          Vos données sont utilisées uniquement pour traiter votre demande.
        </p>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  required = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-[5px] flex items-center gap-1.5 text-[12px] font-medium text-[#374151]">
        {label}
        {required ? <span className="h-1 w-1 rounded-full bg-[#DC2626]" aria-hidden /> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[12px] text-[#DC2626]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validate(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.firstName.trim()) errors.firstName = 'Prénom obligatoire.';
  if (!values.lastName.trim()) errors.lastName = 'Nom obligatoire.';
  if (!values.phone.trim()) errors.phone = 'Téléphone obligatoire.';
  if (!values.email.trim()) {
    errors.email = 'Email obligatoire.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(values.email.trim())) {
    errors.email = 'Email invalide.';
  }
  if (!values.subject.trim()) errors.subject = 'Sujet obligatoire.';
  if (!values.message.trim()) errors.message = 'Message obligatoire.';

  return errors;
}

function buildMailtoHref(values: ContactFormValues) {
  const subject = `Contact Prodet — ${values.subject.trim()}`;
  const body = [
    `Prénom: ${values.firstName.trim()} ${values.lastName.trim()}`,
    `Téléphone: ${values.phone.trim()}`,
    `Email: ${values.email.trim()}`,
    `Société: ${values.company.trim() || '-'}`,
    `Sujet: ${values.subject.trim()}`,
    `Message: ${values.message.trim()}`,
  ].join('\n');

  return `mailto:prodet.tunisie@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function fieldClass(baseClassName: string, error?: string) {
  if (!error) return baseClassName;
  return `${baseClassName} border-[#DC2626] shadow-[0_0_0_3px_rgba(220,38,38,0.08)] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]`;
}

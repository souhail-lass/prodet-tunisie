'use client';

import { AlertCircle, MailCheck, Send } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { sectors } from '@/data/sectors';
import { submitClientAccessRequest } from '@/features/client-access/actions';
import { cn } from '@/lib/utils';

type AccessRequestFormState = {
  fullName: string;
  company: string;
  vatNumber: string;
  sectorId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  clientReference: string;
  needType: string;
  message: string;
};

type FormStatus =
  | { type: 'idle' }
  | { type: 'error'; message: string }
  | { type: 'saved'; message: string };

const initialFormState: AccessRequestFormState = {
  fullName: '',
  company: '',
  vatNumber: '',
  sectorId: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  clientReference: '',
  needType: '',
  message: '',
};

const needTypes = [
  'Réapprovisionnement régulier',
  'Produits pour un établissement',
  'Approvisionnement multi-sites',
  'Devenir revendeur / grossiste',
  'Autre besoin professionnel',
] as const;

export function AccessRequestForm() {
  const [formState, setFormState] = useState<AccessRequestFormState>(initialFormState);
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSectorLabel = useMemo(() => {
    return sectors.find((sector) => sector.id === formState.sectorId)?.label ?? 'Non précisé';
  }, [formState.sectorId]);

  function updateField(field: keyof AccessRequestFormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    setStatus({ type: 'idle' });
  }

  async function submitAccessRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateForm(formState);
    if (validationMessage) {
      setStatus({ type: 'error', message: validationMessage });
      return;
    }

    setIsSubmitting(true);
    const result = await submitClientAccessRequest({
      name: formState.fullName,
      companyName: formState.company,
      vatNumber: formState.vatNumber,
      sector: selectedSectorLabel,
      phone: formState.phone,
      email: formState.email,
      addressLine: formState.address,
      cityOrZone: formState.city,
      postalCode: formState.postalCode,
      needType: formState.needType,
      prodetReferenceOptional: formState.clientReference,
      message: formState.message,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setStatus({
        type: 'error',
        message: result.formError ?? "Impossible d'enregistrer la demande.",
      });
      return;
    }

    setFormState(initialFormState);
    setStatus({
      type: 'saved',
      message:
        "Demande enregistrée. Prodet vérifiera vos informations avant l'ouverture de l'accès client.",
    });
  }

  return (
    <form
      onSubmit={submitAccessRequest}
      className="rounded-sm border border-border bg-white p-5 shadow-[0_18px_50px_-44px_rgba(8,41,78,0.45)] md:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow-label">Demande d&apos;accès</p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-prodet-text">
            Informations professionnelles
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Prodet vérifie la demande avant ouverture.
          </p>
        </div>
        <div className="w-fit rounded-sm border border-primary/15 bg-prodet-mist px-3 py-2 text-xs font-semibold uppercase text-primary">
          Enregistrement sécurisé
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormField label="Nom / Prénom" required>
          <Input
            value={formState.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            autoComplete="name"
          />
        </FormField>
        <FormField label="Société / Établissement" required>
          <Input
            value={formState.company}
            onChange={(event) => updateField('company', event.target.value)}
            autoComplete="organization"
          />
        </FormField>
        <FormField label="Matricule fiscal" required>
          <Input
            value={formState.vatNumber}
            onChange={(event) => updateField('vatNumber', event.target.value)}
            placeholder="Ex : 1234567/A/M/000"
          />
        </FormField>
        <FormField label="Secteur d'activité" required>
          <Select value={formState.sectorId} onValueChange={(value) => updateField('sectorId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un secteur" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Téléphone" required>
          <Input
            type="tel"
            value={formState.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            autoComplete="tel"
          />
        </FormField>
        <FormField label="Email" required>
          <Input
            type="email"
            value={formState.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
          />
        </FormField>
        <FormField label="Adresse" required className="md:col-span-2">
          <Input
            value={formState.address}
            onChange={(event) => updateField('address', event.target.value)}
            autoComplete="street-address"
            placeholder="Rue, numéro, zone industrielle…"
          />
        </FormField>
        <FormField label="Ville / zone" required>
          <Input
            value={formState.city}
            onChange={(event) => updateField('city', event.target.value)}
            autoComplete="address-level2"
          />
        </FormField>
        <FormField label="Code postal" required>
          <Input
            value={formState.postalCode}
            onChange={(event) => updateField('postalCode', event.target.value)}
            autoComplete="postal-code"
            placeholder="Ex : 2045"
          />
        </FormField>
        <FormField
          label="Référence client Prodet, facture ou BL — si vous la connaissez"
          className="md:col-span-2"
        >
          <Input
            value={formState.clientReference}
            onChange={(event) => updateField('clientReference', event.target.value)}
            placeholder="Ex: référence client, numéro de facture, BL ou ancienne commande"
          />
        </FormField>
        <FormField label="Type de besoin" required>
          <Select value={formState.needType} onValueChange={(value) => updateField('needType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un besoin" />
            </SelectTrigger>
            <SelectContent>
              {needTypes.map((needType) => (
                <SelectItem key={needType} value={needType}>
                  {needType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Message" className="md:col-span-2">
          <Textarea
            rows={5}
            value={formState.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder="Décrivez les produits recherchés, les formats, les volumes ou le nombre de sites à approvisionner."
          />
        </FormField>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          variant="quote"
          size="xl"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4" aria-hidden />
          {isSubmitting ? 'Enregistrement...' : 'Envoyer la demande'}
        </Button>

        {status.type !== 'idle' ? (
          <p
            className={cn(
              'mt-4 flex items-start gap-2 rounded-sm px-3 py-2 text-sm leading-6',
              status.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-support/10 text-support',
            )}
          >
            {status.type === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            )}
            {status.message}
          </p>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Aucun compte n&apos;est créé automatiquement. Aucun prix, stock ou paiement public.
        </p>
      </div>
    </form>
  );
}

function FormField({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function validateForm(formState: AccessRequestFormState): string | null {
  const requiredFields: Array<keyof AccessRequestFormState> = [
    'fullName',
    'company',
    'vatNumber',
    'sectorId',
    'phone',
    'email',
    'address',
    'city',
    'postalCode',
    'needType',
  ];

  const missingField = requiredFields.some((field) => !formState[field].trim());
  if (missingField) return 'Complétez les champs obligatoires avant de préparer la demande.';

  if (!formState.email.includes('@')) return "L'adresse email n'est pas valide.";

  return null;
}

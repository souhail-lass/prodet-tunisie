'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldError } from '@/components/forms/field-error';
import { submitQuoteRequest } from '@/features/quote/actions';
import { QuoteRequestSchema, type QuoteRequestInput } from '@/features/quote/schema';

export interface QuoteFormProductOption {
  slug: string;
  label: string;
  unit: string;
}

export interface QuoteFormSectorOption {
  key: string;
  label: string;
}

export interface QuoteFormProps {
  products: readonly QuoteFormProductOption[];
  sectors: readonly QuoteFormSectorOption[];
  prefilledProductSlug?: string;
  prefilledSectorKey?: string;
}

const FREE_TEXT_VALUE = '__free_text__';

export function QuoteForm({
  products,
  sectors,
  prefilledProductSlug,
  prefilledSectorKey,
}: QuoteFormProps) {
  const t = useTranslations('devis.form');
  const tCommon = useTranslations('common');

  const productMap = new Map(products.map((p) => [p.slug, p]));
  const initialProduct = prefilledProductSlug ? productMap.get(prefilledProductSlug) : undefined;
  const initialSectorKey = sectors.some((sector) => sector.key === prefilledSectorKey)
    ? prefilledSectorKey
    : undefined;

  const [step, setStep] = useState<1 | 2>(1);
  const [serverError, setServerError] = useState<string | undefined>();
  const [referenceCode, setReferenceCode] = useState<string | undefined>();

  const form = useForm<QuoteRequestInput>({
    resolver: zodResolver(QuoteRequestSchema),
    defaultValues: {
      company: '',
      name: '',
      email: '',
      phone: '',
      sectorKey: initialSectorKey ?? '',
      website: '',
      message: '',
      lines: [
        {
          productSlug: initialProduct?.slug,
          freeText: initialProduct ? undefined : '',
          quantity: 1,
          unit: initialProduct?.unit ?? '',
        },
      ],
    },
  });

  const lineArray = useFieldArray({ control: form.control, name: 'lines' });
  const selectedSectorKey = useWatch({ control: form.control, name: 'sectorKey' }) ?? '';

  useEffect(() => {
    if (!initialProduct) return;
    form.setValue('lines.0.productSlug', initialProduct.slug);
    form.setValue('lines.0.unit', initialProduct.unit);
  }, [initialProduct, form]);

  useEffect(() => {
    if (!initialSectorKey) return;
    form.setValue('sectorKey', initialSectorKey);
  }, [initialSectorKey, form]);

  async function handleNext() {
    const valid = await form.trigger(['company', 'name', 'email', 'phone', 'sectorKey']);
    if (valid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function onSubmit(values: QuoteRequestInput) {
    setServerError(undefined);
    try {
      const cleaned = {
        ...values,
        sectorKey: values.sectorKey?.trim() ? values.sectorKey : undefined,
        lines: values.lines.map((line) => ({
          ...line,
          freeText: line.freeText?.trim() ? line.freeText : undefined,
          unit: line.unit?.trim() ? line.unit : undefined,
        })),
      };
      const result = await submitQuoteRequest(cleaned);
      if (result.ok) {
        setReferenceCode(result.referenceCode);
        form.reset();
        return;
      }
      if (result.fieldErrors) {
        for (const [path, messages] of Object.entries(result.fieldErrors)) {
          if (path === '_root') continue;
          form.setError(path as never, {
            type: 'server',
            message: messages[0],
          });
        }
      }
      setServerError(result.formError ?? tCommon('form.errors.submitFailed'));
    } catch {
      setServerError(tCommon('form.errors.submitFailed'));
    }
  }

  if (referenceCode) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-success h-6 w-6" aria-hidden />
            <CardTitle>{t('successTitle')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('successBody')}</p>
          <p className="text-foreground mt-3 text-sm font-medium">
            {t('successReference', { ref: referenceCode })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        {...form.register('website')}
      />

      {step === 1 && (
        <Card className="surface-panel border-border/60">
          <CardHeader>
            <div className="text-primary mb-2 text-xs font-semibold tracking-wider uppercase">Étape 1 sur 2</div>
            <CardTitle className="text-2xl">{t('contactTitle')}</CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">Parlez-nous de votre entreprise pour un devis personnalisé.</p>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-base">{t('fields.sector')}</Label>
              <p className="text-muted-foreground mb-3 text-sm">Dans quelle industrie opérez-vous ?</p>
              <Select
                value={selectedSectorKey}
                onValueChange={(value) =>
                  form.setValue('sectorKey', value === '' ? undefined : value, {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={t('sectorPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.key} value={s.key} className="text-base">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 sm:col-span-2 border-t pt-6" />
            <div>
              <Label htmlFor="quote-company">{t('fields.company')} *</Label>
              <Input
                id="quote-company"
                className="h-11"
                autoComplete="organization"
                aria-invalid={Boolean(form.formState.errors.company)}
                {...form.register('company')}
              />
              <FieldError message={form.formState.errors.company?.message} />
            </div>
            <div>
              <Label htmlFor="quote-name">{t('fields.name')} *</Label>
              <Input
                id="quote-name"
                className="h-11"
                autoComplete="name"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register('name')}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="quote-email">{t('fields.email')} *</Label>
              <Input
                id="quote-email"
                type="email"
                className="h-11"
                autoComplete="email"
                inputMode="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register('email')}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="quote-phone">{t('fields.phone')} *</Label>
              <Input
                id="quote-phone"
                type="tel"
                className="h-11"
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={Boolean(form.formState.errors.phone)}
                {...form.register('phone')}
              />
              <FieldError message={form.formState.errors.phone?.message} />
            </div>
            <div className="sm:col-span-2 mt-4 flex justify-end">
              <Button type="button" size="lg" className="rounded-full px-8" onClick={handleNext}>
                Suivant <ArrowRight className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card className="surface-panel border-border/60">
            <CardHeader>
              <div className="text-primary mb-2 text-xs font-semibold tracking-wider uppercase">Étape 2 sur 2</div>
              <CardTitle className="text-2xl">{t('linesTitle')}</CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">{t('linesHelp')}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {lineArray.fields.map((field, index) => (
                <QuoteLineRow
                  key={field.id}
                  index={index}
                  products={products}
                  productMap={productMap}
                  onRemove={() => lineArray.remove(index)}
                  canRemove={lineArray.fields.length > 1}
                  form={form}
                />
              ))}
              <FieldError
                message={(form.formState.errors.lines as unknown as { message?: string })?.message}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full mt-2"
                onClick={() =>
                  lineArray.append({
                    productSlug: undefined,
                    freeText: '',
                    quantity: 1,
                    unit: '',
                  })
                }
              >
                <Plus className="h-4 w-4" aria-hidden /> {t('addLine')}
              </Button>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/60">
            <CardHeader>
              <CardTitle>{t('messageTitle')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('messageHelp')}</p>
            </CardHeader>
            <CardContent>
              <Textarea rows={5} {...form.register('message')} />
              <FieldError message={form.formState.errors.message?.message} />
            </CardContent>
          </Card>

          {serverError ? (
            <p role="alert" className="text-destructive font-medium text-sm">
              {serverError}
            </p>
          ) : null}

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-full px-6"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0 rtl:rotate-180" /> Retour
            </Button>
            <Button
              type="submit"
              size="lg"
              className="rounded-full px-8"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? tCommon('actions.submitting') : t('submit')}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

interface QuoteLineRowProps {
  index: number;
  products: readonly QuoteFormProductOption[];
  productMap: Map<string, QuoteFormProductOption>;
  onRemove: () => void;
  canRemove: boolean;
  form: ReturnType<typeof useForm<QuoteRequestInput>>;
}

function QuoteLineRow({
  index,
  products,
  productMap,
  onRemove,
  canRemove,
  form,
}: QuoteLineRowProps) {
  const t = useTranslations('devis.form');
  const slug = useWatch({
    control: form.control,
    name: `lines.${index}.productSlug`,
  });
  const isFreeText = !slug;
  const selectValue = isFreeText ? FREE_TEXT_VALUE : slug;

  function onSelectChange(value: string) {
    if (value === FREE_TEXT_VALUE) {
      form.setValue(`lines.${index}.productSlug`, undefined, {
        shouldDirty: true,
      });
      form.setValue(`lines.${index}.unit`, '', { shouldDirty: true });
    } else {
      form.setValue(`lines.${index}.productSlug`, value, { shouldDirty: true });
      form.setValue(`lines.${index}.freeText`, '', { shouldDirty: true });
      const unit = productMap.get(value)?.unit ?? '';
      form.setValue(`lines.${index}.unit`, unit, { shouldDirty: true });
    }
  }

  const linesErrors = form.formState.errors.lines as
    | { [k: number]: { freeText?: { message?: string }; quantity?: { message?: string } } }
    | undefined;
  const lineErrors = linesErrors?.[index];

  return (
    <div className="border-border/60 bg-muted/20 rounded-[10px] border p-5 transition-colors focus-within:border-primary/40 focus-within:bg-card">
      <div className="grid gap-5 sm:grid-cols-12 items-start">
        <div className="sm:col-span-6">
          <Label className="text-[0.8rem] uppercase tracking-wide text-muted-foreground">{t('fields.product')}</Label>
          <Select value={selectValue} onValueChange={onSelectChange}>
            <SelectTrigger className="mt-2 bg-card">
              <SelectValue placeholder={t('fields.productPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FREE_TEXT_VALUE}>{t('fields.productPlaceholder')}</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFreeText ? (
            <div className="mt-3">
              <Input
                className="bg-card"
                placeholder={t('fields.productPlaceholder')}
                autoComplete="off"
                {...form.register(`lines.${index}.freeText`)}
              />
              <FieldError message={lineErrors?.freeText?.message} />
            </div>
          ) : null}
        </div>
        <div className="sm:col-span-3">
          <Label htmlFor={`quote-line-${index}-quantity`} className="text-[0.8rem] uppercase tracking-wide text-muted-foreground">{t('fields.quantity')} *</Label>
          <Input
            id={`quote-line-${index}-quantity`}
            type="number"
            className="mt-2 bg-card"
            inputMode="decimal"
            min={0}
            step="any"
            {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
          />
          <FieldError message={lineErrors?.quantity?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`quote-line-${index}-unit`} className="text-[0.8rem] uppercase tracking-wide text-muted-foreground">{t('fields.unit')}</Label>
          <Input
            id={`quote-line-${index}-unit`}
            className="mt-2 bg-card text-xs font-semibold tabular-nums tracking-widest text-primary uppercase"
            placeholder="BID, SAC…"
            autoComplete="off"
            {...form.register(`lines.${index}.unit`)}
          />
        </div>
        <div className="flex h-[72px] items-center justify-end sm:col-span-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label={t('removeLine')}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

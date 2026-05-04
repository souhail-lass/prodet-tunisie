'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
}

const FREE_TEXT_VALUE = '__free_text__';

export function QuoteForm({ products, sectors, prefilledProductSlug }: QuoteFormProps) {
  const t = useTranslations('devis.form');
  const tCommon = useTranslations('common');

  const productMap = new Map(products.map((p) => [p.slug, p]));
  const initialProduct = prefilledProductSlug ? productMap.get(prefilledProductSlug) : undefined;

  const [serverError, setServerError] = useState<string | undefined>();
  const [referenceCode, setReferenceCode] = useState<string | undefined>();

  const form = useForm<QuoteRequestInput>({
    resolver: zodResolver(QuoteRequestSchema),
    defaultValues: {
      company: '',
      name: '',
      email: '',
      phone: '',
      sectorKey: '',
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

  useEffect(() => {
    if (!initialProduct) return;
    form.setValue('lines.0.productSlug', initialProduct.slug);
    form.setValue('lines.0.unit', initialProduct.unit);
  }, [initialProduct, form]);

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
      <Card>
        <CardHeader>
          <CardTitle>{t('contactTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="quote-company">{t('fields.company')} *</Label>
            <Input
              id="quote-company"
              aria-invalid={Boolean(form.formState.errors.company)}
              {...form.register('company')}
            />
            <FieldError message={form.formState.errors.company?.message} />
          </div>
          <div>
            <Label htmlFor="quote-name">{t('fields.name')} *</Label>
            <Input
              id="quote-name"
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
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(form.formState.errors.phone)}
              {...form.register('phone')}
            />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>
          <div className="sm:col-span-2">
            <Label>{t('fields.sector')}</Label>
            <Select
              value={form.watch('sectorKey') ?? ''}
              onValueChange={(value) =>
                form.setValue('sectorKey', value === '' ? undefined : value, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={t('sectorPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('linesTitle')}</CardTitle>
          <p className="text-muted-foreground text-sm">{t('linesHelp')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
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
            className="rounded-full"
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

      <Card>
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
        <p role="alert" className="text-destructive text-sm">
          {serverError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="rounded-full px-6"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? tCommon('actions.submitting') : t('submit')}
      </Button>
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
  const slug = form.watch(`lines.${index}.productSlug`);
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
    <div className="border-border rounded-md border p-4">
      <div className="grid gap-4 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <Label>{t('fields.product')}</Label>
          <Select value={selectValue} onValueChange={onSelectChange}>
            <SelectTrigger className="mt-1.5">
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
                placeholder={t('fields.productPlaceholder')}
                {...form.register(`lines.${index}.freeText`)}
              />
              <FieldError message={lineErrors?.freeText?.message} />
            </div>
          ) : null}
        </div>
        <div className="sm:col-span-3">
          <Label htmlFor={`quote-line-${index}-quantity`}>{t('fields.quantity')} *</Label>
          <Input
            id={`quote-line-${index}-quantity`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
          />
          <FieldError message={lineErrors?.quantity?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`quote-line-${index}-unit`}>{t('fields.unit')}</Label>
          <Input
            id={`quote-line-${index}-unit`}
            placeholder="BID, SAC, FLA…"
            {...form.register(`lines.${index}.unit`)}
          />
        </div>
        <div className="flex items-end sm:col-span-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
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

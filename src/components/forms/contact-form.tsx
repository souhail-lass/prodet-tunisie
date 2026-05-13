'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
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
import { submitContactMessage } from '@/features/contact/actions';
import {
  ContactMessageSchema,
  ContactSubjects,
  type ContactMessageInput,
  type ContactSubject,
} from '@/features/contact/schema';

export function ContactForm() {
  const t = useTranslations('contact.form');
  const tCommon = useTranslations('common');
  const [serverError, setServerError] = useState<string | undefined>();
  const [referenceCode, setReferenceCode] = useState<string | undefined>();

  const form = useForm<ContactMessageInput>({
    resolver: zodResolver(ContactMessageSchema),
    defaultValues: {
      company: '',
      name: '',
      email: '',
      phone: '',
      subject: 'quote',
      message: '',
      website: '',
    },
  });

  const subject = form.watch('subject');

  async function onSubmit(values: ContactMessageInput) {
    setServerError(undefined);
    try {
      const result = await submitContactMessage(values);
      if (result.ok) {
        setReferenceCode(result.referenceCode);
        form.reset();
        return;
      }
      if (result.fieldErrors) {
        for (const [path, messages] of Object.entries(result.fieldErrors)) {
          if (path === '_root') continue;
          form.setError(path as keyof ContactMessageInput, {
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            {...form.register('website')}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="contact-company">{t('fields.company')}</Label>
              <Input
                id="contact-company"
                autoComplete="organization"
                {...form.register('company')}
              />
              <FieldError message={form.formState.errors.company?.message} />
            </div>
            <div>
              <Label htmlFor="contact-name">{t('fields.name')} *</Label>
              <Input
                id="contact-name"
                autoComplete="name"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register('name')}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="contact-email">{t('fields.email')} *</Label>
              <Input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register('email')}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="contact-phone">{t('fields.phone')}</Label>
              <Input
                id="contact-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(form.formState.errors.phone)}
                {...form.register('phone')}
              />
              <FieldError message={form.formState.errors.phone?.message} />
            </div>
          </div>
          <div>
            <Label>{t('fields.subject')} *</Label>
            <Select
              value={subject}
              onValueChange={(value) =>
                form.setValue('subject', value as ContactSubject, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ContactSubjects.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`subjectOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contact-message">{t('fields.message')} *</Label>
            <Textarea
              id="contact-message"
              rows={5}
              autoComplete="off"
              aria-invalid={Boolean(form.formState.errors.message)}
              {...form.register('message')}
            />
            <FieldError message={form.formState.errors.message?.message} />
          </div>
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
      </CardContent>
    </Card>
  );
}

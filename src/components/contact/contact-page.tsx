'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button, Input, Select, Textarea } from '@/components/ds';
import { WhatsappIcon } from '@/components/site/whatsapp-icon';
import { companyInfo } from '@/data/company';
import { listSectors } from '@/data/queries';
import { localizeSectors } from '@/data/i18n/content';
import type { Locale } from '@/i18n/routing';
import { submitContactMessage } from '@/features/contact/actions';

type FormState = { company: string; name: string; email: string; phone: string; sectorId: string; message: string };

const INITIAL: FormState = { company: '', name: '', email: '', phone: '', sectorId: '', message: '' };

const WHATSAPP_HREF = `https://wa.me/${companyInfo.phoneHref.replace(/[^0-9]/g, '')}`;

export function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale() as Locale;
  const sectorOptions = localizeSectors(listSectors(), locale).map((s) => ({ value: s.id, label: s.label }));

  const [form, setForm] = useState<FormState>(INITIAL);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const sectorLabel = sectorOptions.find((o) => o.value === form.sectorId)?.label;
    const message = sectorLabel ? `Secteur: ${sectorLabel}\n\n${form.message}` : form.message;

    startTransition(async () => {
      const result = await submitContactMessage({
        company: form.company,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: 'quote',
        message,
      });
      if (result.ok) setSent(true);
      else setError(t('error'));
    });
  }

  return (
    <div className="contact">
      <div className="contact__hero">
        <div className="section-wrap">
          <span className="eyebrow eyebrow--ondark">{t('hero.eyebrow')}</span>
          <h1 className="contact__title">{t('hero.title')}</h1>
          <p className="contact__lead">{t('hero.lead')}</p>
        </div>
      </div>

      <div className="section-wrap contact__layout">
        <div className="contact__form-card">
          {sent ? (
            <div className="contact__success">
              <span className="contact__success-icon">
                <Check size={26} />
              </span>
              <h2>{t('success.title')}</h2>
              <p>{t('success.body')}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false);
                  setForm(INITIAL);
                }}
              >
                {t('success.again')}
              </Button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="contact__form-title">{t('form.title')}</h2>
              <div className="contact__grid">
                <Input
                  label={t('fields.company')}
                  placeholder={t('placeholders.company')}
                  required
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                />
                <Input
                  label={t('fields.name')}
                  placeholder={t('placeholders.name')}
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
                <Input
                  label={t('fields.email')}
                  type="email"
                  icon={<Mail size={17} />}
                  placeholder={t('placeholders.email')}
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <Input
                  label={t('fields.phone')}
                  icon={<Phone size={17} />}
                  placeholder={t('placeholders.phone')}
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
                <div className="contact__span">
                  <Select
                    label={t('fields.sector')}
                    placeholder={t('placeholders.sector')}
                    options={sectorOptions}
                    value={form.sectorId}
                    onChange={(e) => update('sectorId', e.target.value)}
                  />
                </div>
                <div className="contact__span">
                  <Textarea
                    label={t('fields.message')}
                    placeholder={t('placeholders.message')}
                    required
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                  />
                </div>
              </div>
              {error ? (
                <p className="pds-field__error" style={{ marginTop: '12px' }}>
                  {error}
                </p>
              ) : null}
              <div className="contact__actions">
                <Button type="submit" variant="primary" size="lg" disabled={isPending} iconRight={<ArrowRight size={18} />}>
                  {isPending ? t('submitting') : t('submit')}
                </Button>
                <Button type="button" variant="success" size="lg" onClick={() => window.open(WHATSAPP_HREF, '_blank')} iconLeft={<WhatsappIcon size={18} />}>
                  {t('whatsapp')}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="contact__info">
          <div className="contact__info-item">
            <span className="contact__info-icon">
              <MapPin size={18} />
            </span>
            <div>
              <strong>{t('info.address')}</strong>
              <span>
                {companyInfo.name}
                <br />
                {companyInfo.addressFull}
              </span>
            </div>
          </div>
          <div className="contact__info-item">
            <span className="contact__info-icon">
              <Phone size={18} />
            </span>
            <div>
              <strong>{t('info.phone')}</strong>
              <span>{companyInfo.phoneDisplay}</span>
            </div>
          </div>
          <div className="contact__info-item">
            <span className="contact__info-icon">
              <Mail size={18} />
            </span>
            <div>
              <strong>{t('info.email')}</strong>
              <span>{companyInfo.email}</span>
            </div>
          </div>
          <div className="contact__info-item">
            <span className="contact__info-icon">
              <Clock size={18} />
            </span>
            <div>
              <strong>{t('info.hours')}</strong>
              <span>{t('info.hoursValue')}</span>
            </div>
          </div>
          <div className="contact__map" aria-hidden>
            <div className="contact__map-grid" />
            <span className="contact__map-pin">
              <MapPin size={22} />
            </span>
            <span className="contact__map-label">{t('info.mapLabel')}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

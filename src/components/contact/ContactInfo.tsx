'use client';

import { Clock, FileText, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { companyInfo } from '@/data/company';

const rows = [
  {
    label: 'ADRESSE',
    icon: MapPin,
    value: "20 Rue de Somalie\nL'Aouina, Tunis 2045",
    tag: 'Siège & Site de production',
  },
  {
    label: 'TÉLÉPHONE',
    icon: Phone,
    value: '+216 71 758 468',
    href: companyInfo.phoneHref,
  },
  {
    label: 'EMAIL',
    icon: Mail,
    value: companyInfo.email,
    href: companyInfo.emailHref,
  },
  {
    label: 'HORAIRES',
    icon: Clock,
    value: 'Lun – Ven · 8h00 – 17h00',
  },
] as const;

export function ContactInfo({ whatsappNumber }: { whatsappNumber?: string }) {
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${normalizeWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent('Bonjour Prodet, je souhaite...')}`
    : null;

  return (
    <aside className="space-y-3.5">
      <section className="rounded-[14px] border-[0.5px] border-[#E5E7EB] bg-white p-6">
        <h2 className="mb-[18px] text-[15px] font-semibold text-[#1C2B3A]">
          Coordonnées Prodet
        </h2>

        <div>
          {rows.map((row, index) => {
            const Icon = row.icon;
            const content = (
              <>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
                  {row.label}
                </p>
                {'href' in row ? (
                  <a
                    href={row.href}
                    className="mt-1 inline-flex text-[13px] font-medium leading-[1.5] text-[#1B5FA7] hover:text-[#0D3B73]"
                  >
                    {row.value}
                  </a>
                ) : (
                  <p className="mt-1 whitespace-pre-line text-[13px] leading-[1.5] text-[#1C2B3A]">
                    {row.value}
                  </p>
                )}
                {'tag' in row ? (
                  <span className="mt-1 inline-block rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] text-[#1F9C49]">
                    {row.tag}
                  </span>
                ) : null}
              </>
            );

            return (
              <div
                key={row.label}
                className={`flex items-start gap-3 py-2.5 ${
                  index < rows.length - 1 ? 'border-b-[0.5px] border-[#F3F4F6]' : ''
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <Icon className="h-4 w-4 text-[#1B5FA7]" aria-hidden />
                </div>
                <div className="min-w-0">{content}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[14px] border-[0.5px] border-[#BBF7D0] bg-[#F0FDF4] p-5">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 shrink-0 text-[#1F9C49]" aria-hidden />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-semibold text-[#166534]">WhatsApp</h2>
              {!whatsappHref ? (
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[#166534]">
                  à venir
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[12px] leading-[1.5] text-[#166534]/80">
              Envoyez-nous un message directement.
            </p>
          </div>
        </div>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#1F9C49] px-[18px] py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#177A39] hover:text-white"
          >
            Ouvrir WhatsApp
          </a>
        ) : (
          <span className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#1F9C49]/50 px-[18px] py-2.5 text-[12px] font-medium text-white">
            Ouvrir WhatsApp
          </span>
        )}
      </section>

      <section className="rounded-[14px] border-[0.5px] border-[#E5E7EB] bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#EFF6FF]">
            <FileText className="h-6 w-6 text-[#1B5FA7]" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-[#1C2B3A]">Fiche technique</h2>
            <p className="mt-0.5 text-[12px] leading-[1.5] text-[#6B7280]">
              Demandez la fiche technique d&apos;un produit spécifique.
            </p>
          </div>
        </div>

        <a
          href={`mailto:${companyInfo.email}?subject=${encodeURIComponent('Demande de fiche technique')}&body=${encodeURIComponent('Bonjour Prodet,\n\nJe souhaite recevoir la fiche technique du produit suivant :\n\n')}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border-[0.5px] border-[#1B5FA7] px-4 py-2.5 text-[12px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF]"
        >
          Demander une fiche technique
        </a>
      </section>
    </aside>
  );
}

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/gu, '');
}

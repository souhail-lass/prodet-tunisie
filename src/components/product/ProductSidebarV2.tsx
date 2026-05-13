'use client';

import {
  Clock,
  FileText,
  Leaf,
  Mail,
  MessageCircle,
  Phone,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Product } from '@/data/types';

interface ProductSidebarV2Props {
  product: Product;
  whatsappNumber?: string;
}

export function ProductSidebarV2({ product, whatsappNumber }: ProductSidebarV2Props) {
  const hasQuality = Boolean(product.biodegradability || product.certifications?.length);
  const whatsappHref = whatsappNumber ? buildWhatsAppHref(whatsappNumber, product.name) : null;

  return (
    <aside className="grid gap-3 md:sticky md:top-20 md:self-start max-md:flex max-md:overflow-x-auto max-md:pb-1">
      <SidebarCard title="Téléchargements">
        <div className="grid gap-2">
          {product.technicalSheetUrl ? (
            <SidebarLink href={product.technicalSheetUrl} icon={FileText} download>
              Fiche technique (PDF)
            </SidebarLink>
          ) : (
            <SidebarLink href="/devis" icon={FileText}>
              Fiche technique (PDF)
            </SidebarLink>
          )}
          <SidebarLink href="/devis" icon={Tag}>
            Étiquette produit
          </SidebarLink>
        </div>
      </SidebarCard>

      {hasQuality ? (
        <SidebarCard>
          {product.biodegradability ? (
            <div className="rounded-lg border-[0.5px] border-[#BBF7D0] bg-[#F0FDF4] p-2.5">
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#166534]">
                <Leaf className="h-4 w-4 text-[#1F9C49]" aria-hidden />
                Biodégradabilité {product.biodegradability}
              </div>
              <p className="mt-1 text-[10px] leading-4 text-[#166534]/80">
                Formule respectueuse de l&apos;environnement
              </p>
            </div>
          ) : null}

          {product.certifications?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.certifications.map((certification) => (
                <span
                  key={certification}
                  className="rounded-full bg-[#F0FDF4] px-2 py-1 text-[10px] font-medium text-[#166534]"
                >
                  {certification}
                </span>
              ))}
            </div>
          ) : null}
        </SidebarCard>
      ) : null}

      <SidebarCard title="Contact direct">
        <div className="grid gap-2 text-[#1C2B3A]">
          <ContactLine icon={Phone}>71 758 468</ContactLine>
          <ContactLine icon={Mail}>prodet.tunisie@gmail.com</ContactLine>
          <ContactLine icon={Clock} muted>
            Lun–Ven · 8h–17h
          </ContactLine>
        </div>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5FA7] px-3 py-2.5 text-[11px] font-medium text-white transition-colors hover:bg-[#1650A0] hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            Contacter par WhatsApp
          </a>
        ) : null}
      </SidebarCard>
    </aside>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-[240px] overflow-hidden rounded-[14px] border-[0.5px] border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-[0_18px_48px_-44px_rgba(13,59,115,0.38)]">
      <span
        className="absolute right-[-22px] top-[-22px] h-14 w-14 rounded-full bg-[#EFF6FF]"
        aria-hidden
      />
      {title ? (
        <h2 className="relative mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
          {title}
        </h2>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  children,
  download,
}: {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      download={download}
      className={sidebarActionClassName}
    >
      <Icon className="h-4 w-4 shrink-0 text-[#6B7280] transition-colors group-hover:text-[#1B5FA7]" aria-hidden />
      <span>{children}</span>
    </a>
  );
}

function ContactLine({
  icon: Icon,
  muted,
  children,
}: {
  icon: LucideIcon;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-2 text-[11px]',
        muted ? 'text-[10px] text-[#9CA3AF]' : 'text-[#1C2B3A]',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

const sidebarActionClassName =
  'group inline-flex w-full items-center gap-2 rounded-lg border-[0.5px] border-[#E5E7EB] bg-[#FFFFFF] px-3 py-[9px] text-left text-[11px] font-semibold text-[#6B7280] transition-all duration-150 hover:border-[#1B5FA7] hover:text-[#1B5FA7]';

function buildWhatsAppHref(whatsappNumber: string, productName: string): string {
  const message = encodeURIComponent(
    `Bonjour, je souhaite des informations sur ${productName}`,
  );
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}

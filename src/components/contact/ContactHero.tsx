import { Clock, Mail, Phone } from 'lucide-react';
import { companyInfo } from '@/data/company';

const contactPills = [
  {
    label: 'Téléphone',
    value: '+216 71 758 468',
    icon: Phone,
    href: companyInfo.phoneHref,
  },
  {
    label: 'Email',
    value: companyInfo.email,
    icon: Mail,
    href: companyInfo.emailHref,
  },
  {
    label: 'Horaires',
    value: 'Lun – Ven · 8h00 – 17h00',
    icon: Clock,
  },
] as const;

export function ContactHero() {
  return (
    <section className="bg-[#0D3B73] py-12 sm:pb-12 sm:pt-14">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 md:grid-cols-[60fr_40fr]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#33B5F6]">
            CONTACT
          </p>
          <h1 className="mt-3 max-w-[660px] text-[34px] font-bold leading-[1.15] text-white sm:text-[42px]">
            Parlez-nous de vos besoins professionnels
          </h1>
          <p className="mt-4 max-w-[420px] text-[14px] leading-[1.7] text-[rgba(255,255,255,0.65)]">
            Pour une question produit, une information commerciale ou un suivi — l&apos;échange
            commence par un contact direct avec l&apos;équipe Prodet.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4">
          {contactPills.map((pill) => {
            const Icon = pill.icon;
            const content = (
              <>
                <Icon className="h-[18px] w-[18px] shrink-0 text-[#33B5F6]" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,255,0.5)]">
                    {pill.label}
                  </p>
                  <p className="mt-0.5 truncate text-[14px] font-medium text-white">
                    {pill.value}
                  </p>
                </div>
              </>
            );

            if ('href' in pill) {
              return (
                <a
                  key={pill.label}
                  href={pill.href}
                  className="flex w-full items-center gap-2.5 rounded-[10px] border-[0.5px] border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={pill.label}
                className="flex w-full items-center gap-2.5 rounded-[10px] border-[0.5px] border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] px-4 py-3"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

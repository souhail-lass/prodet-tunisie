import { companyInfo } from '@/data/company';

export function TopUtilityBar() {
  return (
    <div className="bg-prodet-navy text-white">
      <div className="section-shell flex min-h-10 items-center justify-between gap-4 text-[12px]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden rounded-full border border-white/14 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/72 md:inline-flex">
            Relation directe B2B
          </span>
          <span className="hidden truncate sm:inline">{companyInfo.addressLine}</span>
          <span className="hidden text-white/45 sm:inline">|</span>
          <a
            href={companyInfo.phoneHref}
            className="tabular cursor-pointer font-medium text-white hover:text-white/80"
          >
            {companyInfo.phoneDisplay}
          </a>
        </div>
        <a
          href={companyInfo.emailHref}
          className="hidden shrink-0 cursor-pointer text-white/88 transition-colors hover:text-white sm:inline"
        >
          {companyInfo.email}
        </a>
      </div>
    </div>
  );
}

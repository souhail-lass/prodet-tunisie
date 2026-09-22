'use client';

import { useLocale, useTranslations } from 'next-intl';

type LegalPageKey = 'mentions' | 'privacy' | 'cookies';

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export function LegalPage({ page }: { page: LegalPageKey }) {
  const t = useTranslations(`legal.${page}`);
  const sections = t.raw('sections') as LegalSection[];

  return (
    <article className="legal-page section-wrap">
      <h1 className="legal-page__title">{t('title')}</h1>
      <p className="legal-page__intro">{t('intro')}</p>
      <div className="legal-page__body">
        {sections.map((section) => (
          <section key={section.heading} className="legal-page__section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <LegalParagraph key={`${section.heading}-${index}`} text={paragraph} />
            ))}
          </section>
        ))}
      </div>
      <p className="legal-page__updated">{t('updated')}</p>
    </article>
  );
}

/** Plain paragraphs with optional [[label|/path]] internal links (path without locale). */
function LegalParagraph({ text }: { text: string }) {
  const locale = useLocale();
  const parts = text.split(/(\[\[[^\]]+\]\])/u);
  return (
    <p>
      {parts.map((part, index) => {
        const match = /^\[\[([^|\]]+)\|([^\]]+)\]\]$/u.exec(part);
        if (!match) return <span key={index}>{part}</span>;
        const label = match[1] ?? '';
        const path = match[2] ?? '';
        const href = `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
        return (
          <a key={index} href={href}>
            {label}
          </a>
        );
      })}
    </p>
  );
}

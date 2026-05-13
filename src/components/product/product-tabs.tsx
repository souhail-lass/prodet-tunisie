'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { QuoteButton } from '@/components/ui/quote-modal';

export interface ProductTabSection {
  id: string;
  label: string;
}

export function ProductTabs({
  productName,
  productImage,
  quoteProductName,
  sections,
}: {
  productName: string;
  productImage: string;
  quoteProductName: string;
  sections: readonly ProductTabSection[];
}) {
  const [showHeader, setShowHeader] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

  const observerIds = useMemo(() => sections.map((section) => section.id), [sections]);

  useEffect(() => {
    function handleScroll() {
      setShowHeader(window.scrollY > 360);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const targets = observerIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.1, 0.3, 0.5, 0.7],
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [observerIds]);

  function scrollToSection(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 z-40 border-b border-border bg-white/96 backdrop-blur transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          showHeader
            ? 'top-[120px] translate-y-0 opacity-100'
            : 'pointer-events-none top-[120px] -translate-y-4 opacity-0',
        )}
      >
        <div className="section-shell flex min-h-[54px] items-center gap-3 py-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-secondary">
            <Image src={productImage} alt={productName} fill sizes="36px" className="object-contain p-1.5" />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-prodet-text">{productName}</p>
          <QuoteButton
            productName={quoteProductName}
            size="sm"
            className="cursor-pointer rounded-xl px-4 text-xs font-semibold uppercase tracking-[0.08em]"
          >
            Demander un devis
          </QuoteButton>
        </div>
      </div>

      <div
        className={cn(
          'sticky z-40 mt-8 border-y border-border bg-white/96 backdrop-blur',
          showHeader ? 'top-[174px]' : 'top-[120px]',
        )}
      >
        <div className="section-shell overflow-x-auto py-3">
          <nav className="flex min-w-max items-center gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  activeSection === section.id
                    ? 'bg-primary text-white shadow-[0_12px_24px_-18px_rgba(11,61,115,0.55)]'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:text-prodet-text',
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

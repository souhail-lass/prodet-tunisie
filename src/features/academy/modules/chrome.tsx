import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

/** Shared, presentational building blocks for Modules 1–3 (server-safe). */

const MODNAV: { href: string; label: string }[] = [
  { href: '/admin/academie', label: 'Accueil' },
  { href: '/admin/academie/m1', label: '1 · Fondamentaux' },
  { href: '/admin/academie/m2', label: '2 · Matières premières' },
  { href: '/admin/academie/m3', label: 'Construire une formule' },
  { href: '/admin/academie/gamme', label: '4 · La gamme' },
];

export function ModuleNav({ active }: { active: string }) {
  return (
    <nav className="academy-modnav" aria-label="Modules">
      {MODNAV.map((m) => (
        <Link key={m.href} href={m.href} className={m.href === active ? 'on' : ''}>
          {m.label}
        </Link>
      ))}
    </nav>
  );
}

export function ModuleHero({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead: string }) {
  return (
    <header>
      <div className="academy-modcard__num" style={{ marginBottom: 8 }}>{eyebrow}</div>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
    </header>
  );
}

export function Section({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <section>
      <div className="sec-num">{num}</div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Concept({
  tone = 'blue',
  label,
  children,
}: {
  tone?: 'blue' | 'green' | 'amber' | 'red';
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={`academy-concept${tone === 'blue' ? '' : ` ${tone}`}`}>
      <div className="academy-concept__label">{label}</div>
      <p>{children}</p>
    </div>
  );
}

export function Takeaways({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <div className="academy-takeaways">
      <h3>{title}</h3>
      {items.map((it, i) => (
        <div className="academy-takeaway" key={i}>
          <span className="academy-takeaway__num">{i + 1}</span>
          <p>{it}</p>
        </div>
      ))}
    </div>
  );
}

export function ModuleFooter({
  prevHref,
  nextHref,
  nextLabel,
}: {
  prevHref?: string;
  nextHref: string;
  nextLabel: string;
}) {
  return (
    <div className="academy-modfoot">
      {prevHref ? (
        <Link href={prevHref} className="academy-modcard__go">
          <ArrowLeft size={14} aria-hidden /> Précédent
        </Link>
      ) : (
        <span className="academy-modfoot__label">Suite</span>
      )}
      <Link href={nextHref} className="academy-next">
        {nextLabel} <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  );
}

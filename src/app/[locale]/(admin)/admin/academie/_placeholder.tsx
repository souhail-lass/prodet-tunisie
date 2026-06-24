import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

/** Temporary placeholder for Modules 1–3 until their content is ported (Phase 2). */
export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="academy-intro" style={{ maxWidth: 560 }}>
      <Link href="/admin/academie" className="academy-modcard__go" style={{ marginBottom: 16 }}>
        <ArrowLeft size={14} aria-hidden /> Académie
      </Link>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 10px' }}>{title}</h2>
      <p>Le contenu interactif de ce module est intégré à la phase suivante. La gamme et ses formules (Module 4) sont déjà disponibles, protégées par code.</p>
    </div>
  );
}

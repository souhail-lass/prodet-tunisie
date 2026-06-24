import { ChevronRight, GraduationCap, Lock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ModuleNav } from '@/features/academy/modules/chrome';

export const dynamic = 'force-dynamic';

/**
 * Académie Prodet — landing. Modules 1–3 (theory) are open to any admin;
 * Module 4 (the confidential range + formulas) is gated by an access code.
 *
 * NOTE: full content of Modules 1–3 is ported in Phase 2. For now they link to
 * placeholder routes; Module 4 (gamme) carries the working, code-protected
 * explorer.
 */
const MODULES: {
  num: string;
  ico: string;
  title: string;
  desc: string;
  href: string;
  locked?: boolean;
}[] = [
  {
    num: '01',
    ico: '🎯',
    title: 'Les fondamentaux du nettoyage',
    desc: 'Cercle de Sinner, pourquoi l’eau seule ne lave pas, 5 types de salissures, eau dure tunisienne.',
    href: '/admin/academie/m1',
  },
  {
    num: '02',
    ico: '🧪',
    title: 'Les matières premières',
    desc: 'Tensioactifs, séquestrants, pH, blanchiment, épaississants — avec simulations interactives.',
    href: '/admin/academie/m2',
  },
  {
    num: '03',
    ico: '⚗️',
    title: 'Construire une formule',
    desc: 'Logique de formulation, ordre d’incorporation, constructeur de formule interactif.',
    href: '/admin/academie/m3',
  },
  {
    num: '04',
    ico: '📦',
    title: 'La gamme Prodet',
    desc: 'Tes produits famille par famille : usage, cible, logique de formule, reformulations et coûts.',
    href: '/admin/academie/gamme',
    locked: true,
  },
];

export default function AcademyHomePage() {
  return (
    <div>
      <ModuleNav active="/admin/academie" />
      <div className="academy-intro">
        <p>
          Formation interne sur la détergence et outil de référence sur la gamme. Les trois premiers modules
          (théorie) sont ouverts. La gamme et ses formules confidentielles (Module 4) sont protégées par un code.
        </p>
      </div>

      <div className="academy-modcards">
        {MODULES.map((m) => (
          <Link key={m.num} href={m.href} className="academy-modcard">
            <div className="academy-modcard__num">{m.num}</div>
            <div className={`academy-modcard__ico${m.locked ? ' academy-modcard__locked-ico' : ''}`} aria-hidden>
              {m.locked ? <GraduationCap size={22} /> : m.ico}
            </div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            {m.locked ? (
              <span className="academy-modcard__lock">
                <Lock size={13} aria-hidden /> Accès par code
              </span>
            ) : (
              <span className="academy-modcard__go">
                Ouvrir <ChevronRight size={14} aria-hidden />
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

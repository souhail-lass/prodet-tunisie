import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ModuleNav } from '@/features/academy/modules/chrome';

export const dynamic = 'force-dynamic';

const MODULES: { num: string; ico: string; title: string; desc: string; href: string }[] = [
  {
    num: '01',
    ico: '🎯',
    title: 'Les fondamentaux du nettoyage',
    desc: 'Cercle de Sinner, pourquoi l’eau seule ne lave pas, 5 types de salissures, eau dure tunisienne.',
    href: '/admin/academie/apprendre/m1',
  },
  {
    num: '02',
    ico: '🧪',
    title: 'Les matières premières',
    desc: 'Tensioactifs, séquestrants, pH, blanchiment, épaississants — avec 6 simulations interactives.',
    href: '/admin/academie/apprendre/m2',
  },
  {
    num: '03',
    ico: '⚗️',
    title: 'Construire une formule',
    desc: 'Logique de formulation, ordre d’incorporation, constructeur de formule interactif.',
    href: '/admin/academie/apprendre/m3',
  },
];

export default function ApprendreHubPage() {
  return (
    <div className="academy-mod">
      <ModuleNav active="/admin/academie/apprendre" />
      <div className="academy-intro" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 10px' }}>Apprendre la détergence</h1>
        <p>
          Trois modules courts et interactifs : la science derrière chaque produit Prodet. Manipule, comprends, puis
          retrouve la mise en pratique dans <strong>La Gamme</strong>.
        </p>
      </div>
      <div className="learn-cards">
        {MODULES.map((m) => (
          <Link key={m.num} href={m.href} className="learn-card">
            <div className="learn-card__num">{m.num}</div>
            <div className="learn-card__ico" aria-hidden>{m.ico}</div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <span className="academy-modcard__go" style={{ marginTop: 12 }}>
              Ouvrir <ChevronRight size={14} aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { familles, getSousCategoriesForFamille, type FamilleId } from '@/data/familles';

/**
 * Greenlab-style category tree shown on the famille / sous-catégorie pages.
 * Server component — reads labels from the `familles` namespace. The active
 * famille is expanded to reveal its sous-catégories.
 */
export async function CategorySidebar({
  locale,
  activeFamille,
  activeSousCat,
}: {
  locale: Locale;
  activeFamille: FamilleId;
  activeSousCat?: string;
}) {
  const tf = await getTranslations({ locale, namespace: 'familles' });
  const ordered = [...familles].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <aside className="cat-sidebar">
      <div className="cat-sidebar__title">{tf('sidebar.title')}</div>
      <nav className="cat-sidebar__nav">
        {ordered.map((famille) => {
          const isActive = famille.id === activeFamille;
          return (
            <div className="cat-sidebar__group" key={famille.id}>
              <Link
                href={`/produits/${famille.id}`}
                className={`cat-sidebar__fam${isActive ? ' is-active' : ''}`}
              >
                {tf(`items.${famille.id}.label`)}
              </Link>
              {isActive ? (
                <ul className="cat-sidebar__subs">
                  {getSousCategoriesForFamille(famille.id).map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/produits/${famille.id}/${sub.slug}`}
                        className={`cat-sidebar__sub${sub.slug === activeSousCat ? ' is-active' : ''}`}
                      >
                        {tf(`souscats.${sub.slug}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

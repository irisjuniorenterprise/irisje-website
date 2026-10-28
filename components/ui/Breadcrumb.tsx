'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './Breadcrumb.module.css';

type BreadcrumbProps = {
  /**
   * `true` : version « en ligne », sans fond, sans bordure ni conteneur, pour
   * être intégrée à la barre fusionnée (components/layout/SectionNav.tsx).
   * `false` (défaut) : barre autonome pleine largeur (pages 404 racine).
   */
  inline?: boolean;
};

export default function Breadcrumb({ inline = false }: BreadcrumbProps) {
  const pathname = usePathname();
  const t = useTranslations('Breadcrumb');

  // Extraire la locale du pathname
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'fr';
  const pathWithoutLocale = '/' + segments.slice(1).join('/');

  // Si on est sur la page d'accueil, on n'affiche pas le fil d'Ariane
  if (pathWithoutLocale === '/') {
    return null;
  }

  const isRtl = locale === 'ar';

  // Fonction pour récupérer le libellé traduit d'une route
  const getRouteLabel = (path: string): string => {
    // Clé de traduction pour cette route (ex: 'routes./a-propos')
    const key = `routes.${path}`;
    // Vérifier si la traduction existe pour cette clé
    if (t.has(key)) {
      return t(key);
    }
    // Sinon, afficher "Page non trouvée" dans la langue courante
    return t('notFound');
  };

  // Construire les segments du breadcrumb
  const breadcrumbs = [];
  let currentPath = '';
  for (const segment of pathWithoutLocale.split('/').filter(Boolean)) {
    currentPath += `/${segment}`;
    const label = getRouteLabel(currentPath);
    breadcrumbs.push({
      path: `/${locale}${currentPath}`,
      label: label,
      isLast: currentPath === pathWithoutLocale,
    });
  }

  const list = (
    <ol className={styles.list}>
      <li className={styles.item}>
        <Link href={`/${locale}`} className={styles.link}>
          <Icons.Home size={16} className={styles.homeIcon} />
          <span className={styles.homeLabel}>{t('home')}</span>
        </Link>
        <Icons.ChevronRight size={14} className={styles.separator} />
      </li>
      {breadcrumbs.map((crumb, index) => (
        <li key={crumb.path} className={styles.item}>
          {crumb.isLast ? (
            // Élément courant du fil d'Ariane : annoncé tel quel, et le
            // style `.active` n'est plus le seul indicateur d'état.
            <span className={`${styles.link} ${styles.active}`} aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <>
              <Link href={crumb.path} className={styles.link}>
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <Icons.ChevronRight size={14} className={styles.separator} />
              )}
            </>
          )}
        </li>
      ))}
    </ol>
  );

  return (
    <nav
      className={`${styles.breadcrumb} ${inline ? styles.inline : ''} ${isRtl ? styles.rtl : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label={t('label')}
    >
      {inline ? list : <div className="container">{list}</div>}
    </nav>
  );
}

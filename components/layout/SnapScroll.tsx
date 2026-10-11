// components/layout/SnapScroll.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import './snap-scroll.css';

/**
 * Pages (sans le préfixe de locale) où le snap scroll strict est activé.
 * '' = accueil. Ajoute ou retire des routes ici (ex. 'faq').
 */
const SNAP_ROUTES = ['', 'a-propos', 'services'];

export default function SnapScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const route = segments.slice(1).join('/'); // sans la locale
    const root = document.documentElement;

    if (SNAP_ROUTES.includes(route)) {
      root.setAttribute('data-snap', 'y');
    } else {
      root.removeAttribute('data-snap');
    }

    // Nettoyage au changement de page / démontage
    return () => root.removeAttribute('data-snap');
  }, [pathname]);

  return null;
}
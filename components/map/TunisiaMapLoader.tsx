// components/map/TunisiaMapLoader.tsx
'use client';

// Point d'entrée client de la carte : Leaflet accède à `window`, donc le
// composant est importé dynamiquement avec ssr: false. Next.js n'autorise pas
// ssr: false depuis un Server Component (la page à propos en est un), d'où ce
// petit wrapper client.
//
// Référence : node_modules/next/dist/docs/.../lazy-loading.md
// « ssr: false is not supported in Server Components ... move it into Client Components »

import dynamic from 'next/dynamic';
import styles from './TunisiaMapLoader.module.css';

const TunisiaMap = dynamic(() => import('./TunisiaMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.placeholder} role="status" aria-live="polite" />
  ),
});

type TunisiaMapLoaderProps = {
  markerLabel: string;
  countryLabel: string;
  attribution: string;
  errorLabel: string;
};

export default function TunisiaMapLoader(props: TunisiaMapLoaderProps) {
  return <TunisiaMap {...props} />;
}

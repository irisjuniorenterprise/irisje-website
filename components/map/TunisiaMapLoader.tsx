// components/map/TunisiaMapLoader.tsx
'use client';

// Point d'entrée client de la carte. Deux niveaux de chargement différé :
//
//  1. next/dynamic (ssr: false) : Leaflet accède à `window`, donc le composant
//     n'est jamais rendu côté serveur. Next.js n'autorise pas ssr: false depuis
//     un Server Component (la page « à propos » en est un), d'où ce wrapper
//     client.
//  2. LazyOnVisible : le chunk Leaflet + react-leaflet + CSS Leaflet ET le
//     fetch du GeoJSON (~1,9 Mo, déclenché au montage de TunisiaMap) ne
//     démarrent que lorsque la section « Nous trouver » approche de l'écran
//     (300 px d'avance), et non plus dès l'affichage de la page.
//
// Tant que la carte n'est pas montée, le placeholder garde exactement son
// emprise : pas de saut de mise en page.

import dynamic from 'next/dynamic';
import LazyOnVisible from '@/components/ui/LazyOnVisible';
import styles from './TunisiaMapLoader.module.css';

const MapPlaceholder = () => (
  <div className={styles.placeholder} role="status" aria-live="polite" />
);

const TunisiaMap = dynamic(() => import('./TunisiaMap'), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

type TunisiaMapLoaderProps = {
  markerLabel: string;
  countryLabel: string;
  attribution: string;
  errorLabel: string;
};

export default function TunisiaMapLoader(props: TunisiaMapLoaderProps) {
  return (
    <LazyOnVisible
      className={styles.lazy}
      rootMargin="300px"
      fallback={<MapPlaceholder />}
    >
      <TunisiaMap {...props} />
    </LazyOnVisible>
  );
}
// components/layout/PageLoader.tsx
'use client';

// Overlay de chargement PERSISTANT, avec durée minimale d'affichage.
//
// Next.js démonte le loading.tsx dès que la page est prête : une page
// rapide n'afficherait donc presque jamais le logo. Ce composant, placé
// dans le layout (hors <Suspense>), garantit que l'écran de chargement
// reste visible au moins MIN_DURATION_MS — le temps d'une pulsation
// complète du logo (zoom avant puis arrière, voir ldg-pulse) :
//   - au premier chargement : durée comptée depuis le début de la
//     navigation (performance.now()), donc sans attente supplémentaire si
//     la page a déjà mis plus longtemps à arriver ;
//   - à chaque changement de page (pathname) : durée comptée depuis le
//     changement, y compris lors d'un changement de langue.
//
// `children` est le <LoadingScreen instant /> rendu côté serveur (passé par
// le layout) : le SVG du logo n'alourdit pas le JavaScript client, et le
// logo est déjà dans le HTML initial, affiché avant toute hydratation.
//
// Filet de sécurité sans JavaScript : l'overlay se retire tout seul après
// 6 s (voir PageLoader.module.css), le contenu n'est jamais bloqué.
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PageLoader.module.css';

/** Une pulsation complète du logo = période de ldg-pulse (1,2 s). */
const MIN_DURATION_MS = 1200;
/** Mouvement réduit : le logo ne pulse pas, on raccourcit l'attente. */
const MIN_DURATION_REDUCED_MS = 400;

// Passe à true quand l'overlay du tout premier chargement a été retiré.
// Reste en mémoire pendant la navigation côté client : un remontage du
// layout (changement de langue) compte alors sa durée depuis zéro.
let initialLoadDone = false;

type PageLoaderProps = {
  children: ReactNode;
};

export default function PageLoader({ children }: PageLoaderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  // Incrémenté à chaque changement de page : relance l'overlay et ses animations.
  const [cycle, setCycle] = useState(0);
  const [previousPath, setPreviousPath] = useState(pathname);

  // Changement de page : l'overlay est réaffiché dès ce rendu (avant que
  // la nouvelle page ne soit peinte), pas dans un effet.
  if (pathname !== previousPath) {
    setPreviousPath(pathname);
    setCycle((value) => value + 1);
    setVisible(true);
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDuration = reduced ? MIN_DURATION_REDUCED_MS : MIN_DURATION_MS;
    // Premier chargement : une partie de la durée s'est déjà écoulée.
    const elapsed = cycle === 0 && !initialLoadDone ? performance.now() : 0;

    const timer = window.setTimeout(() => {
      initialLoadDone = true;
      setVisible(false);
    }, Math.max(0, minDuration - elapsed));

    return () => window.clearTimeout(timer);
  }, [cycle]);

  return (
    <div
      key={cycle}
      className={styles.overlay}
      data-state={visible ? 'visible' : 'hidden'}
      data-nav={cycle > 0}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
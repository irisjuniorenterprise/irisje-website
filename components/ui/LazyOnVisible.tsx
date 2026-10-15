// components/ui/LazyOnVisible.tsx
'use client';

// Montage différé : affiche `fallback` tant que le conteneur n'est pas proche
// de la zone visible, puis monte `children`. Combiné à next/dynamic, le code
// du composant (et ses données éventuelles) n'est téléchargé qu'à ce moment.
//
// - `rootMargin` : distance d'anticipation (ex. '300px' = on commence à charger
//   300 px avant que le bloc n'entre à l'écran, pour éviter tout « vide »).
// - Une fois monté, le contenu reste monté (l'observateur est déconnecté).
// - Sans IntersectionObserver (très vieux navigateurs), le contenu est monté
//   immédiatement : aucune fonctionnalité n'est perdue.
// - Le conteneur observé doit avoir une hauteur (le fallback doit donc occuper
//   la place du contenu final, ce qui évite aussi les sauts de mise en page).

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type LazyOnVisibleProps = {
  /** Contenu à monter quand le bloc approche de l'écran */
  children: ReactNode;
  /** Espace réservé affiché avant le montage (même emprise que le contenu) */
  fallback: ReactNode;
  /** Marge d'anticipation de l'observateur (syntaxe CSS margin) */
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
};

export default function LazyOnVisible({
  children,
  fallback,
  rootMargin = '200px',
  className,
  style,
}: LazyOnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    // Navigateur sans IntersectionObserver : on monte juste après le rendu.
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className} style={style}>
      {visible ? children : fallback}
    </div>
  );
}
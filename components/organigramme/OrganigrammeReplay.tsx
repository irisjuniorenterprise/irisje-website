// components/organigramme/OrganigrammeReplay.tsx
//
// Enveloppe client de l'organigramme : (re)joue l'animation d'entrée
//   - à chaque rechargement de la page,
//   - à chaque navigation depuis une autre page vers « À propos »,
//   - au retour arrière / avant du navigateur (cache bfcache compris).
//
// Principe : l'animation reste en pause (data-anim="idle") tant que la section
// n'est pas visible à l'écran ; dès qu'elle y entre, on passe à data-anim="play"
// et le CSS (Organigramme.module.css) lance la chorégraphie. Ainsi elle ne se
// déroule plus « dans le vide » en bas de page avant que l'utilisateur arrive.
// Les composants serveur passés en `children` restent rendus côté serveur.

'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** La séquence démarre quand le haut de la section est entré dans l'écran
 *  (marge basse de 15 % pour ne pas démarrer collé au bord). */
const ROOT_MARGIN = '0px 0px -15% 0px';

export default function OrganigrammeReplay({ className, style, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;

    const arm = () => {
      observer?.disconnect();

      // 1) Remise à zéro : toutes les animations sont retirées, puis reflow
      //    forcé (même tâche, aucun rendu intermédiaire) pour qu'elles repartent de 0.
      el.dataset.anim = 'reset';
      void el.offsetHeight;

      // 2) Pause : les éléments restent dans leur état initial (invisibles).
      el.dataset.anim = 'idle';

      // 3) Lecture dès que la section est visible.
      if (typeof IntersectionObserver === 'undefined') {
        el.dataset.anim = 'play';
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            el.dataset.anim = 'play';
            observer?.disconnect();
          }
        },
        { rootMargin: ROOT_MARGIN, threshold: 0 },
      );
      observer.observe(el);
    };

    arm();

    // Retour arrière / avant : le navigateur peut restaurer la page depuis son
    // cache (bfcache) sans la recharger ; on rejoue alors l'animation.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) arm();
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      observer?.disconnect();
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [pathname]);

  return (
    <div ref={ref} className={className} style={style} data-anim="idle">
      {children}
    </div>
  );
}

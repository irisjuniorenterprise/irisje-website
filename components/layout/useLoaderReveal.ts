// components/layout/useLoaderReveal.ts
'use client';

import { useLayoutEffect, type RefObject } from 'react';

/**
 * Apparition animée d'un élément du chrome (header, fil d'Ariane…), jouée
 * quand l'écran de chargement (PageLoader) se retire : sinon l'animation se
 * déroulerait DERRIÈRE l'overlay et personne ne la verrait.
 *
 * Pilote l'attribut `data-reveal` de l'élément, directement dans le DOM (pas
 * de state : aucun rendu React supplémentaire) :
 *   (absent)  → visible (SSR, sans JS, mouvement réduit : rien n'est jamais
 *               masqué, contenu et liens restent lisibles / indexables)
 *   pending   → éléments masqués, en attente que l'overlay disparaisse
 *   in        → animations jouées (voir les règles CSS de chaque composant)
 *
 * `pending` est posé dans un useLayoutEffect : avant la première peinture, et
 * l'overlay couvre la page à ce moment-là, donc aucun clignotement. Si
 * l'overlay est déjà retiré (hydratation tardive), l'élément reste visible
 * sans animation plutôt que de disparaître pour réapparaître.
 *
 * `replayKey` : l'animation est rejouée quand cette valeur change (ex. le
 * pathname pour le fil d'Ariane). Omise, elle ne se joue qu'au montage.
 */

// Filet de sécurité : l'overlay se retire de lui-même après ~2,8 s (voir
// PageLoader.module.css) ; on ne laisse jamais l'élément masqué plus longtemps.
const FAILSAFE_MS = 2800;

export function useLoaderReveal(
  ref: RefObject<HTMLElement | null>,
  replayKey?: string,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Pas d'overlay, ou déjà retiré (hydratation tardive) : l'élément est déjà
    // visible à l'écran. Le masquer pour le rejouer provoquerait un
    // clignotement : on le laisse tel quel.
    const overlay = document.querySelector<HTMLElement>('[data-page-loader]');
    if (!overlay || overlay.dataset.state === 'hidden') return;

    el.dataset.reveal = 'pending';

    let timer = 0;
    const observer = new MutationObserver(() => {
      if (overlay.dataset.state === 'hidden') finish();
    });
    const finish = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      el.dataset.reveal = 'in';
    };

    observer.observe(overlay, { attributes: true, attributeFilter: ['data-state'] });
    timer = window.setTimeout(finish, FAILSAFE_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [ref, replayKey]);
}

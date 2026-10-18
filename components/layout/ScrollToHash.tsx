// components/layout/ScrollToHash.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Pose la page sur la section ciblée par l'ancre de l'URL :
 * `/services#it` ouvre la page sur la section `#it`, que l'on vienne d'un
 * autre page (CTA du slider, lien partagé) ou d'un raccourci interne
 * (cartes de l'introduction de /services).
 *
 * Pourquoi un composant dédié alors que le navigateur gère les ancres ?
 * Parce que la combinaison du site casse le comportement natif :
 *
 *  1. `scroll-behavior: smooth` (globals.css) rend le défilement vers le
 *     fragment ASYNCHRONE ;
 *  2. pendant ce défilement, `SnapScroll` pose `data-snap="y"` au retour de
 *     l'hydratation : `scroll-snap-type: y mandatory` s'active en plein
 *     mouvement, le navigateur abandonne le défilement et re-snappe vers le
 *     point d'arrêt le plus proche — le hero de la page. Mesuré : `scrollY`
 *     reste à 0 alors que la section cible est à 1440 px. Le résultat dépend
 *     de la course hydratation/fragment : tantôt la section est atteinte,
 *     tantôt la page reste en haut.
 *  3. même quand l'ancre atterrit juste, `.placeholder` démarre en
 *     `translateY(18px)` (globals.css) et n'en sort qu'à l'ajout de `in-view`
 *     par l'IntersectionObserver de ClientSideEffects. La transition de 700 ms
 *     remonte ensuite la section de 18 px : la cible est visée trop bas et
 *     reste décalée de 18 px après l'animation.
 *
 * On reprend donc la main : défilement instantané (jamais animé, donc jamais
 * interrompu par le snap), puis ré-alignements de rattrapage tant que la
 * cible bouge encore.
 *
 * Ce composant ne fait QUE défiler : il ne déplace jamais le focus, donc le
 * lien d'évitement `#main` conserve son comportement d'accessibilité natif.
 */
const REALIGN_INTERVAL_MS = 150;
/**
 * Durée de vie maximale de la boucle. Elle doit rester largement supérieure
 * au temps d'arrivée du contenu : en développement, la première visite d'une
 * route déclenche sa compilation (plusieurs secondes), et l'URL affiche déjà
 * l'ancre pendant ce temps. Un plafond court abandonnerait avant même que la
 * section n'existe.
 */
const MAX_LIFETIME_MS = 10_000;
/** Filet de sécurité : nombre maximal de ré-alignements effectifs. */
const MAX_REALIGNS = 40;

/** Extrait l'identifiant ciblé par `window.location.hash`, ou null. */
function readHashId(): string | null {
  const { hash } = window.location;
  if (!hash || hash.length < 2) return null;
  try {
    const id = decodeURIComponent(hash.slice(1));
    return id || null;
  } catch {
    // hash malformé (« % » isolé) : rien à faire
    return null;
  }
}

/** Vrai quand l'élément n'a plus aucune transformation (animation terminée). */
function isTransformSettled(el: Element): boolean {
  const { transform } = getComputedStyle(el);
  return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
}

export default function ScrollToHash() {
  const pathname = usePathname();

  // Relancé à chaque changement de route (une navigation cliente change
  // l'URL sans émettre `hashchange`, d'où les deux déclencheurs).
  useEffect(() => {
    let disposed = false;
    let realigns = 0;
    let interval: number | null = null;
    /** Dès que l'utilisateur reprend la main, on cesse de tirer la page. */
    let userTookOver = false;

    const onUserGesture = () => {
      userTookOver = true;
    };
    // Capturer permet de voir le geste même s'il est consommé ailleurs.
    window.addEventListener('wheel', onUserGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', onUserGesture, { passive: true, capture: true });
    window.addEventListener('pointerdown', onUserGesture, { capture: true });
    window.addEventListener('keydown', onUserGesture, { capture: true });

    const stopAligning = () => {
      if (interval !== null) window.clearInterval(interval);
      interval = null;
    };

    const alignTo = (id: string) => {
      const target = document.getElementById(id);
      if (!target) return false;
      // `instant` contourne `scroll-behavior: smooth` : le défilement est
      // immédiat, donc jamais annulé par l'activation du snap scroll. Il
      // tient compte de `scroll-padding-top` du conteneur (81 px, le header
      // sticky) et de `scroll-margin-top` de la cible.
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      return true;
    };

    const startAligning = () => {
      const id = readHashId();
      if (!id) return;
      stopAligning();
      realigns = 0;
      const startedAt = performance.now();
      // Le geste qui vient de changer l'ancre (clic, Entrée) est désormais
      // derrière nous : on ne le confond pas avec une reprise de main.
      userTookOver = false;

      // 1) Premier alignement dès que possible (contenu présent ou non).
      alignTo(id);

      // 2) Rattrapage : le streaming, l'animation de révélation
      //    `.placeholder` et le chargement des ressources déplacent la cible
      //    APRÈS le défilement. On repose la position à chaque battement tant
      //    qu'elle bouge, puis un dernier réglage fin une fois le transform
      //    de la cible revenu à l'identité.
      interval = window.setInterval(() => {
        if (
          disposed ||
          userTookOver ||
          realigns >= MAX_REALIGNS ||
          performance.now() - startedAt > MAX_LIFETIME_MS
        ) {
          stopAligning();
          return;
        }
        const target = document.getElementById(id);
        if (!target) return; // pas encore streamé : on réessaiera
        realigns += 1;
        alignTo(id);
        if (isTransformSettled(target)) stopAligning();
      }, REALIGN_INTERVAL_MS);
    };

    startAligning();
    window.addEventListener('hashchange', startAligning);

    return () => {
      disposed = true;
      stopAligning();
      window.removeEventListener('hashchange', startAligning);
      window.removeEventListener('wheel', onUserGesture, { capture: true });
      window.removeEventListener('touchstart', onUserGesture, { capture: true });
      window.removeEventListener('pointerdown', onUserGesture, { capture: true });
      window.removeEventListener('keydown', onUserGesture, { capture: true });
    };
  }, [pathname]);

  return null;
}

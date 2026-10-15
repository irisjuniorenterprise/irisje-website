// components/ClientSideEffects.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Éléments révélés au scroll (fondu + glissement) : invisibles (opacity: 0)
// tant que la classe `in-view` ne leur est pas ajoutée (voir globals.css).
//
// ⚠️ La classe est ajoutée ICI, c'est-à-dire par un script — et le contenu
// streamé peut se trouver dans le DOM plus tôt que son hydratation React.
// React comparerait alors `class="placeholder in-view"` (DOM) à son propre
// rendu `class="placeholder"` → erreur « hydration mismatch » en dev.
// Chaque élément ciblé par REVEAL_SELECTOR doit donc porter
// `suppressHydrationWarning` : React cesse de comparer les attributs de
// l'élément, le DOM garde `in-view` (aucun « rattrapage ») et l'apparition
// de la section fonctionne comme prévu. C'est le même principe que
// `suppressHydrationWarning` sur <html>/<body> du layout (menu mobile).
//
// Note : `.site-footer` ne correspond actuellement à rien (le footer utilise
// une classe de module) — sélecteur conservé par sécurité.
const REVEAL_SELECTOR = '.placeholder, .site-footer';
// Sections suivies par le scrollspy
const SECTION_SELECTOR = 'main section[id]';

export default function ClientSideEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const hasObserver = 'IntersectionObserver' in window;

    // --- Révélation au scroll ---
    const reveal = hasObserver
      ? new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        )
      : null;

    // --- Scrollspy ---
    const spy = hasObserver
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const id = entry.target.id;
                document
                  .querySelectorAll<HTMLAnchorElement>('.nav-link, .mobile-link')
                  .forEach((link) => {
                    link.classList.toggle('active', link.dataset.target === id);
                  });
              }
            });
          },
          { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        )
      : null;

    // Éléments déjà pris en charge (évite de les observer deux fois)
    const known = new WeakSet<Element>();

    const track = (el: Element, resetRevealed: boolean) => {
      if (known.has(el)) return;
      known.add(el);

      if (el.matches(REVEAL_SELECTOR)) {
        // Rejoue l'animation d'un élément persistant (le footer ne change pas
        // de page : on le « referme » puis on le réobserve)
        if (resetRevealed) el.classList.remove('in-view');
        if (reveal) reveal.observe(el);
        else el.classList.add('in-view'); // navigateur sans IntersectionObserver
      }
      if (spy && el.matches(SECTION_SELECTOR)) spy.observe(el);
    };

    const trackWithin = (root: ParentNode, resetRevealed: boolean) => {
      if (root instanceof Element) track(root, resetRevealed);
      root
        .querySelectorAll(`${REVEAL_SELECTOR}, ${SECTION_SELECTOR}`)
        .forEach((el) => track(el, resetRevealed));
    };

    // 1) Ce qui est déjà dans la page
    trackWithin(document, true);

    // 2) Ce qui arrive APRÈS : lors d'une navigation côté client, le chemin
    // change alors que le contenu de la page est encore en cours de
    // chargement (écran loading.tsx affiché, puis streaming). Un scan unique
    // à un instant donné rate ces sections, qui restent à opacity: 0 — la page
    // n'apparaît alors qu'après un rechargement complet (Ctrl+R). On observe
    // donc le DOM et on prend en charge chaque nouvel élément dès son arrivée.
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) trackWithin(node, false);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      reveal?.disconnect();
      spy?.disconnect();
    };
  }, [pathname]); // Relancé à chaque changement de route

  return null;
}
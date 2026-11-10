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
// Blocs de contenu animés (attribut `data-rv`, voir app/animations.css).
// Contrairement aux sections ci-dessus, chaque bloc est observé séparément :
// il s'anime au moment où il entre dans l'écran, même au milieu d'une section
// haute. On lui ajoute `data-rv-in="N"` (N = rang dans le lot qui apparaît
// ensemble, pour l'effet de cascade). Un attribut `data-*` n'est jamais
// retiré par React lors d'un re-rendu (contrairement à `class`).
// ⚠️ L'attribut est ajouté par script, et UNIQUEMENT sur un élément déjà
// hydraté (voir « Apparition des blocs de contenu » plus bas), sinon React
// signale un « hydration mismatch ».
const RV_SELECTOR = '[data-rv]:not([data-rv-in])';
const RV_MAX_STEP = 6;
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

    // --- Apparition des blocs de contenu ---
    // ⚠️ `data-rv-in` n'est posé QUE sur un élément déjà hydraté par React.
    // Sur un élément rendu par le serveur et pas encore hydraté, React
    // comparerait ses attributs au rendu client et signalerait « hydration
    // mismatch » (attribut serveur en trop, « won't be patched up »). React
    // marque chaque nœud hydraté d'une clé interne `__reactFiber$…` : on
    // attend donc qu'elle soit présente (sondage léger, plafonné à ~10 s).
    const rtl = document.documentElement.dir === 'rtl';
    const isHydrated = (el: Element) =>
      Object.keys(el).some((key) => key.startsWith('__reactFiber$'));

    const pending = new Set<Element>();
    let pendingTimer: number | undefined;
    let pendingTicks = 0;

    // Fait apparaître un lot de blocs : rang = ordre de lecture dans le lot
    const showBatch = (els: Element[]) => {
      els
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .sort((a, b) => {
          const rowA = Math.round(a.rect.top / 40);
          const rowB = Math.round(b.rect.top / 40);
          if (rowA !== rowB) return rowA - rowB;
          return rtl ? b.rect.left - a.rect.left : a.rect.left - b.rect.left;
        })
        .forEach(({ el }, index) => {
          el.setAttribute('data-rv-in', String(Math.min(index, RV_MAX_STEP)));
        });
    };

    const flushPending = () => {
      pendingTicks += 1;
      const giveUp = pendingTicks > 80;
      const ready: Element[] = [];
      pending.forEach((el) => {
        if (!el.isConnected) pending.delete(el);
        else if (giveUp || isHydrated(el)) {
          pending.delete(el);
          ready.push(el);
        }
      });
      if (ready.length) showBatch(ready);
      if (pending.size === 0 && pendingTimer !== undefined) {
        window.clearInterval(pendingTimer);
        pendingTimer = undefined;
        pendingTicks = 0;
      }
    };

    const blocks = hasObserver
      ? new IntersectionObserver(
          (entries, obs) => {
            const ready: Element[] = [];
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              obs.unobserve(entry.target);
              if (isHydrated(entry.target)) ready.push(entry.target);
              else pending.add(entry.target);
            });
            if (ready.length) showBatch(ready);
            if (pending.size > 0 && pendingTimer === undefined) {
              pendingTimer = window.setInterval(flushPending, 125);
            }
          },
          { threshold: 0, rootMargin: '0px 0px -8% 0px' }
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
      if (el.matches(RV_SELECTOR)) {
        if (blocks) blocks.observe(el);
        else el.setAttribute('data-rv-in', '0'); // navigateur sans IntersectionObserver
      }
      if (spy && el.matches(SECTION_SELECTOR)) spy.observe(el);
    };

    const trackWithin = (root: ParentNode, resetRevealed: boolean) => {
      if (root instanceof Element) track(root, resetRevealed);
      root
        .querySelectorAll(`${REVEAL_SELECTOR}, ${SECTION_SELECTOR}, ${RV_SELECTOR}`)
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
      blocks?.disconnect();
      if (pendingTimer !== undefined) window.clearInterval(pendingTimer);
      spy?.disconnect();
    };
  }, [pathname]); // Relancé à chaque changement de route

  return null;
}
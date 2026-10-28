// components/layout/SectionNav.tsx
'use client';

// Sommaire de la page : une barre fine collée sous le header avec UN bouton
// « Sur cette page » (+ la section en cours). Il ouvre la liste des sections.
//
// Pourquoi une barre et pas un bouton flottant ?
//  - elle occupe sa propre place dans la page : elle ne peut JAMAIS recouvrir
//    du contenu, quelle que soit la taille d'écran ;
//  - son fond est plein (comme le header) : le bouton est lisible quelle que
//    soit l'image ou la couleur derrière ;
//  - le header est déjà plein à 320 px (logo + langues + burger) : on n'y
//    ajoute rien.
//
// Comportement : un clic ouvre / ferme ; un clic sur une section, sur le voile
// ou sur Échap ferme aussi. La section visible est mise en évidence
// (scrollspy). Un clic sur une section fait DÉFILER la page jusqu'à elle avec
// une animation fluide (voir smoothScrollToId ci-dessous). Les liens restent
// de vraies ancres `#id` (clic droit, ouverture dans un onglet, clavier).

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PAGE_SECTIONS, sectionPageKey } from '@/lib/data/pageSections';
import styles from './SectionNav.module.css';

const NO_SECTIONS: readonly string[] = [];
/** Durée max. d'attente d'une section pas encore streamée. */
const MAX_WAIT_MS = 10_000;

/** Intervalle de surveillance du défilement (ms). */
const SCROLL_POLL_MS = 50;
/** Position stable pendant ce nombre de relevés = défilement terminé. */
const SCROLL_STABLE_TICKS = 3;
/** Sans mouvement détecté, on considère le défilement terminé après ce délai. */
const SCROLL_IDLE_MS = 400;
/** Plafond de l'animation de défilement. */
const SCROLL_MAX_MS = 3_000;
/** Plafond d'attente de l'animation de révélation de la section cible. */
const SETTLE_MAX_MS = 1_500;

/** Annule le défilement fluide en cours (un seul à la fois). */
let cancelActiveScroll: (() => void) | null = null;

/** Vrai quand l'élément n'a plus aucune transformation (révélation terminée). */
function isTransformSettled(el: Element): boolean {
  const { transform } = getComputedStyle(el);
  return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
}

/**
 * Défile en douceur jusqu'à la section `id`.
 *
 * - `scrollIntoView` tient compte de `scroll-padding-top` (header + barre) et
 *   de `scroll-margin-top` : l'arrivée est calée sous la barre.
 * - Le snap scroll (`mandatory`) est suspendu PENDANT l'animation : sinon il
 *   peut l'interrompre ou la dévier vers un point d'arrêt intermédiaire. Il
 *   est rétabli à l'arrivée, déjà aligné : aucun saut.
 * - Les sections `.placeholder` se décalent de 18 px à leur apparition
 *   (ClientSideEffects) : un dernier alignement instantané est fait une fois
 *   cette révélation terminée.
 * - Si l'utilisateur reprend la main (molette, toucher, clavier), on s'efface.
 * - `prefers-reduced-motion` : défilement instantané, sans animation.
 */
function smoothScrollToId(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  cancelActiveScroll?.();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    return;
  }

  const root = document.documentElement;
  const startedAt = performance.now();
  let lastY = window.scrollY;
  let stableTicks = 0;
  let moved = false;
  let settling = false;
  let settleStartedAt = 0;
  let finished = false;

  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearInterval(timer);
    for (const name of events) window.removeEventListener(name, finish, { capture: true });
    root.style.removeProperty('scroll-snap-type');
    if (cancelActiveScroll === finish) cancelActiveScroll = null;
  };

  const tick = () => {
    const now = performance.now();

    if (settling) {
      // Animation de révélation terminée (ou délai dépassé) : ajustement final.
      if (isTransformSettled(target) || now - settleStartedAt > SETTLE_MAX_MS) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        finish();
      }
      return;
    }

    const y = window.scrollY;
    if (Math.abs(y - lastY) > 0.5) {
      moved = true;
      stableTicks = 0;
    } else {
      stableTicks += 1;
    }
    lastY = y;

    const arrived =
      (moved && stableTicks >= SCROLL_STABLE_TICKS) ||
      (!moved && now - startedAt > SCROLL_IDLE_MS) ||
      now - startedAt > SCROLL_MAX_MS;
    if (arrived) {
      settling = true;
      settleStartedAt = now;
    }
  };

  const timer = window.setInterval(tick, SCROLL_POLL_MS);
  for (const name of events) {
    window.addEventListener(name, finish, { passive: true, capture: true });
  }
  cancelActiveScroll = finish;

  root.style.setProperty('scroll-snap-type', 'none');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function SectionNav() {
  const pathname = usePathname();
  const t = useTranslations('SectionNav');
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  // '/fr/services' → 'services' ; '/fr' → ''
  const route = pathname.split('/').filter(Boolean).slice(1).join('/');
  const pageKey = sectionPageKey(route);
  const configured: readonly string[] = pageKey ? PAGE_SECTIONS[pageKey] : NO_SECTIONS;

  const [open, setOpen] = useState(false);
  // L'état est rattaché à la page (`key`) : en changeant de page, il est
  // simplement ignoré — pas de remise à zéro à faire dans un effet.
  const [found, setFound] = useState<{ key: string; ids: readonly string[] } | null>(null);
  const [active, setActive] = useState<{ key: string; id: string } | null>(null);
  // Avant le premier scan on affiche toute la liste (identique serveur/client) ;
  // elle est ensuite réduite aux sections réellement présentes dans le DOM.
  const present = found && found.key === pageKey ? found.ids : configured;
  const activeId = active && active.key === pageKey ? active.id : null;

  // Repère les sections présentes et suit celle qui est à l'écran.
  useEffect(() => {
    if (!pageKey || configured.length === 0) return;

    const observed = new Set<string>();
    const spy =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) setActive({ key: pageKey, id: entry.target.id });
              }
            },
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
          )
        : null;

    let frame = 0;
    const scan = () => {
      frame = 0;
      const ids = configured.filter((id) => document.getElementById(id));
      setFound((previous) =>
        previous &&
        previous.key === pageKey &&
        previous.ids.length === ids.length &&
        previous.ids.every((id, i) => id === ids[i])
          ? previous
          : { key: pageKey, ids },
      );
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && !observed.has(id)) {
          observed.add(id);
          spy?.observe(el);
        }
      }
    };
    const scheduleScan = () => {
      if (!frame) frame = window.requestAnimationFrame(scan);
    };

    scheduleScan();
    // Navigation cliente : le contenu arrive en streaming APRÈS le changement
    // de route (écran de chargement). On rescanne tant que des sections
    // manquent, puis on s'arrête.
    const mutations = new MutationObserver(() => {
      scheduleScan();
      if (configured.every((id) => observed.has(id))) mutations.disconnect();
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const giveUp = window.setTimeout(() => mutations.disconnect(), MAX_WAIT_MS);

    return () => {
      window.clearTimeout(giveUp);
      mutations.disconnect();
      spy?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pageKey, configured, pathname]);

  const close = useCallback(() => {
    restoreFocus.current = true;
    setOpen(false);
  }, []);

  // Après fermeture, le focus revient sur le bouton (clavier : pas de perte
  // de repère, surtout après un clic sur un lien du panneau devenu inerte).
  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Échap ferme le panneau.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    // Clic « normal » uniquement : Ctrl/Cmd/Maj/clic milieu gardent le
    // comportement natif du lien (ouverture dans un nouvel onglet…).
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      close();
      return;
    }

    // On remplace la navigation native (saut instantané via ScrollToHash)
    // par un défilement fluide. pushState ne déclenche pas `hashchange` :
    // ScrollToHash ne vient donc pas se battre avec l'animation.
    event.preventDefault();
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`);
    }
    smoothScrollToId(id);
    close();
  };

  // Pas de sommaire sur cette page, ou une seule section : rien à afficher.
  if (!pageKey || present.length < 2) return null;

  const currentId = activeId && present.includes(activeId) ? activeId : present[0];

  return (
    <>
      {open && <div className={styles.backdrop} aria-hidden="true" onClick={close} />}

      {/* data-section-bar : repéré par snap-scroll.css (:has) pour décaler les
          ancres et la hauteur des sections de la hauteur de cette barre. */}
      <div className={styles.bar} data-section-bar data-open={open}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.anchor}>
            <button
              ref={toggleRef}
              type="button"
              className={styles.toggle}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => (open ? close() : setOpen(true))}
            >
              <span className={styles.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                  <path
                    d="M4 6h2M9 6h11M4 12h2M9 12h11M4 18h2M9 18h11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className={styles.label}>{t('title')}</span>
              <span className={styles.current}>{t(`items.${pageKey}.${currentId}`)}</span>
              <svg
                className={styles.chevron}
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <nav id={panelId} className={styles.panel} aria-label={t('aria_label')} inert={!open}>
              <ol className={styles.list}>
                {present.map((id) => {
                  const isActive = id === currentId;
                  return (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={`${styles.link} ${isActive ? styles.active : ''}`}
                        aria-current={isActive ? 'location' : undefined}
                        onClick={(event) => onLinkClick(event, id)}
                      >
                        {t(`items.${pageKey}.${id}`)}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
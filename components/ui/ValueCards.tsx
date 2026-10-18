// components/ui/ValueCards.tsx
'use client';

// Cartes « Nos valeurs » à retournement 3D.
//  - Face avant  : icône + nom de la valeur.
//  - Face arrière: description de la valeur.
// La carte pivote autour de son axe vertical :
//  - souris   : au survol ;
//  - tactile  : au toucher (re-toucher pour revenir) ;
//  - clavier  : Entrée / Espace sur le bouton pour retourner, Échap pour revenir.
// Au premier affichage, les cartes « s'entrouvrent » une fois pour signaler
// qu'elles sont interactives (désactivé si l'utilisateur réduit les animations).
// Les icônes sont recentrées automatiquement dans leur cercle en mesurant
// la position réelle de leur dessin à l'écran, quelle que soit l'icône fournie.
//
// NB : on utilise des <div> et non des <span> pour la pastille d'indication et
// les pastilles d'icônes : la section parente porte la classe globale
// `.placeholder`, dont la règle `.placeholder span` ajoute une puce « ✦ » et
// passe le texte en majuscules.

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import styles from './ValueCards.module.css';

// useLayoutEffect côté client (pas de « saut » visuel), useEffect côté serveur.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type ValueItem = {
  key: string;
  icon: ReactNode;
  title: string;
  desc: string;
};

type ValueCardsProps = {
  items: ValueItem[];
  /** Indication affichée avec une souris (survol) */
  hintHover: string;
  /** Indication affichée sur écran tactile */
  hintTouch: string;
  /** Libellé du bouton de la face avant (ex. « Découvrir ») */
  revealLabel: string;
};

function FlipIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

/**
 * Recentre le dessin d'une icône SVG au milieu de sa pastille.
 * On compare le centre RÉEL du dessin (en pixels écran) au centre de la
 * pastille, puis on applique la différence en pixels (--icon-dx / --icon-dy).
 * Cela corrige à la fois un cadre SVG mal placé et un dessin non centré
 * dans son cadre.
 */
function centerIcon(tile: HTMLElement) {
  const svg = tile.querySelector('svg');
  if (!svg) return;

  try {
    // On repart de zéro pour mesurer la position « brute ».
    tile.style.setProperty('--icon-dx', '0px');
    tile.style.setProperty('--icon-dy', '0px');

    const box = svg.getBBox();
    if (!box.width && !box.height) return;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const tileRect = tile.getBoundingClientRect();
    if (!tileRect.width || !tileRect.height) return;

    // Centre du dessin, converti en coordonnées écran.
    const ink = new DOMPoint(
      box.x + box.width / 2,
      box.y + box.height / 2,
    ).matrixTransform(ctm);

    // Échelle éventuelle appliquée à la pastille (ex. survol), pour rester en px CSS.
    const scale = tile.offsetWidth ? tileRect.width / tile.offsetWidth : 1;

    const dx = (tileRect.left + tileRect.width / 2 - ink.x) / scale;
    const dy = (tileRect.top + tileRect.height / 2 - ink.y) / scale;

    tile.style.setProperty('--icon-dx', `${dx.toFixed(2)}px`);
    tile.style.setProperty('--icon-dy', `${dy.toFixed(2)}px`);
  } catch {
    // SVG non mesurable (ex. non rendu) : on laisse le centrage par défaut.
  }
}

export default function ValueCards({
  items,
  hintHover,
  hintTouch,
  revealLabel,
}: ValueCardsProps) {
  const [flipped, setFlipped] = useState<string | null>(null);
  const [peek, setPeek] = useState(false);

  const baseId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>('');
  const frontRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const backRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Centrage optique automatique des icônes (avant le premier affichage),
  // puis une seconde passe une fois la police et la mise en page stabilisées.
  useIsoLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const run = () =>
      grid
        .querySelectorAll<HTMLElement>('[data-icon-tile]')
        .forEach(centerIcon);

    run();
    const raf = requestAnimationFrame(run);
    const onLoad = () => run();
    window.addEventListener('load', onLoad);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
    };
  }, [items]);

  // « Coup d'œil » unique quand la grille entre dans l'écran.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPeek(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onPointerDown(e: PointerEvent) {
    lastPointer.current = e.pointerType;
  }

  function onPointerEnter(key: string, e: PointerEvent) {
    if (e.pointerType === 'mouse') setFlipped(key);
  }

  function onPointerLeave(key: string, e: PointerEvent) {
    if (e.pointerType === 'mouse') setFlipped((cur) => (cur === key ? null : cur));
  }

  // Souris : le survol gère tout, le clic ne doit pas re-retourner la carte.
  // Tactile / clavier : le clic (ou Entrée / Espace sur le bouton) bascule.
  function onClick(key: string) {
    if (lastPointer.current === 'mouse') {
      lastPointer.current = '';
      return;
    }
    const opening = flipped !== key;
    setFlipped(opening ? key : null);
    if (opening) {
      // Le focus suit la face visible, pour les utilisateurs au clavier.
      // En rAF : React a posé `inert` sur la face avant au même rendu, un
      // focus synchrone serait refusé.
      requestAnimationFrame(() => backRefs.current[key]?.focus({ preventScroll: true }));
    }
  }

  function onKeyDown(key: string, e: KeyboardEvent) {
    lastPointer.current = '';
    if (e.key === 'Escape' && flipped === key) {
      setFlipped(null);
      // La face avant redevient focusable au rendu suivant : on attend donc
      // la prochaine image pour lui rendre le focal.
      requestAnimationFrame(() =>
        frontRefs.current[key]?.focus({ preventScroll: true }),
      );
    }
  }

  return (
    <>
      {/* Indication d'usage : pastille avec flèche animée + texte selon l'appareil */}
      <div className={styles.hint}>
        <div className={styles.hintIcon} aria-hidden="true">
          <FlipIcon size={18} />
        </div>
        <div className={styles.hintText}>
          <div className={styles.hintHover}>{hintHover}</div>
          <div className={styles.hintTouch}>{hintTouch}</div>
        </div>
      </div>

      <div className={styles.grid} ref={gridRef}>
        {items.map((item, index) => {
          const isFlipped = flipped === item.key;
          const descId = `${baseId}-${item.key}-desc`;
          return (
            // Raccourci souris / tactile sur la carte : le contrôle accessible
            // est le <button> « Découvrir » qu'elle contient (focus, Entrée,
            // Échap) — cf. son aria-expanded / aria-describedby.
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={item.key}
              className={styles.card}
              data-key={item.key}
              data-flipped={isFlipped}
              data-peek={peek}
              style={{ '--i': index } as CSSProperties}
              onPointerDown={onPointerDown}
              onPointerEnter={(e) => onPointerEnter(item.key, e)}
              onPointerLeave={(e) => onPointerLeave(item.key, e)}
              onClick={() => onClick(item.key)}
              onKeyDown={(e) => onKeyDown(item.key, e)}
            >
              <div className={styles.tilt}>
                <div className={styles.inner}>
                  {/* Face avant : icône + nom de la valeur.
                      Retournée, elle disparaît visuellement (backface) mais
                      restait exposée au lecteur d'écran : le titre était alors
                      annoncé deux fois et le bouton restait un arrêt de tabulation
                      invisible. `inert` + `aria-hidden` la retirent réellement. */}
                  <div
                    className={`${styles.face} ${styles.front}`}
                    aria-hidden={isFlipped}
                    inert={isFlipped}
                  >
                    <div
                      className={styles.iconTile}
                      data-icon-tile
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                    <h3 className={styles.title}>{item.title}</h3>
                    <button
                      type="button"
                      className={styles.more}
                      ref={(el) => {
                        frontRefs.current[item.key] = el;
                      }}
                      aria-expanded={isFlipped}
                      aria-describedby={descId}
                      aria-label={`${revealLabel} : ${item.title}`}
                    >
                      <FlipIcon size={14} />
                      {revealLabel}
                    </button>
                  </div>

                  {/* Face arrière : description. `inert` au repos (elle n'est
                      alors pas affichée) et tabindex=-1 : elle ne doit jamais
                      entrer dans l'ordre de tabulation — on n'y arrive que par
                      le focus programmatique après le retournement. */}
                  <div
                    className={`${styles.face} ${styles.back}`}
                    aria-hidden={!isFlipped}
                    inert={!isFlipped}
                    tabIndex={-1}
                    ref={(el) => {
                      backRefs.current[item.key] = el;
                    }}
                  >
                    <h3 className={styles.backTitle}>{item.title}</h3>
                    <p className={styles.desc} id={descId}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
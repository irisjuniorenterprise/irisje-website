// components/ui/Slider.tsx
'use client';

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';
import { Icons } from '@/components/icons/Icons';
import { visuallyHidden } from '@/components/ui/visuallyHidden';
import styles from './Slider.module.css';

export type Slide = {
  id: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  cta?: {
    label: string;
    href: string;
  };
};

// Libellés d'accessibilité (lecteurs d'écran) selon la langue du site
const LABELS = {
  fr: {
    region: 'Bandeau défilant des actualités et services',
    carousel: 'Carrousel',
    slide: 'Diapositive',
    prev: 'Diapositive précédente',
    next: 'Diapositive suivante',
    dots: 'Indicateurs de diapositives',
    goTo: (n: number) => `Aller à la diapositive ${n}`,
    of: (i: number, n: number) => `${i} sur ${n}`,
    pause: 'Mettre le défilement automatique en pause',
    play: 'Reprendre le défilement automatique',
  },
  en: {
    region: 'Scrolling banner of news and services',
    carousel: 'Carousel',
    slide: 'Slide',
    prev: 'Previous slide',
    next: 'Next slide',
    dots: 'Slide indicators',
    goTo: (n: number) => `Go to slide ${n}`,
    of: (i: number, n: number) => `${i} of ${n}`,
    pause: 'Pause the automatic rotation',
    play: 'Resume the automatic rotation',
  },
  ar: {
    region: 'شريط متحرك للأخبار والخدمات',
    carousel: 'دوّار الشرائح',
    slide: 'شريحة',
    prev: 'الشريحة السابقة',
    next: 'الشريحة التالية',
    dots: 'مؤشرات الشرائح',
    goTo: (n: number) => `الانتقال إلى الشريحة ${n}`,
    of: (i: number, n: number) => `${i} من ${n}`,
    pause: 'إيقاف التدوير التلقائي مؤقتًا',
    play: 'استئناف التدوير التلقائي',
  },
} as const;

type SliderProps = {
  slides: Slide[];
  autoplay?: boolean;
  /**
   * Durée fixe par diapositive, en millisecondes.
   * Non renseigné (défaut) : durée ADAPTATIVE, calculée à partir de la
   * longueur du texte de chaque diapositive (voir getDwellMs).
   */
  interval?: number;
  className?: string;
  locale?: string;
};

// ============================================================
// RYTHME DE L'AVANCE AUTOMATIQUE
// ----------------------------------------------------------
// Deux exigences opposées : ne pas être si lent qu'on s'ennuie,
// et ne pas être si rapide qu'on coupe une phrase en pleine
// lecture. Plutôt qu'une durée fixe imposée à toutes les
// diapositives, la durée dépend de ce que chacune contient :
//
//     durée = clamp(4,5 s, temps de lecture + 1,25 s, 8 s)
//
// - 260 mots/minute : rythme de « lecture en diagonale », ce
//   qui correspond à des accroches courtes à l'écran (une
//   lecture attentive de paragraphes exigeants reste à
//   180-200 mpm — le plafond ci-dessous protège les cas où le
//   texte dépasse ce que ce rythme autorise) ;
// - 1,25 s de marge : temps de repérage visuel (illustration,
//   pastille, titre) avant que le regard n'atteigne le texte ;
// - plancher 4,5 s : même la diapositive la plus courte reste
//   affichée le temps d'être vue sans précipitation ;
// - plafond 8 s : au-delà, l'attente devient ennuyeuse. Une
//   personne qui n'a pas fini de lire dispose du survol (pause
//   automatique) ou du bouton ⏸, et peut relancer avec ▶.
//
// Exemples mesurés sur les textes actuels (fr) :
//   « Solutions flexibles »          ≈ 14 mots → 4,5 s
//   « Rejoignez IRIS Junior… »       ≈ 16 mots → 4,9 s
//   « Développement IT & Numérique » ≈ 24 mots → 6,8 s
// Amplitude obtenue sur le site : 4,5 s à 6,8 s en français,
// 4,5 s à 5,4 s en anglais et 4,5 s à 5,6 s en arabe
// (textes plus courts ailleurs qu'en français).
// ============================================================
const READING_WORDS_PER_MINUTE = 260;
const DWELL_OVERHEAD_MS = 1250;
const MIN_DWELL_MS = 4500;
const MAX_DWELL_MS = 8000;

const countWords = (text?: string) =>
  text?.trim().split(/\s+/).filter(Boolean).length ?? 0;

/** Temps d'affichage d'une diapositive, proportionnel à son contenu. */
const getDwellMs = (slide?: Slide) => {
  const words =
    countWords(slide?.title) +
    countWords(slide?.description) +
    countWords(slide?.cta?.label);
  const readingMs = (words / READING_WORDS_PER_MINUTE) * 60_000;
  return Math.min(MAX_DWELL_MS, Math.max(MIN_DWELL_MS, readingMs + DWELL_OVERHEAD_MS));
};

// Abonnement à la préférence système « réduire les animations ».
// Utilisé via useSyncExternalStore : le rendu serveur répond `false`
// (inconnu côté serveur), le client répond sa propre préférence.
const subscribeToReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const getReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// ANIMATION DU CHANGEMENT DE DIAPOSITIVE
// ----------------------------------------------------------
// La position de la piste est écrite DIRECTEMENT dans le style
// (transform: translate3d en pixels), sans passer par l'état
// React : un changement de diapositive ne fait qu'une écriture.
// ============================================================
const SETTLE_MS = 500;       // durée pour une diapositive voisine
const SETTLE_EXTRA_MS = 120; // + par diapositive supplémentaire franchie (retour au début, points)
const MAX_SETTLE_MS = 900;   // plafond : un long trajet reste vif
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

// useLayoutEffect côté client (pas de « flash » de position), useEffect côté serveur
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Slider({
  slides,
  autoplay = false,
  interval,
  className = '',
  locale = 'fr',
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Pause VOLONTAIRE : uniquement le bouton ⏸/▶. La navigation manuelle
  // (flèches, points, clavier) ne coupe pas l'avance automatique :
  // elle repart pour une durée complète sur la diapositive atteinte.
  const [isUserPaused, setIsUserPaused] = useState(false);
  // Pause TEMPORAIRE : survol souris ou focus clavier (deux sources distinctes)
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPaused = isHovered || isFocused;
  // Pas d'avance automatique si le carrousel n'est pas visible (hors écran / onglet masqué)
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Valeurs lues hors rendu
  const widthRef = useRef(0);
  const indexRef = useRef(0);
  const prevIndexRef = useRef<number | null>(null);

  // Préférence système « réduire les animations », lue comme une source externe
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => false
  );

  const totalSlides = slides.length;
  const hasSlides = totalSlides > 0;
  const isRtl = locale === 'ar';
  const l = LABELS[locale as keyof typeof LABELS] ?? LABELS.fr;

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

  // ------------------------------------------------------------
  // Position de la piste (écriture directe dans le style)
  // ------------------------------------------------------------
  // RTL : la 1re diapositive est à droite, la suite se lit de droite à gauche
  const restX = useCallback(
    (index: number) => (isRtl ? 1 : -1) * index * widthRef.current,
    [isRtl]
  );

  const settleMs = useCallback(
    (distance: number) =>
      reducedMotion
        ? 0
        : Math.min(MAX_SETTLE_MS, SETTLE_MS + Math.max(0, distance - 1) * SETTLE_EXTRA_MS),
    [reducedMotion]
  );

  /** Place la piste ; `ms > 0` anime le déplacement depuis la position visible actuelle. */
  const paint = useCallback(
    (x: number, ms: number) => {
      const track = trackRef.current;
      if (!track) return;
      if (ms > 0) {
        // Lecture forcée : fige la position de départ avant de poser la transition
        // (sinon Safari peut animer depuis une ancienne valeur)
        void track.offsetWidth;
        track.style.transition = `transform ${ms}ms ${EASING}`;
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    },
    []
  );

  // Largeur réelle : mesurée, puis suivie (rotation de l'écran, redimensionnement)
  useIsoLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.getBoundingClientRect().width;
      if (width === widthRef.current) return; // changement de hauteur seulement : on ne touche à rien
      widthRef.current = width;
      paint(restX(indexRef.current), 0);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSlides, paint, restX]);

  // Changement de diapositive (flèches, points, clavier, timer) : déplacement animé
  useIsoLayoutEffect(() => {
    indexRef.current = currentIndex;
    const previous = prevIndexRef.current;
    prevIndexRef.current = currentIndex;
    if (previous === null || previous === currentIndex) {
      paint(restX(currentIndex), 0); // premier rendu (ou changement de sens RTL) : sans animation
      return;
    }
    paint(restX(currentIndex), settleMs(Math.abs(currentIndex - previous)));
  }, [currentIndex, paint, restX, settleMs]);

  // ------------------------------------------------------------
  // Avance automatique
  // ------------------------------------------------------------
  // Possible si demandée par la page, ≥ 2 diapositives, et pas de préférence
  // « réduire les animations ». `isUserPaused` décide ensuite si elle tourne.
  const autoPlayAvailable = autoplay && totalSlides > 1 && !reducedMotion;
  const autoPlayRunning = autoPlayAvailable && !isUserPaused;
  const isOnScreen = isInView && isTabVisible;

  // Durée d'affichage de la diapositive COURANTE : imposée par `interval` si la
  // page en fournit une, sinon adaptative selon le texte à lire (cf. getDwellMs).
  const currentDwellMs = interval ?? getDwellMs(slides[currentIndex]);

  const toggleAutoPlay = useCallback(() => setIsUserPaused((paused) => !paused), []);

  // Navigation : updaters fonctionnels → identités stables, aucun callback périmé
  const goToSlide = useCallback((index: number) => setCurrentIndex(index), []);
  const goToNext = useCallback(
    () => setCurrentIndex((i) => (i + 1) % totalSlides),
    [totalSlides]
  );
  const goToPrev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides),
    [totalSlides]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        isRtl ? goToPrev() : goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        isRtl ? goToNext() : goToPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides - 1);
      }
    },
    [goToNext, goToPrev, goToSlide, isRtl, totalSlides]
  );

  // Visibilité : l'avance s'arrête hors écran et quand l'onglet est masqué
  // (économie de CPU / batterie, et pas de diapositives qui défilent dans le vide)
  useEffect(() => {
    const onVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSlides]);

  useEffect(() => {
    // setTimeout (et non setInterval) : chaque diapositive a sa propre durée.
    // `currentIndex` est une dépendance explicite : avec une durée identique d'une
    // diapositive à l'autre, rien d'autre ne relancerait le timer après un changement.
    if (autoPlayRunning && !isPaused && isOnScreen) {
      timerRef.current = setTimeout(goToNext, currentDwellMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlayRunning, isPaused, isOnScreen, goToNext, currentDwellMs, currentIndex]);

  // Survol : souris uniquement. Sur écran tactile, `mouseenter` est émulé au
  // toucher et `mouseleave` n'arrive qu'au toucher suivant ailleurs → la
  // lecture restait bloquée. Les événements pointeur donnent le vrai type.
  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setIsHovered(true);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setIsHovered(false);
  };
  // Focus : seulement le focus CLAVIER (:focus-visible). Un clic sur une flèche
  // ou un point donne le focus à un bouton sans que ce soit une demande de pause.
  const handleFocus = (e: React.FocusEvent) => {
    if (e.target.matches(':focus-visible')) setIsFocused(true);
  };
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Le focus change d'élément À L'INTÉRIEUR du carrousel : on ne relance pas
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsFocused(false);
  };

  if (totalSlides === 0) return null;

  return (
    <div
      className={`${styles.slider} ${className} ${isRtl ? styles.rtl : ''}`}
      role="region"
      aria-roledescription={l.carousel}
      aria-label={l.region}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={rootRef}
    >
      <div
        ref={viewportRef}
        className={styles.sliderContainer}
      >
        {/* Le transform / transition de la piste sont posés par paint()
            (écriture directe) : volontairement absents du style React, qui ne doit pas
            les écraser à un re-rendu. */}
        <div
          ref={trackRef}
          className={styles.sliderTrack}
          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
          // Pendant l'avance automatique le contenu change seul : on n'annonce rien.
          // En pause / navigation manuelle, le lecteur d'écran annonce la nouvelle diapositive.
          aria-live={autoPlayRunning ? 'off' : 'polite'}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                className={`${styles.slide} ${slide.image ? styles.slideWithImage : ''} ${
                  isActive ? styles.slideActive : ''
                }`}
                // Image de fond optionnelle, transmise au CSS via une variable
                style={
                  slide.image
                    ? ({ '--slide-bg': `url("${slide.image}")` } as React.CSSProperties)
                    : undefined
                }
                role="group"
                aria-roledescription={l.slide}
                aria-label={l.of(index + 1, totalSlides)}
                // Diapositives hors champ : retirées de l'ordre de tabulation et de
                // l'arbre d'accessibilité. Sans cela, Tab pouvait donner le focus à un
                // lien caché, et le navigateur faisait défiler la zone masquée
                // (le slider « sautait » de position).
                aria-hidden={isActive ? undefined : true}
                inert={!isActive}
              >
                <div className={styles.slideContent}>
                  {slide.icon && <div className={styles.slideIcon}>{slide.icon}</div>}
                  <div className={styles.slideText}>
                    <h3 className={styles.slideTitle}>{slide.title}</h3>
                    <p className={styles.slideDescription}>{slide.description}</p>
                    {slide.cta && (
                      <a href={slide.cta.href} className={styles.slideCta}>
                        {slide.cta.label}
                        {/* Complète « En savoir plus » avec le sujet du lien (lien descriptif) */}
                        <span style={visuallyHidden}>{` — ${slide.title}`}</span>
                        <Icons.ChevronRight size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          {/* En RTL, le CSS place « précédent » à droite et « suivant » à gauche (flèches inversées) */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={goToPrev}
            aria-label={l.prev}
          >
            <Icons.ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={goToNext}
            aria-label={l.next}
          >
            <Icons.ChevronRight size={24} />
          </button>

          {/* Indicateurs : en RTL, le 1er point est à droite (même sens que les diapositives) */}
          <div
            className={styles.dots}
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
            role="tablist"
            aria-label={l.dots}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                type="button"
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={l.goTo(index + 1)}
              />
            ))}
          </div>

          {/* Contrôle explicite de l'avance automatique (WCAG 2.2.2 : un contenu qui
              défile seul doit pouvoir être mis en pause). Affiché TANT QU'UNE avance
              auto est possible. L'étiquette décrit l'action à venir (⏸ « Mettre en
              pause » / ▶ « Reprendre »), comme sur les lecteurs multimédias.
              Rien n'est affiché si le système demande moins d'animations. */}
          {autoPlayAvailable && (
            <button
              type="button"
              className={styles.autoPlayToggle}
              onClick={toggleAutoPlay}
              aria-label={autoPlayRunning ? l.pause : l.play}
            >
              {autoPlayRunning ? <Icons.Pause size={24} /> : <Icons.Play size={24} />}
            </button>
          )}
        </>
      )}
    </div>
  );
}
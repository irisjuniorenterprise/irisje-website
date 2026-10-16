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

// ============================================================
// RYTHME DE L'AVANCE AUTOMATIQUE
// ----------------------------------------------------------
// Tempo FIXE : chaque diapositive reste affichée la même durée,
// quel que soit son contenu. Modifiable via la prop `interval`.
// ============================================================
const DEFAULT_INTERVAL_MS = 5000;

type SliderProps = {
  slides: Slide[];
  autoplay?: boolean;
  /** Durée fixe par diapositive, en millisecondes (défaut : 5000). */
  interval?: number;
  className?: string;
  locale?: string;
};

// Abonnement à la préférence système « réduire les animations ».
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
const SETTLE_EXTRA_MS = 120; // + par diapositive supplémentaire franchie
const MAX_SETTLE_MS = 900;   // plafond : un long trajet reste vif
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ============================================================
// GLISSEMENT (DOIGT + SOURIS)
// ----------------------------------------------------------
// Géré par Pointer Events : un seul code pour le doigt (mobile,
// tablette) et la souris (clic maintenu + déplacement). Le geste
// vertical est laissé au navigateur (défilement de la page).
// ============================================================
const DRAG_START_PX = 6;            // seuil avant de commencer à tirer
const DRAG_COMMIT_MIN_PX = 50;      // seuil minimal de validation
const DRAG_COMMIT_RATIO = 0.15;     // … ou 15 % de la largeur de la diapositive
const DRAG_EDGE_RESISTANCE = 0.35;  // élasticité aux extrémités (0 = blocage sec)

// ============================================================
// MOLETTE / TRACKPAD DEUX DOIGTS (PC)
// ----------------------------------------------------------
// Un trackpad à deux doigts émet des WheelEvent avec un deltaX
// horizontal. Le scroll vertical de la page reste intact : on
// n'intercepte que les gestes franchement horizontaux.
//
// Comme le trackpad envoie une rafale d'événements (et de
// l'inertie après le geste), on ACCUMULE les deltaX et on
// verrouille après chaque validation : un geste = un changement.
// ============================================================
const WHEEL_PAUSE_MS = 180;   // au-delà, on considère un nouveau geste
const WHEEL_THRESHOLD = 80;   // deltaX cumulé pour valider un changement
const WHEEL_LOCK_MS = 350;    // blocage après validation (inertie)
const WHEEL_MIN_DELTA = 8;    // filtre les micro-impulsions

// useLayoutEffect côté client (pas de « flash » de position), useEffect côté serveur
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Slider({
  slides,
  autoplay = false,
  interval = DEFAULT_INTERVAL_MS,
  className = '',
  locale = 'fr',
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Pause VOLONTAIRE : uniquement le bouton ⏸/▶.
  const [isUserPaused, setIsUserPaused] = useState(false);
  // Seule pause temporaire : glissement en cours (évite un changement
  // de diapositive en plein geste). Le survol et le focus ne bloquent plus l'avance.
  const [isDragging, setIsDragging] = useState(false);
  // Pas d'avance auto si hors écran ou onglet masqué
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

  // --- état du glissement (hors rendu) ---
  const suppressClickRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startTrackX: number;
    isDragging: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startTrackX: 0,
    isDragging: false,
  });

  // --- état de la molette (hors rendu) ---
  const wheelRef = useRef({
    accum: 0,       // deltaX cumulé depuis le début du geste
    lastEventAt: 0, // timestamp du dernier wheel reçu
    lockedUntil: 0, // verrou après validation
  });

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
      if (width === widthRef.current) return;
      widthRef.current = width;
      paint(restX(indexRef.current), 0);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSlides, paint, restX]);

  // Changement de diapositive (flèches, points, clavier, timer, glissement, molette)
  useIsoLayoutEffect(() => {
    indexRef.current = currentIndex;
    const previous = prevIndexRef.current;
    prevIndexRef.current = currentIndex;
    if (previous === null || previous === currentIndex) {
      paint(restX(currentIndex), 0);
      return;
    }
    paint(restX(currentIndex), settleMs(Math.abs(currentIndex - previous)));
  }, [currentIndex, paint, restX, settleMs]);

  // ------------------------------------------------------------
  // Avance automatique (tempo fixe)
  // ------------------------------------------------------------
  const autoPlayAvailable = autoplay && totalSlides > 1 && !reducedMotion;
  const autoPlayRunning = autoPlayAvailable && !isUserPaused;
  const isOnScreen = isInView && isTabVisible;

  const toggleAutoPlay = useCallback(() => setIsUserPaused((paused) => !paused), []);

  // Navigation : updaters fonctionnels → identités stables
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

  // Chaque diapositive (y compris après une navigation manuelle) reste
  // affichée exactement `interval` ms avant l'avance suivante.
  useEffect(() => {
    if (autoPlayRunning && !isDragging && isOnScreen) {
      timerRef.current = setTimeout(goToNext, interval);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlayRunning, isDragging, isOnScreen, goToNext, interval, currentIndex]);

  // ------------------------------------------------------------
  // Glissement : pointer events → un seul code pour doigt + souris
  // ------------------------------------------------------------
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (totalSlides <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, [role="tab"]')) return;

    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTrackX: restX(indexRef.current),
      isDragging: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.isDragging) {
      if (Math.abs(dx) < DRAG_START_PX && Math.abs(dy) < DRAG_START_PX) return;
      // Geste vertical dominant : rendu au navigateur
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.pointerId = null;
        return;
      }
      drag.isDragging = true;
      suppressClickRef.current = true;
      setIsDragging(true);
      if (trackRef.current) trackRef.current.style.transition = 'none';
    }

    const track = trackRef.current;
    if (!track) return;

    let x = drag.startTrackX + dx;

    const lastX = restX(totalSlides - 1);
    const min = Math.min(0, lastX);
    const max = Math.max(0, lastX);
    if (x < min) x = min + (x - min) * DRAG_EDGE_RESISTANCE;
    else if (x > max) x = max + (x - max) * DRAG_EDGE_RESISTANCE;

    track.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const wasDragging = drag.isDragging;
    drag.pointerId = null;
    drag.isDragging = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* no-op */
    }

    if (!wasDragging) return;
    setIsDragging(false);

    const current = indexRef.current;

    if (!commit) {
      paint(restX(current), settleMs(0));
      return;
    }

    const dx = e.clientX - drag.startX;
    const width = widthRef.current || 1;
    const threshold = Math.max(DRAG_COMMIT_MIN_PX, width * DRAG_COMMIT_RATIO);

    let nextIndex = current;
    if (Math.abs(dx) > threshold) {
      const slidesMoved = Math.max(1, Math.round(Math.abs(dx) / width));
      const sign = dx > 0 ? 1 : -1;
      nextIndex = isRtl
        ? current + sign * slidesMoved
        : current - sign * slidesMoved;
      nextIndex = Math.max(0, Math.min(totalSlides - 1, nextIndex));
    }

    if (nextIndex !== current) {
      setCurrentIndex(nextIndex);
    } else {
      paint(restX(current), settleMs(0));
    }
  };

  const handleDragPointerUp = (e: React.PointerEvent<HTMLDivElement>) =>
    endDrag(e, true);
  const handleDragPointerCancel = (e: React.PointerEvent<HTMLDivElement>) =>
    endDrag(e, false);
  const handleLostPointerCapture = (e: React.PointerEvent<HTMLDivElement>) =>
    endDrag(e, false);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ------------------------------------------------------------
  // Molette / trackpad deux doigts (PC)
  // ------------------------------------------------------------
  // Écouteur natif posé en { passive: false } : React n'autorise
  // pas preventDefault() sur onWheel (listener passif).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || totalSlides <= 1) return;

    const onWheel = (e: WheelEvent) => {
      // On n'intercepte QUE les gestes franchement horizontaux.
      // Un scroll vertical (deltaY dominant) appartient à la page.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < WHEEL_MIN_DELTA) return;

      // Empêche le navigateur de faire rebondir / défiler horizontalement
      e.preventDefault();

      const now = performance.now();
      const w = wheelRef.current;

      // Nouveau geste après une pause : on repart de zéro
      if (now - w.lastEventAt > WHEEL_PAUSE_MS) w.accum = 0;
      w.lastEventAt = now;

      // Verrou post-validation : absorbe l'inertie du trackpad
      if (now < w.lockedUntil) return;

      w.accum += e.deltaX;
      if (Math.abs(w.accum) < WHEEL_THRESHOLD) return;

      const dir = w.accum > 0 ? 1 : -1;
      w.accum = 0;
      w.lockedUntil = now + WHEEL_LOCK_MS;

      // deltaX > 0 : l'utilisateur pousse vers la droite (voir contenu de droite).
      // LTR : diapositive suivante. RTL : la suite est à gauche, donc précédente.
      if ((dir > 0) === !isRtl) goToNext();
      else goToPrev();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [totalSlides, isRtl, goToNext, goToPrev]);

  if (totalSlides === 0) return null;

  return (
    <div
      className={`${styles.slider} ${className} ${isRtl ? styles.rtl : ''} ${
        isDragging ? styles.sliderDragging : ''
      }`}
      role="region"
      aria-roledescription={l.carousel}
      aria-label={l.region}
      onKeyDown={handleKeyDown}
      ref={rootRef}
    >
      <div
        ref={viewportRef}
        className={styles.sliderContainer}
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        onPointerCancel={handleDragPointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Le transform / transition de la piste sont posés par paint()
            (écriture directe) : volontairement absents du style React. */}
        <div
          ref={trackRef}
          className={styles.sliderTrack}
          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
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
                style={
                  slide.image
                    ? ({ '--slide-bg': `url("${slide.image}")` } as React.CSSProperties)
                    : undefined
                }
                role="group"
                aria-roledescription={l.slide}
                aria-label={l.of(index + 1, totalSlides)}
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
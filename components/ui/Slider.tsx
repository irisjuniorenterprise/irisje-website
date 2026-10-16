// components/ui/Slider.tsx
'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
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
  /** Durée fixe par diapositive, en millisecondes. */
  interval?: number;
  className?: string;
  locale?: string;
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

export default function Slider({
  slides,
  autoplay = false,
  interval = 6000,
  className = '',
  locale = 'fr',
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // Interruption volontaire de l'avance automatique : pause explicite
  // (bouton ⏸/▶) OU navigation manuelle (flèches, points, clavier,
  // balayage). Un seul état pour les deux : dans les deux cas le bouton
  // reste visible et permet de REPARTIR d'où que l'on soit.
  const [isUserPaused, setIsUserPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Préférence système « réduire les animations », lue comme une source
  // externe : le rendu serveur suppose `false`, le client répond `true`/`false`.
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => false
  );

  const totalSlides = slides.length;
  const isRtl = locale === 'ar';
  const l = LABELS[locale as keyof typeof LABELS] ?? LABELS.fr;

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

  // L'avance automatique est possible si elle est demandée par la page,
  // qu'il y a au moins 2 diapositives et que le système n'exige pas moins
  // d'animations. `isUserPaused` décide ensuite si elle tourne vraiment.
  const autoPlayAvailable = autoplay && totalSlides > 1 && !reducedMotion;
  const autoPlayRunning = autoPlayAvailable && !isUserPaused;

  // Une pression sur ⏸ stoppe et coupe le timer ; une pression sur ▶
  // remet la lecture en route (le timer repart alors pour un intervalle
  // complet, sans course résiduelle).
  const toggleAutoPlay = useCallback(() => setIsUserPaused((paused) => !paused), []);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [currentIndex, isTransitioning]
  );

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, goToSlide, totalSlides]);

  const goToPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, goToSlide, totalSlides]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsUserPaused(true);
        isRtl ? goToPrev() : goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsUserPaused(true);
        isRtl ? goToNext() : goToPrev();
      }
    },
    [goToNext, goToPrev, isRtl]
  );

  useEffect(() => {
    // Timer uniquement si : avance auto rendue possible (demandée par la
    // page, ≥ 2 diapositives, pas de préférence « réduire les animations »),
    // non interrompue par l'utilisateur (bouton ⏸ ou navigation manuelle),
    // et curseur/focus hors du carrousel (sinon la lecture s'interrompt le
    // temps du survol ou du focus clavier).
    if (autoPlayRunning && !isPaused) {
      timerRef.current = setInterval(goToNext, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlayRunning, isPaused, goToNext, interval]);

  // Balayage tactile : un geste surtout horizontal de plus de 40 px change de diapositive.
  // En RTL les diapositives défilent de droite à gauche : le sens est donc inversé.
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || totalSlides < 2) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const forward = isRtl ? dx > 0 : dx < 0;
    setIsUserPaused(true);
    if (forward) goToNext();
    else goToPrev();
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(false);

  if (totalSlides === 0) return null;

  return (
    <div
      className={`${styles.slider} ${className} ${isRtl ? styles.rtl : ''}`}
      role="region"
      aria-roledescription={l.carousel}
      aria-label={l.region}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <div
        className={styles.sliderContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.sliderTrack}
          style={{
            // RTL : la 1re diapositive est à droite, la suite se lit de droite à gauche
            flexDirection: isRtl ? 'row-reverse' : 'row',
            transform: `translateX(${(isRtl ? 1 : -1) * currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${slide.image ? styles.slideWithImage : ''}`}
              // Image de fond optionnelle, transmise au CSS via une variable
              style={
                slide.image
                  ? ({ '--slide-bg': `url("${slide.image}")` } as React.CSSProperties)
                  : undefined
              }
              role="group"
              aria-roledescription={l.slide}
              aria-label={l.of(index + 1, totalSlides)}
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
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          {/* En RTL, le CSS place « précédent » à droite et « suivant » à gauche (flèches inversées) */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={() => {
              setIsUserPaused(true);
              goToPrev();
            }}
            aria-label={l.prev}
          >
            <Icons.ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={() => {
              setIsUserPaused(true);
              goToNext();
            }}
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
                onClick={() => {
                  setIsUserPaused(true);
                  goToSlide(index);
                }}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={l.goTo(index + 1)}
              />
            ))}
          </div>

          {/* Contrôle explicite de l'avance automatique (WCAG 2.2.2 : un
              contenu qui défile seul doit pouvoir être mis en pause).

              Le bouton reste affiché TANT QU'UNE avance auto est possible :
              c'est lui qui redémarre la lecture après une pause ⏸, ou après
              une navigation manuelle (flèches, points, clavier, balayage)
              qui l'avait arrêtée. L'étiquette décrit l'action à venir
              (⏸ « Mettre en pause » / ▶ « Reprendre »), comme sur les
              lecteurs multimédias.

              Rien n'est affiché si le système demande moins d'animations :
              le carrousel ne défile alors jamais tout seul, un bouton de
              reprise n'aurait aucun sens. */}
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
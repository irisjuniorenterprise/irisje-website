// components/ui/Slider.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

type SliderProps = {
  slides: Slide[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
  locale?: string;
};

export default function Slider({
  slides,
  autoplay = false,
  interval = 5000,
  className = '',
  locale = 'fr',
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;
  const isRtl = locale === 'ar';

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

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
        isRtl ? goToPrev() : goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        isRtl ? goToNext() : goToPrev();
      }
    },
    [goToNext, goToPrev, isRtl]
  );

  useEffect(() => {
    if (autoplay && !isPaused && totalSlides > 1) {
      timerRef.current = setInterval(goToNext, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, isPaused, goToNext, interval, totalSlides]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(false);

  if (totalSlides === 0) return null;

  return (
    <div
      className={`${styles.slider} ${className} ${isRtl ? styles.rtl : ''}`}
      role="region"
      aria-roledescription="Carrousel"
      aria-label="Bandeau défilant des actualités et services"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <div className={styles.sliderContainer}>
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
              aria-roledescription="Diapositive"
              aria-label={`${index + 1} sur ${totalSlides}`}
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
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={goToPrev}
            aria-label="Diapositive précédente"
          >
            <Icons.ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={goToNext}
            aria-label="Diapositive suivante"
          >
            <Icons.ChevronRight size={24} />
          </button>

          {/* Indicateurs : en RTL, le 1er point est à droite (même sens que les diapositives) */}
          <div
            className={styles.dots}
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
            role="tablist"
            aria-label="Indicateurs de diapositives"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Aller à la diapositive ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Icons } from '@/components/icons/Icons';
import styles from './Slider.module.css';

export type Slide = {
  id: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
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
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={styles.slide}
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
          <button
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={isRtl ? goToNext : goToPrev}
            aria-label={isRtl ? 'Diapositive suivante' : 'Diapositive précédente'}
          >
            <Icons.ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={isRtl ? goToPrev : goToNext}
            aria-label={isRtl ? 'Diapositive précédente' : 'Diapositive suivante'}
          >
            <Icons.ChevronRight size={24} />
          </button>

          <div className={styles.dots} role="tablist" aria-label="Indicateurs de diapositives">
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
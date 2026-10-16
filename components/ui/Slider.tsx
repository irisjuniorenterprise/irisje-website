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
// GLISSEMENT AUX DOIGTS UNIQUEMENT
// ----------------------------------------------------------
// - Mobile / tablette : UN doigt suffit (événements tactiles).
// - Ordinateur : balayage horizontal à DEUX doigts sur le
//   pavé tactile (événements `wheel` avec deltaX).
// Dans les deux cas le contenu suit les doigts en temps réel,
// puis se cale sur la diapositive voisine ou revient en place.
// La souris (clic + glisser) n'est volontairement PAS utilisée.
// ============================================================
const DRAG_START_PX = 6;          // seuil avant de considérer un geste comme un glissement
const SWIPE_MIN_PX = 50;          // distance minimale pour changer de diapositive…
const SWIPE_DISTANCE_RATIO = 0.2; // …ou 20 % de la largeur (le plus grand des deux)
const FLICK_VELOCITY = 0.4;       // px/ms : un geste rapide suffit même s'il est court
const EDGE_RESISTANCE = 0.35;     // effet « élastique » en bout de carrousel
const SETTLE_MS = 500;            // durée du calage (identique à la transition CSS)
const WHEEL_MIN_PX = 60;          // pavé tactile : distance minimale pour changer de diapositive…
const WHEEL_RATIO = 0.15;         // …ou 15 % de la largeur (le plus grand des deux)
const WHEEL_IDLE_MS = 120;        // silence = doigts levés : fin du geste

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  width: number;
  active: boolean;
  samples: { x: number; t: number }[];
};

export default function Slider({
  slides,
  autoplay = false,
  interval,
  className = '',
  locale = 'fr',
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Pause TEMPORAIRE : survol à la souris ou focus clavier. Deux sources
  // distinctes (un seul booléen se faisait écraser : un « blur » relançait
  // l'avance alors que la souris était encore dessus, et inversement).
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPaused = isHovered || isFocused;
  // Pause VOLONTAIRE : uniquement le bouton ⏸/▶. La navigation manuelle
  // (flèches, points, clavier, balayage) ne coupe plus l'avance automatique :
  // elle repart pour une durée complète sur la diapositive atteinte.
  const [isUserPaused, setIsUserPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Glissement : décalage en pixels appliqué en direct à la piste pendant le geste
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  // Vrai si le geste vient d'être un glissement : sert à ignorer le « clic » fantôme
  // qui suit le relâchement (sinon un lien CTA serait ouvert à la fin d'un glissement).
  const didDragRef = useRef(false);
  // Pavé tactile (deux doigts) : état du geste en cours, hors rendu
  const wheelRef = useRef<{
    active: boolean; // geste en cours, le contenu suit les doigts
    locked: boolean; // changement fait : on ignore l'inertie jusqu'au silence
    offset: number;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ active: false, locked: false, offset: 0, timer: null });
  // Dernières valeurs lues par l'écouteur `wheel` (installé une seule fois)
  const latestRef = useRef({ currentIndex: 0, totalSlides: 0, isRtl: false, isTransitioning: false });

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

  // Durée d'affichage de la diapositive COURANTE : imposée par `interval`
  // si la page en fournit une, sinon adaptative selon le texte à lire
  // (cf. getDwellMs). La lecture se règle donc sur le contenu réel, pas
  // sur un rythme unique imposé à des textes de longueurs différentes.
  const currentDwellMs = interval ?? getDwellMs(slides[currentIndex]);

  // Une pression sur ⏸ stoppe et coupe le timer ; une pression sur ▶
  // remet la lecture en route (le timer repart alors pour un intervalle
  // complet, sans course résiduelle).
  const toggleAutoPlay = useCallback(() => setIsUserPaused((paused) => !paused), []);

  // Active la transition CSS le temps du calage (changement de diapositive ou retour en place)
  const settle = useCallback(() => {
    setIsTransitioning(true);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => setIsTransitioning(false), SETTLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    },
    []
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      settle();
      setCurrentIndex(index);
    },
    [currentIndex, isTransitioning, settle]
  );

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, goToSlide, totalSlides]);

  // Avance du timer : indépendante de `isTransitioning` et de `currentIndex`
  // (updater fonctionnel) → identité stable, jamais de timer « perdu » parce
  // qu'un callback périmé a été capturé pendant un calage.
  const advance = useCallback(() => {
    settle();
    setCurrentIndex((i) => (i + 1) % totalSlides);
  }, [settle, totalSlides]);

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
    // Timer uniquement si : avance auto rendue possible (demandée par la
    // page, ≥ 2 diapositives, pas de préférence « réduire les animations »),
    // non interrompue par l'utilisateur (bouton ⏸ ou navigation manuelle),
    // et curseur/focus hors du carrousel (sinon la lecture s'interrompt le
    // temps du survol ou du focus clavier).
    if (autoPlayRunning && !isPaused && !isDragging) {
      // setTimeout (et non setInterval) : chaque diapositive a sa propre
      // durée, calculée d'après la longueur de son texte. Le compteur
      // repart à zéro à chaque changement, jamais au milieu d'une lecture.
      // `currentIndex` est une dépendance explicite : avec une durée identique
      // d'une diapositive à l'autre (prop `interval`, ou plancher de 4,5 s),
      // rien d'autre ne relancerait le timer après un changement manuel.
      timerRef.current = setTimeout(advance, currentDwellMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlayRunning, isPaused, isDragging, advance, currentDwellMs, currentIndex]);

  useEffect(() => {
    latestRef.current = { currentIndex, totalSlides, isRtl, isTransitioning };
  });

  // ------------------------------------------------------------
  // Balayage à DEUX doigts sur pavé tactile (ordinateur)
  // ------------------------------------------------------------
  // Le navigateur reçoit ce geste sous forme d'événements `wheel` avec un
  // deltaX. Écouteur natif non passif (et non `onWheel` de React) : il faut
  // pouvoir appeler preventDefault() pour empêcher le navigateur d'interpréter
  // le geste comme « page précédente / suivante ».
  // Le défilement vertical normal (deltaY dominant) n'est jamais intercepté.
  const hasSlides = totalSlides > 0;
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheel = wheelRef.current;

    // Silence prolongé = les doigts ont quitté le pavé
    const endGesture = () => {
      wheel.timer = null;
      const wasActive = wheel.active;
      wheel.active = false;
      wheel.locked = false;
      wheel.offset = 0;
      if (wasActive) {
        // Seuil non atteint : retour en place en douceur
        settle();
        setIsDragging(false);
        setDragOffset(0);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pincement (zoom) : hors sujet
      const { currentIndex, totalSlides, isRtl, isTransitioning } = latestRef.current;
      const unit = e.deltaMode === 1 ? 16 : 1; // Firefox peut compter en lignes
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;

      if (!wheel.active && !wheel.locked) {
        if (totalSlides < 2 || isTransitioning) return;
        // Geste vertical ou micro-mouvement : on laisse la page défiler
        if (Math.abs(dx) < 2 || Math.abs(dx) <= Math.abs(dy)) return;
        wheel.active = true;
        wheel.offset = 0;
        setIsDragging(true);
      }

      e.preventDefault();
      if (wheel.timer) clearTimeout(wheel.timer);
      wheel.timer = setTimeout(endGesture, WHEEL_IDLE_MS);
      if (wheel.locked) return; // inertie du pavé après un changement : ignorée

      // Les doigts vont vers la gauche (deltaX > 0) : le contenu part vers la gauche
      const width = el.getBoundingClientRect().width;
      wheel.offset = Math.max(-width, Math.min(width, wheel.offset - dx));
      const forward = isRtl ? wheel.offset > 0 : wheel.offset < 0;
      const atEdge =
        (forward && currentIndex === totalSlides - 1) || (!forward && currentIndex === 0);
      setDragOffset(atEdge ? wheel.offset * EDGE_RESISTANCE : wheel.offset);

      // Seuil atteint : on change tout de suite, puis on ignore l'inertie
      if (!atEdge && Math.abs(wheel.offset) >= Math.max(WHEEL_MIN_PX, width * WHEEL_RATIO)) {
        wheel.active = false;
        wheel.locked = true;
        wheel.offset = 0;
        settle();
        setIsDragging(false);
        setDragOffset(0);
        setCurrentIndex(currentIndex + (forward ? 1 : -1));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheel.timer) clearTimeout(wheel.timer);
    };
  }, [hasSlides, settle]);

  // ------------------------------------------------------------
  // Glissement à UN doigt (mobile / tablette)
  // ------------------------------------------------------------
  // `touch-action: pan-y` (CSS) laisse le navigateur gérer le défilement
  // vertical de la page ; le mouvement horizontal nous revient.
  // En RTL, « suivant » correspond à un geste vers la DROITE.
  const isForward = (dx: number) => (isRtl ? dx > 0 : dx < 0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (totalSlides < 2 || isTransitioning) return;
    if (e.pointerType !== 'touch') return; // doigts uniquement : ni souris, ni stylet
    didDragRef.current = false;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      width: e.currentTarget.getBoundingClientRect().width,
      active: false,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;

    if (!drag.active) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      // Pas encore un glissement : trop court, ou plutôt vertical
      if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) < Math.abs(dy)) return;
      drag.active = true;
      didDragRef.current = true;
      drag.startX = e.clientX; // repart de 0 : pas de « saut » au démarrage
      // La capture n'est prise qu'ici (pas au simple appui) pour ne pas
      // détourner le toucher sur les liens CTA.
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
    }

    const dx = e.clientX - drag.startX;
    drag.samples.push({ x: e.clientX, t: e.timeStamp });
    if (drag.samples.length > 6) drag.samples.shift();

    // Effet élastique : en première / dernière diapositive, on ne peut pas aller plus loin
    const atEdge =
      (isForward(dx) && currentIndex === totalSlides - 1) ||
      (!isForward(dx) && currentIndex === 0);
    const clamped = Math.max(-drag.width, Math.min(drag.width, dx));
    setDragOffset(atEdge ? clamped * EDGE_RESISTANCE : clamped);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (!drag.active) return; // simple clic / appui : on ne touche à rien

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const dx = e.clientX - drag.startX;
    const first = drag.samples[0];
    const last = drag.samples[drag.samples.length - 1];
    const velocity = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;

    const passedDistance = Math.abs(dx) >= Math.max(SWIPE_MIN_PX, drag.width * SWIPE_DISTANCE_RATIO);
    const passedFlick = Math.abs(velocity) >= FLICK_VELOCITY && Math.abs(dx) >= 20;
    const direction = passedFlick && !passedDistance ? velocity : dx;
    const target = currentIndex + (isForward(direction) ? 1 : -1);
    const canChange =
      !cancelled && (passedDistance || passedFlick) && target >= 0 && target < totalSlides;

    // Un seul rendu : la transition CSS part de la position actuelle du doigt
    // vers la position finale (diapositive voisine ou retour en place).
    settle();
    setIsDragging(false);
    setDragOffset(0);
    if (canChange) {
      setCurrentIndex(target);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
    }
  };

  // Survol : souris uniquement. Sur écran tactile, `mouseenter` est émulé au
  // toucher et `mouseleave` n'arrive qu'au toucher suivant ailleurs → la
  // lecture restait bloquée. Les événements pointeur donnent le vrai type.
  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setIsHovered(true);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setIsHovered(false);
  };
  // Focus : seulement le focus CLAVIER (:focus-visible). Un clic sur une
  // flèche ou un point donne le focus à un bouton sans que ce soit une
  // demande de pause.
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
      ref={containerRef}
    >
      <div
        className={`${styles.sliderContainer} ${isDragging ? styles.dragging : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => finishDrag(e, false)}
        onPointerCancel={(e) => finishDrag(e, true)}
        // Filet de sécurité : capture perdue sans pointerup → on ne reste pas « en glissement »
        // (isDragging bloquerait l'avance automatique pour toujours)
        onLostPointerCapture={(e) => finishDrag(e, true)}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className={styles.sliderTrack}
          style={{
            // RTL : la 1re diapositive est à droite, la suite se lit de droite à gauche
            flexDirection: isRtl ? 'row-reverse' : 'row',
            // Position de la diapositive + décalage du doigt en pixels (suivi en direct)
            transform: `translateX(calc(${(isRtl ? 1 : -1) * currentIndex * 100}% + ${dragOffset}px))`,
            // Pas de transition PENDANT le glissement (la piste colle au doigt), seulement au calage
            transition:
              isTransitioning && !isDragging
                ? `transform ${SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : 'none',
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
                    <a href={slide.cta.href} className={styles.slideCta} draggable={false}>
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
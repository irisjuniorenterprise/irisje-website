// components/ui/BackToTop.tsx
//
// Bouton "retour en haut", dans la même famille visuelle que ScrollDownButton :
// pastille primaire cerclée de blanc, disque blanc au centre avec chevrons
// animés. Nouveauté UX : un anneau autour du disque indique la progression de
// lecture de la page (0 % en haut, 100 % en bas).
//
// Il apparaît quand l'utilisateur a scrollé (seuil en px depuis le haut),
// masqué sinon. Le clic défile en douceur jusqu'en haut (smooth, sauf si
// prefers-reduced-motion).
//
// La progression est écrite directement dans une variable CSS (--progress,
// de 0 à 1) via une ref : aucun re-render à chaque pixel de scroll. Seul le
// passage visible / masqué passe par l'état React.

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './BackToTop.module.css';

/** Distance de scroll (px) à partir de laquelle le bouton apparaît. */
const SCROLL_THRESHOLD_PX = 600;

export default function BackToTop() {
  const t = useTranslations('Common');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      buttonRef.current?.style.setProperty('--progress', progress.toFixed(4));
      setVisible(y > SCROLL_THRESHOLD_PX);
    };

    // Un seul calcul par image (requestAnimationFrame) : léger même sur mobile.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    // État initial au montage (utile si le navigateur restaure le scroll).
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${styles.backToTop} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label={t('back_to_top')}
      aria-hidden={!visible}
      // tabIndex=-1 quand masqué : le bouton ne doit pas être atteignable au
      // clavier tant qu'il n'est pas visible.
      tabIndex={visible ? 0 : -1}
    >
      {/* Anneau de progression de lecture (décoratif) */}
      <i className={styles.progress} aria-hidden="true" />

      {/* Disque blanc + deux chevrons qui « montent » au survol */}
      <i className={styles.disc} aria-hidden="true">
        <i className={styles.chevrons}>
          <Icons.ChevronDown size={18} strokeWidth={3} className={styles.chevron} />
          <Icons.ChevronDown size={18} strokeWidth={3} className={styles.chevron} />
        </i>
      </i>
    </button>
  );
}
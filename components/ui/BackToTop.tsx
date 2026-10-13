// components/ui/BackToTop.tsx
//
// Bouton "retour en haut" : apparaît avec une animation quand l'utilisateur
// a scrollé (seuil en px depuis le haut), masqué sinon. Le clic défile en
// douceur jusqu'en haut de la page (smooth scroll).
//
// Le seuil est exprimé en px (et non en % de la page) : sur une page courte
// le bouton n'apparaît jamais (inutile), sur une longue page il apparaît vite.

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './BackToTop.module.css';

/** Distance de scroll (px) à partir de laquelle le bouton apparaît. */
const SCROLL_THRESHOLD_PX = 600;

export default function BackToTop() {
  const t = useTranslations('Common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Passif : on laisse le navigateur gérer le scroll, le listener ne fait
    // que mettre à jour l'état `visible` (peu coûteux).
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    };

    // État initial au montage (utile si l'utilisateur arrive avec un scroll
    // restauré par le navigateur).
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    // comportement 'smooth' respecte prefers-reduced-motion via le CSS
    // (scroll-behavior: auto si l'utilisateur désire moins d'animations),
    // mais on force smooth en JS pour la majorité des utilisateurs.
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
      type="button"
      className={`${styles.backToTop} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label={t('back_to_top')}
      aria-hidden={!visible}
      // tabIndex=-1 quand masqué : le bouton ne doit pas être atteignable au
      // clavier tant qu'il n'est pas visible.
      tabIndex={visible ? 0 : -1}
    >
      <Icons.ArrowUp size={22} />
    </button>
  );
}

// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './Header.module.css';
import logoData from '@/public/horiz-logo.png';
import LanguageSwitcher from './LanguageSwitcher';
import { Icons } from '@/components/icons/Icons';
import JoinLink from './JoinLink';

type HeaderProps = {
  /** Période de recrutement ouverte : affiche IRIS JOIN dans le header. */
  joinOpen?: boolean;
  /** Dernier jour de candidature, déjà formaté (ex. « 7 octobre »). */
  joinUntil?: string;
};

export default function Header({ joinOpen = false, joinUntil }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  // Extraire la locale du pathname
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'fr';
  const pathWithoutLocale = '/' + segments.slice(1).join('/');

  // Déterminer si RTL
  const isRtl = locale === 'ar';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.classList.remove('menu-open');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Le menu mobile est un « disclosure » (APG) : aucun piège de focal, mais
  // Échap doit le refermer et rendre le focal au bouton qui l'a ouvert,
  // sinon le clavier se retrouve en haut de page sans repère.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      document.body.classList.remove('menu-open');
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isActive = (path: string) => {
    if (path === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale.startsWith(path);
  };

  // La classe CSS ne dit rien à un lecteur d'écran : on expose en plus l'état
  // « page courante » attendu pour une navigation (APG Navigation Bar).
  const ariaCurrent = (path: string) => (isActive(path) ? 'page' : undefined);

  const localHref = (path: string) => {
    if (path.startsWith('/#')) return path;
    if (path === '/') return `/${locale}`;
    return `/${locale}${path}`;
  };

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${scrolled ? styles.isScrolled : ''} ${isRtl ? styles.rtl : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className={`container ${styles.inner}`}>
        <Link href={localHref('/')} className={styles.logo} onClick={closeMenu}>
          <Image src={logoData} alt="IRIS Junior Entreprise" priority />
        </Link>

        <div className={styles.rightSection}>
          <nav className={styles.nav} aria-label={t('aria_label')}>
            <ul className={styles.navList}>
              <li>
                <Link
                  href={localHref('/')}
                  className={isActive('/') ? styles.active : ''}
                  aria-current={ariaCurrent('/')}
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href={localHref('/a-propos')}
                  className={isActive('/a-propos') ? styles.active : ''}
                  aria-current={ariaCurrent('/a-propos')}
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href={localHref('/services')}
                  className={isActive('/services') ? styles.active : ''}
                  aria-current={ariaCurrent('/services')}
                >
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link
                  href={localHref('/devis')}
                  className={isActive('/devis') ? styles.active : ''}
                  aria-current={ariaCurrent('/devis')}
                >
                  {t('devis')}
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <LanguageSwitcher
              locale={locale}
              pathWithoutLocale={pathWithoutLocale}
              label={t('language')}
              onNavigate={closeMenu}
            />

            {/* IRIS JOIN (desktop) : pastille discrète à côté du CTA principal,
                sans lui voler la vedette. En petit écran : carte du menu. */}
            {joinOpen && <JoinLink locale={locale} variant="pill" />}

            {/* Bouton Contact desktop : en petit écran il passe dans le menu déroulant */}
            <Link href={localHref('/contact')} className={`btn btn-cta ${styles.desktopCta}`}>
              {t('contact')}
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              className={`${styles.menuButton} ${isOpen ? styles.isActive : ''} ${joinOpen && !isOpen ? styles.hasNotice : ''}`}
              onClick={toggleMenu}
              aria-label={t('menu')}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Panneau mobile : `visibility: hidden` au repos (voir le module CSS),
          donc déjà hors de l'arbre d'accessibilité et non focalisable. */}
      <div
        id="mobile-nav"
        className={`${styles.mobileNav} ${isOpen ? styles.isOpen : ''}`}
      >
        <nav aria-label={t('aria_label_mobile')}>
          <ul>
            {/* Carte IRIS JOIN : en tête du menu, c'est l'info temporaire et
                prioritaire de la période. */}
            {joinOpen && (
              <li className={styles.mobileJoinItem}>
                <JoinLink locale={locale} variant="card" until={joinUntil} onNavigate={closeMenu} />
              </li>
            )}
            <li>
              <Link
                href={localHref('/')}
                className={isActive('/') ? styles.active : ''}
                aria-current={ariaCurrent('/')}
                onClick={closeMenu}
              >
                {t('home')}
              </Link>
            </li>
            <li>
              <Link
                href={localHref('/a-propos')}
                className={isActive('/a-propos') ? styles.active : ''}
                aria-current={ariaCurrent('/a-propos')}
                onClick={closeMenu}
              >
                {t('about')}
              </Link>
            </li>
            <li>
              <Link
                href={localHref('/services')}
                className={isActive('/services') ? styles.active : ''}
                aria-current={ariaCurrent('/services')}
                onClick={closeMenu}
              >
                {t('services')}
              </Link>
            </li>
            <li>
              <Link
                href={localHref('/devis')}
                className={isActive('/devis') ? styles.active : ''}
                aria-current={ariaCurrent('/devis')}
                onClick={closeMenu}
              >
                {t('devis')}
              </Link>
            </li>
            {/* Bouton Contact du menu déroulant (petits écrans) : pilule
                pleine largeur, icône + texte */}
            <li className={styles.mobileCtaItem}>
              <Link
                href={localHref('/contact')}
                className={styles.mobileCta}
                aria-current={ariaCurrent('/contact')}
                onClick={closeMenu}
              >
                <Icons.Mail size={20} />
                <span>{t('contact')}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
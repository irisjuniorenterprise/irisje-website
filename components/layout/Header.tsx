// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './Header.module.css';
import logoData from '@/public/horiz-logo.png';
import { isRecruitmentOpen } from '@/lib/utils/date';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
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

  const isActive = (path: string) => {
    if (path === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale.startsWith(path);
  };

  const showRecruitment = isRecruitmentOpen();

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
                <Link href={localHref('/')} className={isActive('/') ? styles.active : ''}>
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href={localHref('/a-propos')} className={isActive('/a-propos') ? styles.active : ''}>
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={localHref('/services')} className={isActive('/services') ? styles.active : ''}>
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link href={localHref('/devis')} className={isActive('/devis') ? styles.active : ''}>
                  {t('devis')}
                </Link>
              </li>
              {showRecruitment && (
                <li>
                  <Link href={localHref('/recrutement')} className={isActive('/recrutement') ? styles.active : ''}>
                    {t('recruitment')}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link href={localHref('/contact')} className={`btn btn-cta ${styles.desktopCta}`}>
              {t('contact')}
            </Link>

            <button
              className={`${styles.menuButton} ${isOpen ? styles.isActive : ''}`}
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>

      <div className={`${styles.mobileNav} ${isOpen ? styles.isOpen : ''}`}>
        <nav aria-label={t('aria_label')}>
          <ul>
            <li>
              <Link href={localHref('/')} className={isActive('/') ? styles.active : ''} onClick={closeMenu}>
                {t('home')}
              </Link>
            </li>
            <li>
              <Link href={localHref('/a-propos')} className={isActive('/a-propos') ? styles.active : ''} onClick={closeMenu}>
                {t('about')}
              </Link>
            </li>
            <li>
              <Link href={localHref('/services')} className={isActive('/services') ? styles.active : ''} onClick={closeMenu}>
                {t('services')}
              </Link>
            </li>
            <li>
              <Link href={localHref('/devis')} className={isActive('/devis') ? styles.active : ''} onClick={closeMenu}>
                {t('devis')}
              </Link>
            </li>
            {showRecruitment && (
              <li>
                <Link href={localHref('/recrutement')} className={isActive('/recrutement') ? styles.active : ''} onClick={closeMenu}>
                  {t('recruitment')}
                </Link>
              </li>
            )}
            <li>
              <Link href={localHref('/contact')} className={styles.mobileCta} onClick={closeMenu}>
                {t('contact')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
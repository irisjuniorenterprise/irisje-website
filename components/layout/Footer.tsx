'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './Footer.module.css';
import logoData from '@/public/logo-s-no-bg.png';
import JoinLink from './JoinLink';
import { SERVICE_NAMES, SERVICE_SLUGS } from '@/lib/data/servicesIndex';
import type { Locale } from '@/i18n/config';

const socialIcons = {
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M13.5 21v-7.94h2.66l.4-3.1h-3.06V8.05c0-.9.25-1.51 1.54-1.51h1.64V3.77c-.28-.04-1.26-.12-2.38-.12-2.36 0-3.97 1.44-3.97 4.08v2.27H7.66v3.1h2.67V21h3.17z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zm0 5.94a2.34 2.34 0 1 1 0-4.68 2.34 2.34 0 0 1 0 4.68zM17.5 8.27a.84.84 0 1 1-1.68 0 .84.84 0 0 1 1.68 0z" />
      <path d="M16.6 3.5H7.4a3.9 3.9 0 0 0-3.9 3.9v9.2a3.9 3.9 0 0 0 3.9 3.9h9.2a3.9 3.9 0 0 0 3.9-3.9V7.4a3.9 3.9 0 0 0-3.9-3.9zm2.62 13.1a2.63 2.63 0 0 1-2.62 2.62H7.4a2.63 2.63 0 0 1-2.62-2.62V7.4A2.63 2.63 0 0 1 7.4 4.78h9.2a2.63 2.63 0 0 1 2.62 2.62v9.2z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.2c-5.52 0-10 4.48-10 10 0 4.42 2.87 8.17 6.84 9.5.5.1.68-.22.68-.48 0-.24-.01-.86-.01-1.69-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.96 0-1.1.39-1.99 1.03-2.7-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.4 9.4 0 0 1 5 0c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.65.64.71 1.03 1.6 1.03 2.7 0 3.86-2.34 4.71-4.57 4.96.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .26.18.58.69.48A10.01 10.01 0 0 0 22 12.2c0-5.52-4.48-10-10-10z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M16.6 5.4a4.5 4.5 0 0 1-3.18-1.83V14.9a4.65 4.65 0 1 1-4-4.6v2.36a2.3 2.3 0 1 0 1.62 2.2V2.6h2.3a4.5 4.5 0 0 0 3.26 4.13V9a6.8 6.8 0 0 1-3.26-1.04v.01-.01z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

type FooterProps = {
  /** Période de recrutement ouverte (1er sept. → 31 oct.) : affiche le lien IRIS JOIN. */
  joinOpen?: boolean;
  /** Coordonnées publiques, fournies par le layout (serveur) pour ne pas alourdir le client. */
  contact: { email: string; telephone: string };
};

/** « +21696822343 » → « +216 96 822 343 » (affichage) */
const formatPhone = (tel: string) => tel.replace(/^(\+\d{3})(\d{2})(\d{3})(\d{3})$/, '$1 $2 $3 $4');

export default function Footer({ joinOpen = false, contact }: FooterProps) {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'fr';

  const isRtl = locale === 'ar';

  // Page courante, sans la locale (« /fr/faq » → « /faq »).
  const pathWithoutLocale = `/${segments.slice(1).join('/')}`;

  // Lien de la page active : repéré visuellement (classe `active`, voir
  // Footer.module.css) ET pour les lecteurs d'écran (`aria-current`), comme
  // dans le header. « page » = la page elle-même ; « true » = une page
  // enfant (ex. un guide dans /guides). Les liens externes ne sont jamais actifs.
  const currentProps = (path: string) => {
    const current: 'page' | 'true' | undefined =
      pathWithoutLocale === path
        ? 'page'
        : pathWithoutLocale.startsWith(`${path}/`)
          ? 'true'
          : undefined;
    return current ? { className: styles.active, 'aria-current': current } : {};
  };

  // Apparition animée des éléments du footer (voir « ANIMATION D'APPARITION »
  // dans Footer.module.css). Le footer est rendu VISIBLE côté serveur : sans
  // JavaScript, ou avec « réduire les animations », rien n'est jamais masqué
  // (contenu et liens toujours lisibles / indexables). L'état « pending »
  // (éléments masqués) n'est posé ici qu'une fois l'animation possible, avant
  // la première peinture (useLayoutEffect : pas de clignotement), puis passe à
  // « in » quand le footer entre à l'écran. L'attribut est écrit directement
  // dans le DOM (pas de state) : aucun rendu React supplémentaire.
  // Relancé à chaque changement de page : le footer est persistant dans le
  // layout, on rejoue donc l'animation pour qu'elle reste vivante.
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    el.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = 'in';
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [pathname]);

  const localHref = (path: string) => {
    if (path.startsWith('/#')) return path;
    if (path === '/') return `/${locale}`;
    return `/${locale}${path}`;
  };

  return (
    <footer
      ref={footerRef}
      className={`${styles.siteFooter} ${isRtl ? styles.rtl : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="container">
        <div className={styles.footerTop}>
          {/* Le header porte déjà la navigation principale (Accueil, À propos,
              Services, Devis, Contact) : le pied de page ne la répète pas. Il
              sert à ce que le header n'affiche pas : les pages de chaque
              service, les ressources et les mentions légales.
              Disposition (centrée à toutes les tailles, un seul axe) : la bande
              des 9 services sur toute la largeur ; dessous, 3 blocs de même
              forme (ressources, légal, coordonnées : titre + liens) ; puis la
              marque (logo + réseaux).
              L'ordre du DOM = l'ordre visuel (focus clavier cohérent). */}
          <div className={`${styles.footerCol} ${styles.footerServices}`}>
            <h3>{t('footer_services')}</h3>
            <ul>
              {SERVICE_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link href={localHref(`/services/${slug}`)} {...currentProps(`/services/${slug}`)}>
                    {SERVICE_NAMES[(locale === 'en' || locale === 'ar' ? locale : 'fr') as Locale][slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.footerCol} ${styles.footerResources}`}>
            <h3>{t('footer_resources')}</h3>
            <ul>
              <li><Link href={localHref('/a-propos')} {...currentProps('/a-propos')}>{t('about')}</Link></li>
              <li><Link href={localHref('/guides')} {...currentProps('/guides')}>{t('guides')}</Link></li>
              <li><Link href={localHref('/faq')} {...currentProps('/faq')}>{t('faq')}</Link></li>
              {/* IRIS JOIN : uniquement pendant la période de recrutement */}
              {joinOpen && (
                <li><JoinLink locale={locale} variant="text" /></li>
              )}
            </ul>
          </div>
          <div className={`${styles.footerCol} ${styles.footerLegal}`}>
            <h3>{t('legal')}</h3>
            <ul>
              <li><Link href={localHref('/mentions-legales')} {...currentProps('/mentions-legales')}>{t('legal_mentions')}</Link></li>
              <li><Link href={localHref('/politique-confidentialite')} {...currentProps('/politique-confidentialite')}>{t('legal_confidentialite')}</Link></li>
              <li><Link href={localHref('/cgu')} {...currentProps('/cgu')}>{t('legal_cgu')}</Link></li>
            </ul>
          </div>
          {/* Coordonnées : même forme que les autres blocs (titre + 3 lignes) */}
          <div className={`${styles.footerCol} ${styles.footerContactCol}`}>
            <h3>{t('footer_contact')}</h3>
            <address>
              <ul>
                <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
                <li><a href={`tel:${contact.telephone}`} dir="ltr">{formatPhone(contact.telephone)}</a></li>
                <li><span className={styles.footerAddress}>{t('footer_address')}</span></li>
              </ul>
            </address>
          </div>
          <div className={styles.footerBrand}>
            <Image className={styles.footerLogo} src={logoData} alt="IRIS Junior Entreprise" width={80} height={80} />
            <div className={styles.socialLinks}>
              <a href="https://tn.linkedin.com/company/iris-junior-creation" aria-label="LinkedIn">{socialIcons.linkedin}</a>
              <a href="https://www.facebook.com/IRIS.Junior" aria-label="Facebook">{socialIcons.facebook}</a>
              <a href="https://www.instagram.com/iris.junior.creation/" aria-label="Instagram">{socialIcons.instagram}</a>
              <a href="https://github.com/irisjuniorenterprise" aria-label="GitHub">{socialIcons.github}</a>
              <a href="https://www.tiktok.com/@iris.junior.entreprise" aria-label="TikTok">{socialIcons.tiktok}</a>
              <a href="https://x.com/irisjuniorentre" aria-label="X">{socialIcons.x}</a>
            </div>
          </div>
        </div>
        <div className={styles.footerDivider}></div>
        <div className={styles.footerBottom}>
          <p>&copy; {year} IRIS JE. {t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
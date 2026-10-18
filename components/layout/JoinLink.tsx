// components/layout/JoinLink.tsx
'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { JOIN_FALLBACK_URL, getJoinText, joinUrlFromHostname } from '@/lib/join';
import styles from './JoinLink.module.css';

// L'URL dépend du domaine réellement visité (.com ou .tn). useSyncExternalStore
// rend le repli (.com) côté serveur et pendant l'hydratation, puis bascule sur
// le bon domaine : pas d'erreur d'hydratation, et ce composant fonctionne
// partout où il est monté.
const subscribe = () => () => {};
const getClientUrl = () => joinUrlFromHostname(window.location.hostname);
const getServerUrl = () => JOIN_FALLBACK_URL;

type JoinLinkProps = {
  /** Locale courante (fr | en | ar) */
  locale: string;
  /**
   * - `pill` : pastille du header desktop (logo + « Nouveau »)
   * - `card` : carte en tête du menu mobile (titre + date limite)
   */
  variant: 'pill' | 'card';
  /** Dernier jour de candidature, déjà formaté (variante `card`). */
  until?: string;
  /** Appelé au clic (ex. refermer le menu mobile). */
  onNavigate?: () => void;
};

/** Flèche « ↗ » : annonce l'ouverture d'un nouvel onglet. Purement décorative. */
function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export default function JoinLink({ locale, variant, until, onNavigate }: JoinLinkProps) {
  const href = useSyncExternalStore(subscribe, getClientUrl, getServerUrl);
  const { badge, hint, title, until: untilText } = getJoinText(locale);

  if (variant === 'card') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={styles.card}
        onClick={onNavigate}
      >
        <span className={styles.chip}>{badge}</span>
        <span className={styles.cardLogoTile}>
          <Image
            className={styles.cardLogo}
            src="/iris-join-logo.svg"
            alt="IRIS JOIN"
            width={72}
            height={26}
            unoptimized
          />
        </span>
        <span className={styles.cardText}>
          <span className={styles.cardTitle}>{title}</span>
          {until && <span className={styles.cardSub}>{untilText(until)}</span>}
        </span>
        <span className={styles.cardArrow}>
          <ExternalIcon />
        </span>
        <span className="sr-only"> — {hint}</span>
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener" className={styles.pill}>
      <Image
        className={styles.pillLogo}
        src="/iris-join-logo.svg"
        alt="IRIS JOIN"
        width={72}
        height={26}
        unoptimized
      />
      <span className={styles.chip}>{badge}</span>
      <ExternalIcon className={styles.pillIcon} />
      <span className="sr-only"> — {hint}</span>
    </a>
  );
}

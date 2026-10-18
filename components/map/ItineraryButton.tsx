// components/map/ItineraryButton.tsx
//
// Panneau « Itinéraire » de la section Nous trouver.
//
// Nouvelle expérience (plus de popup Google Maps) :
//   1. Un clic -> localisation du visiteur puis calcul de l'itinéraire.
//   2. Le trajet se dessine DIRECTEMENT sur la carte de la page (voir
//      TunisiaMap), avec durée et distance dans ce panneau.
//   3. Actions claires : ouvrir Google Maps / Waze (nouvel onglet, ouvre
//      l'application sur mobile) ou effacer l'itinéraire.
//   4. Chaque erreur (permission refusée, délai, hors route…) explique quoi
//      faire et propose toujours une issue : ouvrir Google Maps.
//
// Accessibilité : région live (annonce chaque étape), focus déplacé sur le
// résultat puis rendu au bouton, aucun clavier piégé, animations coupées si
// prefers-reduced-motion.
//
// NB : pas de <span> ici — la section hôte a la règle globale
// `.placeholder span` (majuscules + puce ✦).

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import { CarIcon, ExternalIcon } from './MapIcons';
import {
  IRIS_DESTINATION,
  clearDirections,
  formatDistance,
  formatDuration,
  googleMapsUrl,
  parseLatLng,
  requestDirections,
  useDirections,
  wazeUrl,
  type DirectionsError,
} from './directionsStore';
import styles from './ItineraryButton.module.css';

type ItineraryButtonProps = {
  /** Destination "lat,lng" (coordonnées affichées sur la carte) */
  destination: string;
  /** Classes CSS additionnelles (pour s'intégrer dans la page hôte) */
  className?: string;
};

const ERROR_KEYS: Record<DirectionsError, string> = {
  denied: 'map.error_denied',
  unavailable: 'map.error_unavailable',
  timeout: 'map.error_timeout',
  unsupported: 'map.error_unsupported',
  noroute: 'map.error_noroute',
  network: 'map.error_network',
};

/** Erreurs pour lesquelles « Réessayer » a un sens. */
const RETRYABLE: DirectionsError[] = ['denied', 'unavailable', 'timeout', 'network'];

export default function ItineraryButton({ destination, className }: ItineraryButtonProps) {
  const t = useTranslations('AboutPage');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { status, error, origin, route } = useDirections();

  const dest = useMemo(() => parseLatLng(destination) ?? IRIS_DESTINATION, [destination]);

  const ctaRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const prevStatus = useRef(status);

  // Quitter la page : on n'emporte pas un itinéraire périmé.
  useEffect(() => () => clearDirections(), []);

  // Gestion du focus aux changements d'étape (sans faire défiler la page).
  useEffect(() => {
    const previous = prevStatus.current;
    if (previous === status) return;
    prevStatus.current = status;

    if (status === 'ready') cardRef.current?.focus({ preventScroll: true });
    else if (status === 'error') errorRef.current?.focus({ preventScroll: true });
    else if (status === 'idle' && (previous === 'ready' || previous === 'error')) {
      ctaRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  const busy = status === 'locating' || status === 'routing';
  const googleHref = googleMapsUrl(dest, origin);

  const duration = route ? formatDuration(route.duration, locale) : '';
  const distance = route ? formatDistance(route.distance, locale) : '';

  // Message annoncé aux lecteurs d'écran à chaque étape.
  let liveMessage = '';
  if (status === 'locating') liveMessage = t('map.itinerary_locating');
  else if (status === 'routing') liveMessage = t('map.itinerary_calculating');
  else if (status === 'ready') liveMessage = t('map.itinerary_ready', { duration, distance });
  else if (status === 'error' && error) liveMessage = t(ERROR_KEYS[error]);

  const start = () => {
    if (!busy) void requestDirections(dest);
  };

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <p className={styles.srOnly} role="status" aria-live="polite">
        {liveMessage}
      </p>

      {/* ---------- Accueil / chargement ---------- */}
      {(status === 'idle' || busy) && (
        <>
          <button
            ref={ctaRef}
            type="button"
            className={`btn btn-cta ${styles.cta}`}
            onClick={start}
            aria-disabled={busy}
            aria-busy={busy}
            aria-label={busy ? undefined : t('map.itinerary_aria')}
          >
            {busy ? (
              <i className={styles.spinner} aria-hidden="true" />
            ) : (
              <Icons.Navigation size={18} aria-hidden="true" />
            )}
            <strong className={styles.label}>
              {status === 'locating'
                ? t('map.itinerary_locating')
                : status === 'routing'
                  ? t('map.itinerary_calculating')
                  : t('map.itinerary_label')}
            </strong>
          </button>

          <p className={styles.hint}>
            <Icons.Shield size={14} aria-hidden="true" />
            {t('map.itinerary_privacy')}
          </p>

          <a
            className={styles.directLink}
            href={googleMapsUrl(dest)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('map.itinerary_direct')}
            <ExternalIcon className={styles.ext} />
            <span className={styles.srOnly}>{tCommon('new_tab')}</span>
          </a>
        </>
      )}

      {/* ---------- Itinéraire prêt ---------- */}
      {status === 'ready' && route && (
        <div
          ref={cardRef}
          tabIndex={-1}
          className={styles.card}
          role="group"
          aria-label={t('map.itinerary_by_car')}
        >
          <div className={styles.cardHead}>
            <div className={styles.modeIcon}>
              <CarIcon size={18} />
            </div>
            <p className={styles.modeLabel}>{t('map.itinerary_by_car')}</p>
          </div>

          <p className={styles.stats}>
            <strong className={styles.duration}>{duration}</strong>
            <strong className={styles.distance}>{distance}</strong>
          </p>
          <p className={styles.note}>{t('map.itinerary_note')}</p>

          <div className={styles.actions}>
            <a
              className={`btn btn-cta ${styles.actionBtn} ${styles.fullRow}`}
              href={googleHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('map.itinerary_open_google')}
              <ExternalIcon className={styles.ext} />
              <span className={styles.srOnly}>{tCommon('new_tab')}</span>
            </a>
            <a
              className={`btn ${styles.actionBtn} ${styles.outline}`}
              href={wazeUrl(dest)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('map.itinerary_open_waze')}
              <ExternalIcon className={styles.ext} />
              <span className={styles.srOnly}>{tCommon('new_tab')}</span>
            </a>
            <button
              type="button"
              className={`btn ${styles.actionBtn} ${styles.ghost}`}
              onClick={clearDirections}
            >
              <Icons.X size={16} aria-hidden="true" />
              {t('map.itinerary_clear')}
            </button>
          </div>
        </div>
      )}

      {/* ---------- Erreur : toujours une issue ---------- */}
      {status === 'error' && error && (
        <div ref={errorRef} tabIndex={-1} className={styles.errorCard}>
          <div className={styles.errorHead}>
            <Icons.Alert size={20} aria-hidden="true" />
            <p className={styles.errorText}>{t(ERROR_KEYS[error])}</p>
          </div>
          <div className={styles.actions}>
            {RETRYABLE.includes(error) && (
              <button
                type="button"
                className={`btn ${styles.actionBtn} ${styles.outline}`}
                onClick={start}
              >
                {t('map.itinerary_retry')}
              </button>
            )}
            <a
              className={`btn btn-cta ${styles.actionBtn} ${
                RETRYABLE.includes(error) ? '' : styles.fullRow
              }`}
              href={googleHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('map.itinerary_open_google')}
              <ExternalIcon className={styles.ext} />
              <span className={styles.srOnly}>{tCommon('new_tab')}</span>
            </a>
            <button
              type="button"
              className={`btn ${styles.actionBtn} ${styles.ghost} ${styles.fullRow}`}
              onClick={clearDirections}
            >
              <Icons.X size={16} aria-hidden="true" />
              {t('map.itinerary_close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
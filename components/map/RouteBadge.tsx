// components/map/RouteBadge.tsx
//
// Résumé flottant en bas de la carte quand un itinéraire est tracé : durée,
// distance, accès Google Maps et fermeture. Utile surtout sur mobile, où la
// page défile jusqu'à la carte et le panneau d'actions n'est plus visible.
// Pas de <span> (règle globale `.placeholder span` de la section hôte).

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import { CarIcon, ExternalIcon } from './MapIcons';
import {
  IRIS_DESTINATION,
  clearDirections,
  formatDistance,
  formatDuration,
  googleMapsUrl,
  useDirections,
} from './directionsStore';
import styles from './RouteBadge.module.css';

export default function RouteBadge() {
  const t = useTranslations('AboutPage');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { status, route, origin } = useDirections();

  if (status !== 'ready' || !route) return null;

  return (
    <div className={styles.badge} role="group" aria-label={t('map.itinerary_by_car')}>
      <div className={styles.icon}>
        <CarIcon size={18} />
      </div>

      <p className={styles.summary}>
        <b className={styles.duration}>{formatDuration(route.duration, locale)}</b>
        <b className={styles.distance}>{formatDistance(route.distance, locale)}</b>
      </p>

      <a
        className={styles.action}
        href={googleMapsUrl(IRIS_DESTINATION, origin)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('map.itinerary_open_google')} ${tCommon('new_tab')}`}
      >
        <b className={styles.actionText}>Google Maps</b>
        <ExternalIcon className={styles.ext} />
      </a>

      <button
        type="button"
        className={styles.close}
        onClick={clearDirections}
        aria-label={t('map.itinerary_clear')}
      >
        <Icons.X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
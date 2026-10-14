// components/map/ItineraryButton.tsx
//
// Bouton "Itinéraire" : ouvre une petite fenêtre Google Maps avec l'itinéraire
// en temps réel vers la destination (ici la localisation d'IRIS JE sur la carte).
//
// Principe :
//   1. Au clic (gesture handler), on ouvre SYNCHRONEMENT une petite popup
//      (about:blank) — c'est la seule fenêtre qu'un bloqueur de popups
//      accepte, car ouverte dans le geste utilisateur.
//   2. On demande la position de l'utilisateur (geolocation du navigateur).
//   3. Une fois la position obtenue (ou refusée / timeout), on écrit l'URL
//      Google Maps Directions dans la popup déjà ouverte :
//        origin      = position de l'utilisateur (si accordée)
//        destination = coordonnées de la destination (prop)
//      Sans origine, Google Maps propose de partir de « Votre position »
//      ou de saisir un point de départ — l'itinéraire temps réel reste
//      calculable de toute façon.
//
// Si la popup est bloquée, on retombe sur un onglet classique à l'ouverture
// de l'URL (le geste utilisateur est déjà consommé, le bloqueur peut tout de
// même refuser — cas rare, message non bloquant).
//
// La carte Leaflet existante n'est PAS modifiée : ce bouton vit à côté
// (carte d'information), pas dedans.

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './ItineraryButton.module.css';

type ItineraryButtonProps = {
  /** Destination "lat,lng" (coordonnées affichées sur la carte) */
  destination: string;
  /** Classes CSS additionnelles (pour s'intégrer dans la page hôte) */
  className?: string;
};

/** Caractéristiques de la petite fenêtre popup (centrée). */
const POPUP_FEATURES = [
  'popup=yes',
  'width=1050',
  'height=720',
  'menubar=no',
  'toolbar=no',
  'location=no',
  'status=no',
  'resizable=yes',
  'scrollbars=yes',
].join(',');

export default function ItineraryButton({
  destination,
  className,
}: ItineraryButtonProps) {
  const t = useTranslations('AboutPage');
  const [locating, setLocating] = useState(false);

  const handleClick = () => {
    // 1. Ouvre la popup SYNCHRONEMENT dans le geste utilisateur (about:blank
    //    le temps que la géolocalisation réponde). Certains bloqueurs ne
    //    laisseraient pas window.open dans un callback async.
    const popup = window.open('about:blank', 'iris-itinerary', POPUP_FEATURES);
    if (popup) popup.opener = null; // Sécurité : pas de lien avec la page parente

    setLocating(true);

    const buildUrl = (origin?: string) => {
      const params = new URLSearchParams({
        api: '1',
        destination: destination,
        travelmode: 'driving',
      });
      if (origin) params.set('origin', origin);
      return `https://www.google.com/maps/dir/?${params.toString()}`;
    };

    const finish = (origin?: string) => {
      setLocating(false);
      const url = buildUrl(origin);

      if (popup && !popup.closed) {
        popup.location.href = url;
      } else {
        // Popup bloquée ou fermée entre-temps : onglet classique.
        window.open(url, '_blank', 'noopener');
      }
    };

    if (!('geolocation' in navigator)) {
      finish();
      return;
    }

    // Timeout court : au-delà, on ouvre sans origine plutôt que de laisser
    // l'utilisateur attendre (Google Maps lui proposera sa position).
    navigator.geolocation.getCurrentPosition(
      (pos) => finish(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => finish(),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
    );
  };

  return (
    <button
      type="button"
      className={`btn btn-cta ${className ?? ''} ${locating ? styles.locating : ''}`}
      onClick={handleClick}
      disabled={locating}
      aria-label={t('map.itinerary_aria')}
    >
      <Icons.Navigation size={18} aria-hidden="true" />
      <span>{locating ? t('map.itinerary_locating') : t('map.itinerary_label')}</span>
    </button>
  );
}

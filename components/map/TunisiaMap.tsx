// components/map/TunisiaMap.tsx
'use client';

// Carte de la Tunisie (Leaflet + GeoJSON) avec le marqueur de localisation
// d'IRIS Junior Entreprise. Chargé côté client uniquement (ssr: false via
// TunisiaMapLoader) : Leaflet a besoin de window.
//
// Comportement : la vue démarre centrée sur la zone d'IRIS (Sfax) ; après un
// zoom arrière sur le pays, un clic sur l'épingle recentre sur IRIS avec le
// même niveau de zoom que la vue initiale.
//
// Le tracé des gouvernorats vient de /public/geojson/tunisia.geojson (fetch au
// montage, 24 régions portant la propriété `gouv_fr`), les couleurs reprennent
// la charte IRIS :
//   contour --primary (#1a3969), remplissage --accent (#5ab8de),
//   survol --secondary (#ff6633).

import { useEffect, useState } from 'react';
import L from 'leaflet';
import { GeoJSON, MapContainer, Marker, Tooltip, useMap } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';
import styles from './TunisiaMap.module.css';

// Position d'IRIS Junior Entreprise — ENIS, Sfax
export const IRIS_POSITION: [number, number] = [34.72732618156304, 10.717072094398517];

const GEOJSON_URL = '/geojson/tunisia.geojson';

const REGION_STYLE = {
  color: '#1a3969', // var(--primary)
  weight: 1.5,
  fillColor: '#5ab8de', // var(--accent)
  fillOpacity: 0.65,
};

const REGION_HOVER_STYLE = {
  weight: 3,
  color: '#ff6633', // var(--secondary)
  fillColor: '#ff6633',
  fillOpacity: 0.75,
};

// Épingle SVG orange : la pointe (bas centre) tombe pile sur la coordonnée,
// pas de dépendance aux images PNG de Leaflet (chemins cassés avec les bundlers).
const IRIS_ICON = L.divIcon({
  className: styles.markerIcon,
  html: `<svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M14 1.5C7.096 1.5 1.5 7.096 1.5 14c0 9.75 12.5 22.5 12.5 22.5S26.5 23.75 26.5 14C26.5 7.096 20.904 1.5 14 1.5z" fill="#ff6633" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="14" cy="14" r="4.75" fill="#ffffff"/>
    </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34],
});

// Recadrage : la carte démarre directement sur la zone d'IRIS JE (Sfax),
// pas sur tout le pays. Un clic sur l'épingle recentre et zoomne dessus
// avec le même niveau de zoom que la vue initiale (utile après un zoom
// arrière manuel).
const INITIAL_ZOOM = 12; // vue « quartier » sur la zone d'implantation

// Marqueur IRIS : le clic reprend le focus sur la localisation.
function IrisMarker({ label }: { label: string }) {
  const map = useMap();

  return (
    <Marker
      position={IRIS_POSITION}
      icon={IRIS_ICON}
      eventHandlers={{
        click: () => {
          const reduceMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          if (reduceMotion) {
            map.setView(IRIS_POSITION, INITIAL_ZOOM);
          } else {
            map.flyTo(IRIS_POSITION, INITIAL_ZOOM, { duration: 1.1 });
          }
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -32]} opacity={1} className={styles.markerTooltip}>
        {label}
      </Tooltip>
    </Marker>
  );
}

type TunisiaMapProps = {
  /** Libellé du marqueur (« IRIS Junior Entreprise ») */
  markerLabel: string;
  /** Libellé de repli si une région du GeoJSON n'a pas de nom (gouv_fr) */
  countryLabel: string;
  /** Mention de la source cartographique */
  attribution: string;
  /** Message affiché si le GeoJSON ne peut pas être chargé */
  errorLabel: string;
};

export default function TunisiaMap({
  markerLabel,
  countryLabel,
  attribution,
  errorLabel,
}: TunisiaMapProps) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: FeatureCollection) => {
        if (!cancelled) setGeojson(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.map}>
        <MapContainer
          center={IRIS_POSITION}
          zoom={INITIAL_ZOOM}
          // Désactivé pour ne pas piéger le scroll de la page (zoom via +/− et glisser-déposer).
          scrollWheelZoom={false}
          zoomControl={true}
          // Classe globale = ancre des sélecteurs :global(...) du module CSS
          className={`leaflet-tunisia-map ${styles.leafletMap}`}
        >
          {geojson && (
            <GeoJSON
              data={geojson}
              style={REGION_STYLE}
              onEachFeature={(feature, layer) => {
                // Géométrie polygonale => L.Path (setStyle n'existe que
                // sur Path, pas sur Layer, d'où le typage explicite)
                const path = layer as L.Path;

                // Nom du gouvernorat porté par le GeoJSON (`gouv_fr`),
                // avec repli sur le nom du pays si la propriété manque.
                const name: string =
                  (feature as { properties?: { gouv_fr?: string } } | null)
                    ?.properties?.gouv_fr ?? countryLabel;

                // Survol : info-bulle suivant le curseur avec le nom de la région
                path.bindTooltip(name, {
                  sticky: true,
                  direction: 'top',
                  opacity: 0.95,
                });

                // Clic : encart persistant avec le nom de la région
                // (textContent = pas d'injection HTML depuis le GeoJSON)
                const label = document.createElement('span');
                label.textContent = name;
                path.bindPopup(label, {
                  closeButton: false,
                  className: styles.regionPopup,
                });

                path.on({
                  mouseover: () => path.setStyle(REGION_HOVER_STYLE),
                  mouseout: () => path.setStyle(REGION_STYLE),
                });
              }}
            />
          )}

          {/* Focus initial sur IRIS + recentrage/zoom au clic */}
          <IrisMarker label={markerLabel} />
        </MapContainer>

        {error && <p className={styles.error}>{errorLabel}</p>}
      </div>

      {/* Hors de la carte Leaflet, comme dans la maquette */}
      <div className={styles.copyright}>{attribution}</div>
    </div>
  );
}

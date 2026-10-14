// components/map/TunisiaMap.tsx
'use client';

// Carte de la Tunisie (Leaflet + GeoJSON) avec le marqueur de localisation
// d'IRIS Junior Entreprise. Chargé côté client uniquement (ssr: false via
// TunisiaMapLoader) : Leaflet a besoin de window.
//
// Comportement : la vue démarre cadrée sur la RÉGION de Sfax (le gouvernorat
// entier, calculé à partir du GeoJSON, donc adapté à la taille de l'écran) et
// non plus zoomée sur IRIS. Un clic sur l'épingle zoome de près sur IRIS.
// Quand un itinéraire est effacé, la vue revient sur la région de Sfax.
//
// Le tracé des gouvernorats vient de /public/geojson/tunisia.geojson (fetch au
// montage, 24 régions portant la propriété `gouv_fr`), les couleurs reprennent
// la charte IRIS :
//   contour --primary (#1a3969), remplissage --accent (#5ab8de),
//   survol --secondary (#ff6633).

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  GeoJSON,
  MapContainer,
  Marker,
  Pane,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { useTranslations } from 'next-intl';
import type { FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';
import RouteBadge from './RouteBadge';
import { IRIS_DESTINATION, useDirections } from './directionsStore';
import styles from './TunisiaMap.module.css';

// Position d'IRIS Junior Entreprise — ENIS, Sfax
export const IRIS_POSITION: [number, number] = [IRIS_DESTINATION.lat, IRIS_DESTINATION.lng];

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

// Mode itinéraire : les régions s'effacent pour laisser lire le fond de carte
// (rues) sur lequel le trajet est tracé ; contours conservés, très discrets.
const REGION_ROUTE_STYLE = {
  color: '#1a3969',
  weight: 1,
  opacity: 0.35,
  fillColor: '#5ab8de',
  fillOpacity: 0.04,
};

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Point bleu « vous êtes ici » avec halo pulsé (CSS)
const USER_ICON = L.divIcon({
  className: styles.userIcon,
  html: `<div class="${styles.userPulse}"></div><div class="${styles.userDot}"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

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

/* ------------------------------------------------------------------ */
/* Cadrage                                                              */
/* ------------------------------------------------------------------ */

// Vue de repli (avant le chargement du GeoJSON, ou si la région « Sfax » n'y
// est pas trouvée) : centre approximatif du gouvernorat de Sfax, zoom 9.
const SFAX_CENTER: [number, number] = [34.75, 10.55];
const SFAX_ZOOM = 9;

// Zoom appliqué au clic sur l'épingle : vue « quartier » sur IRIS.
const IRIS_FOCUS_ZOOM = 14;

// Marge (px) autour du gouvernorat lors du cadrage.
const REGION_PADDING: L.PointExpression = [16, 16];

// Compare sans accents ni casse : « Sfax », « SFAX », « Sfax » (NFD)…
const normalize = (value: unknown) =>
  typeof value === 'string'
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
    : '';

/** Cadre la carte sur la région de Sfax (ou sur la vue de repli). */
function showRegion(map: L.Map, bounds: L.LatLngBounds | null, animate: boolean) {
  if (bounds && bounds.isValid()) {
    map.fitBounds(bounds, { padding: REGION_PADDING, animate, duration: 1.1 });
  } else if (animate) {
    map.flyTo(SFAX_CENTER, SFAX_ZOOM, { duration: 1.1 });
  } else {
    map.setView(SFAX_CENTER, SFAX_ZOOM, { animate: false });
  }
}

// Cadrage initial : dès que le GeoJSON est chargé, la vue s'ajuste (sans
// animation) pour montrer tout le gouvernorat de Sfax, quelle que soit la
// taille de l'écran. Ne s'exécute qu'une fois.
function RegionView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  const { status } = useDirections();
  const done = useRef(false);

  useEffect(() => {
    if (!bounds || done.current) return;
    done.current = true;
    // Un itinéraire déjà affiché garde son propre cadrage.
    if (status === 'ready') return;
    showRegion(map, bounds, false);
  }, [map, bounds, status]);

  return null;
}

// Marqueur IRIS : le clic zoome de près sur la localisation.
function IrisMarker({ label }: { label: string }) {
  const map = useMap();

  return (
    <Marker
      position={IRIS_POSITION}
      icon={IRIS_ICON}
      eventHandlers={{
        click: () => {
          if (prefersReducedMotion()) {
            map.setView(IRIS_POSITION, IRIS_FOCUS_ZOOM, { animate: false });
          } else {
            map.flyTo(IRIS_POSITION, IRIS_FOCUS_ZOOM, { duration: 1.1 });
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

// Itinéraire : fond de carte, tracé animé, point de départ et cadrage auto.
// Au retour (itinéraire effacé), la vue revient sur la région de Sfax.
function RouteLayer({
  youAreHere,
  regionBounds,
}: {
  youAreHere: string;
  regionBounds: L.LatLngBounds | null;
}) {
  const map = useMap();
  const { status, route, origin } = useDirections();
  const hadRoute = useRef(false);
  const ready = status === 'ready' && !!route;

  useEffect(() => {
    if (ready && route) {
      hadRoute.current = true;
      map.fitBounds(L.latLngBounds(route.path), {
        paddingTopLeft: [56, 56],
        paddingBottomRight: [56, 100], // place pour la pastille du bas
        maxZoom: 15,
        animate: !prefersReducedMotion(),
        duration: 1.2,
      });
    } else if (hadRoute.current) {
      hadRoute.current = false;
      showRegion(map, regionBounds, !prefersReducedMotion());
    }
  }, [map, ready, route, regionBounds]);

  if (!ready || !route || !origin) return null;

  return (
    <>
      <TileLayer url={TILE_URL} maxZoom={19} className={styles.tiles} />

      <Pane name="route" style={{ zIndex: 450 }}>
        {/* Liseré blanc puis trait principal : lisible sur tout fond */}
        <Polyline
          positions={route.path}
          interactive={false}
          pathOptions={{ color: '#ffffff', weight: 10, opacity: 0.95, className: styles.routeLine }}
        />
        <Polyline
          positions={route.path}
          interactive={false}
          pathOptions={{ color: '#1a3969', weight: 5, opacity: 1, className: styles.routeLine }}
        />
      </Pane>

      <Marker
        position={[origin.lat, origin.lng]}
        icon={USER_ICON}
        interactive={false}
        keyboard={false}
      >
        <Tooltip permanent direction="top" offset={[0, -12]} opacity={1} className={styles.markerTooltip}>
          {youAreHere}
        </Tooltip>
      </Marker>
    </>
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
  const t = useTranslations('AboutPage');
  const { status } = useDirections();
  const routeMode = status === 'ready';

  const containerRef = useRef<HTMLDivElement>(null);
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState(false);

  // Emprise du gouvernorat de Sfax, déduite du GeoJSON (propriété `gouv_fr`).
  const sfaxBounds = useMemo<L.LatLngBounds | null>(() => {
    if (!geojson) return null;
    const feature = geojson.features.find(
      (f) => normalize((f.properties as { gouv_fr?: string } | null)?.gouv_fr) === 'sfax',
    );
    if (!feature) return null;
    const bounds = L.geoJSON(feature).getBounds();
    return bounds.isValid() ? bounds : null;
  }, [geojson]);

  // Itinéraire prêt : si la carte n'est pas entièrement visible (mobile : le
  // bouton est au-dessus), on la fait défiler doucement dans la vue.
  useEffect(() => {
    if (!routeMode) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  }, [routeMode]);

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
    <div ref={containerRef} className={styles.container}>
      <div className={`${styles.map} ${routeMode ? styles.routeMode : ''}`}>
        <MapContainer
          center={SFAX_CENTER}
          zoom={SFAX_ZOOM}
          // Désactivé pour ne pas piéger le scroll de la page (zoom via +/− et glisser-déposer).
          scrollWheelZoom={false}
          zoomControl={true}
          // Classe globale = ancre des sélecteurs :global(...) du module CSS
          className={`leaflet-tunisia-map ${styles.leafletMap}`}
        >
          {geojson && (
            <GeoJSON
              data={geojson}
              style={routeMode ? REGION_ROUTE_STYLE : REGION_STYLE}
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

          {/* Cadrage initial sur la région de Sfax (dès que le GeoJSON est prêt) */}
          <RegionView bounds={sfaxBounds} />

          {/* Itinéraire (fond de carte + tracé + départ), si calculé */}
          <RouteLayer youAreHere={t('map.you_are_here')} regionBounds={sfaxBounds} />

          {/* Épingle IRIS + zoom rapproché au clic */}
          <IrisMarker label={markerLabel} />
        </MapContainer>

        {/* Résumé flottant de l'itinéraire (durée, distance, Google Maps) */}
        <RouteBadge />

        {error && <p className={styles.error}>{errorLabel}</p>}
      </div>

      {/* Hors de la carte Leaflet, comme dans la maquette */}
      <div className={styles.copyright}>{attribution}</div>
    </div>
  );
}
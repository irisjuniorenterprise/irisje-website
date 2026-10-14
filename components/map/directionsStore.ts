// components/map/directionsStore.ts
//
// Petit store partagé (sans Provider) pour l'itinéraire « Nous trouver » :
//   - ItineraryButton (panneau d'actions, colonne de gauche)
//   - TunisiaMap (tracé + marqueur de départ, colonne de droite)
//   - RouteBadge (résumé flottant sur la carte)
// Ces composants vivent dans des colonnes différentes d'une page serveur ;
// un store externe (useSyncExternalStore) évite de modifier la page.
//
// Flux : géolocalisation du navigateur -> calcul de l'itinéraire routier
// (OSRM) -> tracé dans la page. En cas d'échec, l'utilisateur garde toujours
// une issue : ouvrir Google Maps dans un nouvel onglet (lien classique, qui
// ouvre l'application sur mobile).

import { useSyncExternalStore } from 'react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type LatLng = { lat: number; lng: number };

/** Destination par défaut : IRIS Junior Entreprise — ENIS, Sfax. */
export const IRIS_DESTINATION: LatLng = {
  lat: 34.72732618156304,
  lng: 10.717072094398517,
};

export type DirectionsStatus = 'idle' | 'locating' | 'routing' | 'ready' | 'error';

export type DirectionsError =
  | 'unsupported' // pas de géolocalisation (navigateur / http)
  | 'denied' // permission refusée
  | 'unavailable' // position introuvable
  | 'timeout' // délai dépassé
  | 'noroute' // aucun itinéraire routier (trop loin, mer…)
  | 'network'; // service d'itinéraire injoignable

export type RouteData = {
  /** Tracé [lat, lng] (format Leaflet) */
  path: [number, number][];
  /** Distance en mètres */
  distance: number;
  /** Durée en secondes (hors trafic) */
  duration: number;
};

export type DirectionsState = {
  status: DirectionsStatus;
  error: DirectionsError | null;
  origin: LatLng | null;
  route: RouteData | null;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

const INITIAL_STATE: DirectionsState = {
  status: 'idle',
  error: null,
  origin: null,
  route: null,
};

let state: DirectionsState = INITIAL_STATE;
const listeners = new Set<() => void>();

function setState(next: DirectionsState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => INITIAL_STATE;

export function useDirections(): DirectionsState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------------------------------------------ */
/* Géolocalisation + calcul de l'itinéraire                             */
/* ------------------------------------------------------------------ */

/** Au-delà, aucun trajet routier réaliste : on évite l'appel réseau. */
const MAX_ROUTE_KM = 2500;
const ROUTING_TIMEOUT_MS = 12000;

const KNOWN_ERRORS: DirectionsError[] = [
  'unsupported',
  'denied',
  'unavailable',
  'timeout',
  'noroute',
  'network',
];

const toError = (value: unknown): DirectionsError =>
  typeof value === 'string' && (KNOWN_ERRORS as string[]).includes(value)
    ? (value as DirectionsError)
    : 'network';

function getPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err.code === 1 ? 'denied' : err.code === 3 ? 'timeout' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

function haversineKm(a: LatLng, b: LatLng): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

type OsrmResponse = {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
  }>;
};

async function fetchRoute(origin: LatLng, destination: LatLng, signal: AbortSignal): Promise<RouteData> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=geojson&alternatives=false&steps=false`;

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), ROUTING_TIMEOUT_MS);
  const onAbort = () => timeoutController.abort();
  signal.addEventListener('abort', onAbort);

  try {
    const res = await fetch(url, { signal: timeoutController.signal });
    if (!res.ok) throw 'network';
    const data = (await res.json()) as OsrmResponse;
    const best = data.routes?.[0];
    if (data.code !== 'Ok' || !best) throw 'noroute';
    return {
      path: best.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      distance: best.distance,
      duration: best.duration,
    };
  } catch (error) {
    throw toError(error);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

let runId = 0;
let controller: AbortController | null = null;

/** Localise l'utilisateur puis trace l'itinéraire vers `destination`. */
export async function requestDirections(destination: LatLng): Promise<void> {
  const id = ++runId;
  controller?.abort();
  controller = null;

  setState({ status: 'locating', error: null, origin: null, route: null });

  try {
    const origin = await getPosition();
    if (id !== runId) return;

    if (haversineKm(origin, destination) > MAX_ROUTE_KM) {
      setState({ status: 'error', error: 'noroute', origin, route: null });
      return;
    }

    setState({ status: 'routing', error: null, origin, route: null });
    controller = new AbortController();
    const route = await fetchRoute(origin, destination, controller.signal);
    if (id !== runId) return;

    setState({ status: 'ready', error: null, origin, route });
  } catch (error) {
    if (id !== runId) return;
    setState({ ...state, status: 'error', error: toError(error), route: null });
  }
}

/** Efface l'itinéraire et annule tout calcul en cours. */
export function clearDirections(): void {
  runId++;
  controller?.abort();
  controller = null;
  if (state !== INITIAL_STATE) setState(INITIAL_STATE);
}

/* ------------------------------------------------------------------ */
/* Helpers (liens externes, formats)                                    */
/* ------------------------------------------------------------------ */

/** Lit une destination « lat,lng ». */
export function parseLatLng(value: string): LatLng | null {
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length !== 2 || parts.some((part) => part === '')) return null;
  const [lat, lng] = parts.map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** Lien Google Maps (nouvel onglet ; ouvre l'application sur mobile). */
export function googleMapsUrl(destination: LatLng, origin?: LatLng | null): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  });
  if (origin) params.set('origin', `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Lien Waze (navigation vers la destination). */
export function wazeUrl(destination: LatLng): string {
  return `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
}

// Chiffres latins pour toutes les langues (cohérent avec le reste du site).
const numberLocale = (locale: string) => `${locale}-u-nu-latn`;

function formatUnit(value: number, unit: string, locale: string, maxFraction = 0): string {
  try {
    return new Intl.NumberFormat(numberLocale(locale), {
      style: 'unit',
      unit,
      unitDisplay: 'short',
      maximumFractionDigits: maxFraction,
    }).format(value);
  } catch {
    return `${value} ${unit}`;
  }
}

export function formatDistance(meters: number, locale: string): string {
  if (meters < 1000) return formatUnit(Math.max(10, Math.round(meters / 10) * 10), 'meter', locale);
  const km = meters / 1000;
  return formatUnit(km, 'kilometer', locale, km < 10 ? 1 : 0);
}

export function formatDuration(seconds: number, locale: string): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return formatUnit(minutes, 'minute', locale);
  return minutes === 0
    ? formatUnit(hours, 'hour', locale)
    : `${formatUnit(hours, 'hour', locale)} ${formatUnit(minutes, 'minute', locale)}`;
}
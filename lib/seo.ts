// lib/seo.ts
//
// Source unique du SEO du site : origines (domaines) de production, identité
// de l'organisation, registre des pages (namespace de traduction, type
// schema.org, priorité du sitemap) et helpers d'URL / hreflang.
//
// Module pur (aucun import serveur) : utilisable à la fois par les routes
// serveur (metadata, sitemap, robots, proxy) et par les composants client
// (données structurées JSON-LD).
//
// ➜ Pour AJOUTER une page au site : ajoutez-la dans ROUTES ci-dessous.
//   Elle obtient alors automatiquement titre, description, canonical,
//   hreflang, Open Graph, entrée de sitemap et données structurées.
//
// ─── Plusieurs domaines (.com + .tn) ────────────────────────────────────
// Le site est servi par deux domaines. Chacun est SON PROPRE canonical
// (sinon Google fusionne les deux et n'affiche que l'un d'eux), et les deux
// se déclarent mutuellement en hreflang :
//   - domaine principal (.com) : fr, en, ar          → audience internationale
//   - domaine .tn              : fr-TN, en-TN, ar-TN → audience tunisienne
//   - x-default                : toujours le principal
// Google affiche alors la bonne version selon le pays de la recherche, et
// chaque domaine peut obtenir ses propres liens de site (sitelinks).
import { locales, defaultLocale, type Locale } from '@/i18n/config';

/* ------------------------------------------------------------------ */
/* Origines du site                                                    */
/* ------------------------------------------------------------------ */

const DEFAULT_PRIMARY_ORIGIN = 'https://www.iris-junior-entreprise.com';
const DEFAULT_ALTERNATE_ORIGINS = ['https://www.iris-junior-entreprise.tn'];

/** « https://www.exemple.com/chemin/ » → « https://www.exemple.com » ('' si invalide). */
const toOrigin = (value: string): string => {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return '';
  }
};

/**
 * Origine PRINCIPALE (canonique par défaut, x-default, repli pour un hôte
 * inconnu), sans slash final. Variable : NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL: string =
  toOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? '') || DEFAULT_PRIMARY_ORIGIN;

/**
 * Autres domaines de production servant le même site (séparés par des
 * virgules). Variable : NEXT_PUBLIC_ALTERNATE_SITE_URLS — laisser vide pour
 * n'avoir qu'un seul domaine.
 */
const alternateEnv = process.env.NEXT_PUBLIC_ALTERNATE_SITE_URLS;
const alternateOrigins = (
  alternateEnv === undefined ? DEFAULT_ALTERNATE_ORIGINS : alternateEnv.split(',')
)
  .map(toOrigin)
  .filter(Boolean);

/** Tous les domaines de production (le principal en premier). */
export const SITE_ORIGINS: string[] = Array.from(new Set([SITE_URL, ...alternateOrigins]));

export const SITE_NAME = 'IRIS Junior Entreprise';

/** Image Open Graph / Twitter par défaut (1200 × 630, dans /public). */
export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

/** Locale Open Graph de chaque langue. */
export const OG_LOCALES: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  ar: 'ar_AR',
};

/** Coordonnées publiques (identiques à celles des mentions légales). */
export const ORGANIZATION = {
  email: 'iris.juniorentreprise@gmail.com',
  telephone: '+21696822343',
  foundingDate: '2014',
  alternateName: ['IRIS JE', 'IRIS Junior Creation'],
  address: {
    streetAddress: 'ENIS, Route Soukra Km 3.5',
    postalCode: '3038',
    addressLocality: 'Sfax',
    addressCountry: 'TN',
  },
  /** Position de l'ENIS (identique à celle de la carte du site). */
  geo: { latitude: 34.7273, longitude: 10.7171 },
  knowsAbout: [
    'Web development',
    'Mobile development',
    'Chatbots',
    'Branding',
    'Community management',
    'Market research',
    'Business plans',
  ],
  /** Profils officiels (identiques à ceux du footer). */
  sameAs: [
    'https://tn.linkedin.com/company/iris-junior-creation',
    'https://www.facebook.com/IRIS.Junior',
    'https://www.instagram.com/iris.junior.creation/',
    'https://github.com/irisjuniorenterprise',
    'https://www.tiktok.com/@iris.junior.entreprise',
  ],
};

/* ------------------------------------------------------------------ */
/* Hôtes / origines                                                    */
/* ------------------------------------------------------------------ */

const hostnameOf = (origin: string): string => new URL(origin).hostname.toLowerCase();

/** Nettoie un en-tête Host / X-Forwarded-Host : minuscules, sans port, premier élément. */
export const normalizeHost = (host?: string | null): string =>
  (host ?? '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');

/** Origine de production correspondant exactement à cet hôte (undefined sinon : preview, localhost…). */
export const findOrigin = (host?: string | null): string | undefined => {
  const hostname = normalizeHost(host);
  return SITE_ORIGINS.find((origin) => hostnameOf(origin) === hostname);
};

/**
 * Hôte canonique vers lequel rediriger : l'hôte lui-même s'il est connu, ou
 * la variante avec / sans « www. » d'un domaine connu (apex ↔ www).
 * undefined → hôte inconnu (aucune redirection).
 */
export const canonicalHostFor = (host?: string | null): string | undefined => {
  const hostname = normalizeHost(host);
  if (!hostname) return undefined;
  for (const origin of SITE_ORIGINS) {
    const canonical = hostnameOf(origin);
    const bare = canonical.replace(/^www\./, '');
    if (hostname === canonical || hostname === bare || hostname === `www.${bare}`) {
      return canonical;
    }
  }
  return undefined;
};

/* ------------------------------------------------------------------ */
/* Registre des pages                                                  */
/* ------------------------------------------------------------------ */

export type SchemaPageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'FAQPage';

export type SeoRoute = {
  /** Chemin sans locale ('/' pour l'accueil). */
  path: string;
  /** Namespace des messages contenant `meta.title|description|keywords`. */
  namespace: string;
  /** Type schema.org de la page. */
  schema: SchemaPageType;
  /** Priorité relative dans le sitemap (0–1). */
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /**
   * Date de dernière modification réelle (ISO), à renseigner uniquement
   * quand le contenu change vraiment — sinon laissée vide : un lastmod
   * inexact est ignoré par Google.
   */
  lastModified?: string;
};

export const ROUTES: SeoRoute[] = [
  { path: '/', namespace: 'HomePage', schema: 'WebPage', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/services', namespace: 'ServicesPage', schema: 'WebPage', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/a-propos', namespace: 'AboutPage', schema: 'AboutPage', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/devis', namespace: 'DevisPage', schema: 'WebPage', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', namespace: 'ContactPage', schema: 'ContactPage', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/recrutement', namespace: 'RecruitmentPage', schema: 'WebPage', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/faq', namespace: 'FAQPage', schema: 'FAQPage', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/mentions-legales', namespace: 'MentionsLegalesPage', schema: 'WebPage', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/politique-confidentialite', namespace: 'PolitiqueConfidentialitePage', schema: 'WebPage', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cgu', namespace: 'CGUPage', schema: 'WebPage', priority: 0.3, changeFrequency: 'yearly' },
];

/* ------------------------------------------------------------------ */
/* Helpers d'URL                                                       */
/* ------------------------------------------------------------------ */

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Normalise un chemin : '' → '/', pas de slash final. */
export const normalizePath = (path: string): string => {
  const clean = '/' + path.split('?')[0].split('#')[0].split('/').filter(Boolean).join('/');
  return clean === '' ? '/' : clean;
};

export const getRoute = (path: string): SeoRoute | undefined => {
  const normalized = normalizePath(path);
  return ROUTES.find((route) => route.path === normalized);
};

/**
 * URL absolue d'une page dans une langue :
 * https://site/fr, https://site/fr/services. L'origine est celle du domaine
 * servi (par défaut, le domaine principal).
 */
export const absoluteUrl = (
  locale: string,
  path: string = '/',
  origin: string = SITE_URL,
): string => {
  const normalized = normalizePath(path);
  return `${origin}/${locale}${normalized === '/' ? '' : normalized}`;
};

/** Région hreflang des domaines nationaux : le .tn cible la Tunisie. */
const REGION_BY_TLD: Record<string, string> = { tn: 'TN' };

/** Code hreflang d'une langue sur un domaine : « fr » (principal) ou « fr-TN » (domaine .tn). */
export const hreflangCode = (locale: string, origin: string): string => {
  if (SITE_ORIGINS.length < 2) return locale;
  const tld = hostnameOf(origin).split('.').pop() ?? '';
  const region = REGION_BY_TLD[tld];
  return region ? `${locale}-${region}` : locale;
};

/**
 * Alternates hreflang d'une page : toutes les langues de TOUS les domaines
 * (auto-référence incluse, exigée par Google) + x-default (principal).
 * Identique quel que soit le domaine servi : les annotations sont réciproques.
 */
export const languageAlternates = (path: string): Record<string, string> => {
  const entries: [string, string][] = [];
  for (const origin of SITE_ORIGINS) {
    for (const locale of locales) {
      entries.push([hreflangCode(locale, origin), absoluteUrl(locale, path, origin)]);
    }
  }
  entries.push(['x-default', absoluteUrl(defaultLocale, path, SITE_URL)]);
  return Object.fromEntries(entries);
};
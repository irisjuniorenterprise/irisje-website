// lib/seo.ts
//
// Source unique du SEO du site : URL canonique, identité de l'organisation,
// registre des pages (namespace de traduction, type schema.org, priorité du
// sitemap) et helpers d'URL / hreflang.
//
// Module pur (aucun import serveur) : utilisable à la fois par les routes
// serveur (metadata, sitemap, robots) et par les composants client
// (données structurées JSON-LD).
//
// ➜ Pour AJOUTER une page au site : ajoutez-la dans ROUTES ci-dessous.
//   Elle obtient alors automatiquement titre, description, canonical,
//   hreflang, Open Graph, entrée de sitemap et données structurées.
import { locales, defaultLocale, type Locale } from '@/i18n/config';

/* ------------------------------------------------------------------ */
/* Identité du site                                                    */
/* ------------------------------------------------------------------ */

/**
 * URL canonique de production, sans slash final.
 * ⚠️ Définissez NEXT_PUBLIC_SITE_URL sur Vercel (ex. https://irisje.com) :
 * c'est elle qui fait foi pour les canonicals, hreflang, sitemap et JSON-LD,
 * quel que soit le domaine par lequel la page est servie (preview,
 * *.vercel.app, www…) — évite le contenu dupliqué entre domaines.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://irisje.com').replace(
  /\/+$/,
  '',
);

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
  address: {
    streetAddress: 'ENIS, Route Soukra Km 3.5',
    postalCode: '3038',
    addressLocality: 'Sfax',
    addressCountry: 'TN',
  },
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
/* Helpers                                                             */
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

/** URL absolue d'une page dans une langue : https://site/fr, https://site/fr/services */
export const absoluteUrl = (locale: string, path: string = '/'): string => {
  const normalized = normalizePath(path);
  return `${SITE_URL}/${locale}${normalized === '/' ? '' : normalized}`;
};

/** Alternates hreflang d'une page (toutes les langues + x-default). */
export const languageAlternates = (path: string): Record<string, string> => ({
  ...Object.fromEntries(locales.map((locale) => [locale, absoluteUrl(locale, path)])),
  'x-default': absoluteUrl(defaultLocale, path),
});
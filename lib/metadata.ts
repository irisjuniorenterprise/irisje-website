// lib/metadata.ts
//
// Construit les métadonnées SEO complètes d'une page : titre, description,
// canonical, hreflang (+ x-default, multi-domaines), robots, Open Graph et
// Twitter.
//
//  - le canonical est celui du domaine réellement servi (.com ou .tn) : chaque
//    domaine est auto-canonique et les deux se déclarent en hreflang
//    (voir lib/seo.ts) ; l'hôte est validé par liste blanche ;
//  - un hôte hors production (preview, *.vercel.app) est servi en noindex ;
//  - titre, description et mots-clés sont lus dans le namespace propre à la
//    page (registre ROUTES de lib/seo.ts) ;
//  - title en `absolute` : le gabarit du layout n'ajoute pas le nom du site
//    une seconde fois (les titres le contiennent déjà).
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { defaultLocale, locales } from '@/i18n/config';
import { getRequestSite } from '@/lib/request-site';
import {
  OG_IMAGE,
  OG_LOCALES,
  ORGANIZATION,
  SITE_NAME,
  absoluteUrl,
  getRoute,
  isLocale,
  languageAlternates,
} from '@/lib/seo';

type MetaOptions = {
  locale: string;
  /** Chemin sans locale : '/', '/services'… (doit exister dans ROUTES). */
  path: string;
  /**
   * @deprecated title / description / keywords : pour les pages déclarées
   * dans ROUTES (lib/seo.ts), ils sont ignorés et relus dans le bon
   * namespace. Ils ne servent plus que de repli pour une page non déclarée.
   */
  title?: string;
  description?: string;
  keywords?: string;
  /** Image sociale (chemin /public ou URL absolue). */
  image?: string;
  type?: 'website' | 'article';
  /** true pour exclure la page des moteurs de recherche. */
  noindex?: boolean;
};

// Codes de vérification des propriétaires (Search Console / Bing), optionnels.
const verification = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
    : {}),
};

export async function buildMetadata({
  locale: rawLocale,
  path,
  title: fallbackTitle = SITE_NAME,
  description: fallbackDescription = '',
  keywords: fallbackKeywords = '',
  image = OG_IMAGE.url,
  type = 'website',
  noindex = false,
}: MetaOptions): Promise<Metadata> {
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const { origin, indexable } = await getRequestSite();
  const hidden = noindex || !indexable;

  let title = fallbackTitle;
  let description = fallbackDescription;
  let keywords = fallbackKeywords;

  const route = getRoute(path);
  if (route) {
    const t = (await getTranslations({
      locale,
      namespace: route.namespace as never,
    })) as unknown as { (key: string): string; has: (key: string) => boolean };

    title = t.has('meta.title') ? t('meta.title') : title;
    description = t.has('meta.description') ? t('meta.description') : description;
    keywords = t.has('meta.keywords') ? t('meta.keywords') : keywords;
  }

  const url = absoluteUrl(locale, path, origin);

  return {
    metadataBase: new URL(origin),
    title: { absolute: title },
    description,
    keywords: keywords || undefined,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: origin }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'business',
    formatDetection: { telephone: false, email: false, address: false },
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: hidden
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: OG_LOCALES[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [
        {
          url: image,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@IRIS_JE',
      creator: '@IRIS_JE',
    },
    other: {
      // Signaux géographiques (secondaires, mais cohérents avec le JSON-LD)
      'geo.region': 'TN-61',
      'geo.placename': ORGANIZATION.address.addressLocality,
      'geo.position': `${ORGANIZATION.geo.latitude};${ORGANIZATION.geo.longitude}`,
      ICBM: `${ORGANIZATION.geo.latitude}, ${ORGANIZATION.geo.longitude}`,
    },
  };
}
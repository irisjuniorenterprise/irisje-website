// lib/metadata.ts
//
// Construit les métadonnées SEO complètes d'une page : titre, description,
// canonical, hreflang (+ x-default), robots, Open Graph et Twitter.
//
// Corrections par rapport à la version précédente :
//  - plus d'appel à headers() : l'URL canonique vient de SITE_URL (lib/seo.ts)
//    et non du Host de la requête → canonical identique sur tous les
//    domaines (preview, *.vercel.app…) et pages enfin mises en cache
//    (rendu statique) au lieu d'être dynamiques à chaque visite ;
//  - titre, description et mots-clés sont lus dans le namespace propre à la
//    page (registre ROUTES de lib/seo.ts) : toutes les pages passaient
//    jusqu'ici ceux de « HomePage », donc partageaient le même titre ;
//  - title en `absolute` : le gabarit du layout n'ajoute plus le nom du
//    site une seconde fois (les titres le contiennent déjà) ;
//  - hreflang avec x-default, locale Open Graph valide, image 1200 × 630.
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { defaultLocale, locales } from '@/i18n/config';
import {
  OG_IMAGE,
  OG_LOCALES,
  SITE_NAME,
  SITE_URL,
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

  const url = absoluteUrl(locale, path);

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    keywords: keywords || undefined,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: noindex
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
  };
}
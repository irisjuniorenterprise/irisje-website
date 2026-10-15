// app/sitemap.ts
//
// Sitemap généré depuis le registre ROUTES (lib/seo.ts) : une entrée par page
// et par langue, chacune déclarant ses versions alternates (hreflang + x-default)
// pour que Google associe correctement fr / en / ar sur les deux domaines.
//
// Le sitemap est propre au domaine servi : /sitemap.xml sur le .com liste des
// URLs en .com, sur le .tn des URLs en .tn (un sitemap ne doit lister que les
// URLs de son propre hôte). Hôte hors production → sitemap vide.
//
// lastModified n'est renseigné que si la page le précise dans ROUTES : une date
// « aujourd'hui » à chaque build est un signal faux que Google finit par ignorer.
import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getRequestSite } from '@/lib/request-site';
import { OG_IMAGE, ROUTES, absoluteUrl, languageAlternates } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { origin, indexable } = await getRequestSite();
  if (!indexable) return [];

  return ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteUrl(locale, route.path, origin),
      ...(route.lastModified ? { lastModified: route.lastModified } : {}),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
      ...(route.path === '/' ? { images: [`${origin}${OG_IMAGE.url}`] } : {}),
    })),
  );
}
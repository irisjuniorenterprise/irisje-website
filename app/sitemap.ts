// app/sitemap.ts
//
// Sitemap généré depuis le registre ROUTES (lib/seo.ts) : une entrée par page
// et par langue, chacune déclarant ses versions alternates (hreflang + x-default)
// pour que Google associe correctement fr / en / ar.
//
// lastModified n'est renseigné que si la page le précise dans ROUTES : une date
// « aujourd'hui » à chaque build est un signal faux que Google finit par ignorer.
import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { ROUTES, absoluteUrl, languageAlternates } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteUrl(locale, route.path),
      ...(route.lastModified ? { lastModified: route.lastModified } : {}),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
    })),
  );
}
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  // ⚠️ `locale` reflète le segment dynamique de l'URL, pas forcément une
  // langue du site. proxy.ts réécrit les URL inconnues vers /_not-found, un
  // chemin que la route [locale] capte : params.locale vaut alors littéralement
  // « _not-found » et la page s'exécute (en parallèle du notFound() du layout,
  // qui finit par gagner le rendu). Sans cette garde, on importerait
  // ../messages/_not-found.json → MODULE_NOT_FOUND et le 404 planterait.
  // Même critère que lib/metadata.ts (isLocale) et app/[locale]/layout.tsx.
  const resolvedLocale =
    locale && (locales as readonly string[]).includes(locale)
      ? locale
      : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});

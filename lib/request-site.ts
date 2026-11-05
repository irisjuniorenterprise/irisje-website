// lib/request-site.ts
//
// Origine du site pour canonical, Open Graph, sitemap et JSON-LD.
//
// Le site est servi par UN SEUL domaine indexable (SITE_URL, voir lib/seo.ts) :
// les autres domaines redirigent en 308 (proxy.ts). L'origine ne dépend donc
// plus de l'en-tête Host, ce qui permet le RENDU STATIQUE des pages (avant,
// la lecture de headers() rendait chaque page dynamique : pas de cache CDN,
// TTFB plus long).
//
// Hôtes hors production (preview *.vercel.app, localhost) : ils ne sont pas
// détectés ici mais dans proxy.ts, qui ajoute l'en-tête
// `X-Robots-Tag: noindex, nofollow` à chacune de leurs réponses.
import { SITE_URL } from '@/lib/seo';

export type RequestSite = {
  /** Origine à utiliser pour canonical, Open Graph, sitemap, JSON-LD. */
  origin: string;
  /** Toujours true : le noindex des hôtes de preview est posé par le proxy. */
  indexable: boolean;
};

export async function getRequestSite(): Promise<RequestSite> {
  return { origin: SITE_URL, indexable: true };
}

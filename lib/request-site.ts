// lib/request-site.ts
//
// Domaine réellement servi pour la requête en cours (serveur uniquement).
// L'en-tête Host n'est jamais recopié tel quel : il est comparé à la liste
// blanche des domaines de production (lib/seo.ts). Un hôte inconnu
// (*.vercel.app, preview, localhost…) retombe sur le domaine principal et est
// marqué non indexable — impossible d'injecter un faux canonical via Host.
import { headers } from 'next/headers';
import { SITE_URL, findOrigin } from '@/lib/seo';

export type RequestSite = {
  /** Origine à utiliser pour canonical, Open Graph, sitemap, JSON-LD. */
  origin: string;
  /** false pour un hôte hors production (à exclure des moteurs de recherche). */
  indexable: boolean;
};

export async function getRequestSite(): Promise<RequestSite> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const known = findOrigin(host);
  return { origin: known ?? SITE_URL, indexable: known !== undefined };
}
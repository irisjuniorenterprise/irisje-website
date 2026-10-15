// app/robots.ts
//
// ⚠️ On ne bloque PLUS /_next/ : Google a besoin des fichiers CSS/JS qui s'y
// trouvent pour afficher la page comme un visiteur et l'évaluer (rendu mobile,
// Core Web Vitals). Bloquer ce dossier dégrade l'indexation.
// Les pages 404 sont déjà exclues automatiquement (statut 404 + noindex).
//
// Le fichier est propre au domaine servi (sitemap de CE domaine). Un hôte hors
// production (preview, *.vercel.app) est entièrement interdit aux robots.
import type { MetadataRoute } from 'next';
import { getRequestSite } from '@/lib/request-site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { origin, indexable } = await getRequestSite();

  if (!indexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
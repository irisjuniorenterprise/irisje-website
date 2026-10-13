// app/robots.ts
//
// ⚠️ On ne bloque PLUS /_next/ : Google a besoin des fichiers CSS/JS qui s'y
// trouvent pour afficher la page comme un visiteur et l'évaluer (rendu mobile,
// Core Web Vitals). Bloquer ce dossier dégrade l'indexation.
// Les pages 404 sont déjà exclues automatiquement (statut 404 + noindex).
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
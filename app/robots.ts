// app/robots.ts
//
// ⚠️ On ne bloque PLUS /_next/ : Google a besoin des fichiers CSS/JS qui s'y
// trouvent pour afficher la page comme un visiteur et l'évaluer (rendu mobile,
// Core Web Vitals). Bloquer ce dossier dégrade l'indexation.
//
// Robots IA (GEO / AEO) : les robots des assistants et moteurs de réponse sont
// listés explicitement. Être cité par ChatGPT, Perplexity, Gemini ou Claude
// suppose qu'ils puissent lire le site. Deux familles :
//   - robots de RECHERCHE / de requête utilisateur : ils récupèrent la page
//     au moment où quelqu'un pose une question → nécessaires pour être cité ;
//   - robots d'ENTRAÎNEMENT : ils alimentent les futurs modèles. Autorisés par
//     défaut (visibilité de marque à long terme) ; pour les refuser, passer
//     ALLOW_AI_TRAINING_CRAWLERS=false dans l'environnement.
//
// Les hôtes hors production (preview, *.vercel.app) sont exclus de l'index par
// l'en-tête `X-Robots-Tag: noindex` posé dans proxy.ts (robots.txt est servi
// statiquement et ne connaît pas l'hôte).
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** Robots qui lisent une page pour répondre à une question en direct. */
const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot', // ChatGPT Search
  'ChatGPT-User', // ChatGPT : page ouverte à la demande d'un utilisateur
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'Claude-SearchBot', // Claude (recherche)
  'Claude-User', // Claude : page ouverte à la demande d'un utilisateur
  'Applebot', // Apple (Siri, Spotlight)
  'DuckAssistBot', // DuckDuckGo
];

/** Robots d'entraînement des modèles. */
const AI_TRAINING_CRAWLERS = [
  'GPTBot', // OpenAI
  'ClaudeBot', // Anthropic
  'Google-Extended', // Gemini (entraînement ; sans effet sur Google Search)
  'Applebot-Extended',
  'CCBot', // Common Crawl
];

export default function robots(): MetadataRoute.Robots {
  const allowTraining = process.env.ALLOW_AI_TRAINING_CRAWLERS !== 'false';
  const open = { allow: '/', disallow: ['/api/'] };

  return {
    rules: [
      { userAgent: '*', ...open },
      { userAgent: AI_SEARCH_CRAWLERS, ...open },
      allowTraining
        ? { userAgent: AI_TRAINING_CRAWLERS, ...open }
        : { userAgent: AI_TRAINING_CRAWLERS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

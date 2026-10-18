// next.config.js
const withNextIntl = require('next-intl/plugin')();

/* ------------------------------------------------------------------ */
/* Origines de production                                              */
/*                                                                     */
/* Même logique que lib/seo.ts (qui ne peut pas être importée ici :     */
/* CommonJS vs alias TypeScript) : on relit les MÊMES variables d'env,  */
/* avec les MÊMES valeurs par défaut. Les domaines ne sont donc jamais  */
/* dupliqués en dur — changer NEXT_PUBLIC_SITE_URL pilote le canonical  */
/* ET la redirection de /recrutement.                                   */
/* ------------------------------------------------------------------ */

/** « https://www.exemple.com/chemin/ » → « https://www.exemple.com » ('' si invalide). */
const toOrigin = (value) => {
  try {
    return new URL(String(value).trim()).origin;
  } catch {
    return '';
  }
};

const DEFAULT_PRIMARY_ORIGIN = 'https://www.iris-junior-entreprise.com';
const DEFAULT_ALTERNATE_ORIGINS = ['https://www.iris-junior-entreprise.tn'];

/**
 * Origine CANONIQUE, indépendante de l'env. Sert de destination au filet de
 * sécurité de /recrutement : en dev NEXT_PUBLIC_SITE_URL vaut
 * http://localhost:3000, et un filet basé sur SITE_URL enverrait vers
 * join.localhost. On retombe donc sur le vrai domaine, à l'image du repli
 * côté client (JOIN_FALLBACK_URL dans lib/join.ts).
 */
const CANONICAL_ORIGIN = DEFAULT_PRIMARY_ORIGIN;

const SITE_URL =
  toOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? '') || DEFAULT_PRIMARY_ORIGIN;

const alternateEnv = process.env.NEXT_PUBLIC_ALTERNATE_SITE_URLS;
const alternateOrigins = (
  alternateEnv === undefined ? DEFAULT_ALTERNATE_ORIGINS : alternateEnv.split(',')
)
  .map(toOrigin)
  .filter(Boolean);

const SITE_ORIGINS = Array.from(new Set([SITE_URL, ...alternateOrigins]));

/**
 * Hôte de production réel. En dev, NEXT_PUBLIC_SITE_URL vaut
 * http://localhost:3000 : cette origine ne doit PAS générer de règle
 * « par hôte », sans quoi localhost matcherait avant le filet de sécurité
 * et redirigerait vers join.localhost. Même critère que proxy.ts.
 */
const isProductionHost = (hostname) =>
  hostname !== '' &&
  hostname !== 'localhost' &&
  !hostname.endsWith('.localhost') &&
  !hostname.endsWith('.vercel.app') &&
  !/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

/** « https://www.iris-junior-entreprise.tn » → « join.iris-junior-entreprise.tn » */
const joinOrigin = (origin) => {
  const url = new URL(origin);
  return `https://join.${url.hostname.replace(/^www\./, '')}`;
};

/* ------------------------------------------------------------------ */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },

  async redirects() {
    // Les candidatures vivent sur IRIS JOIN : /recrutement ne sert plus et
    // redirige vers le sous-domaine « join. » DU MÊME domaine visité — un
    // visiteur du .tn ne doit pas atterrir sur le .com. permanent: true →
    // 308, que Google traite comme une mise à jour d'URL définitive.
    //
    // Règle par hôte de production, puis filet de sécurité : tout autre
    // hôte (localhost, preview *.vercel.app) rejoint le domaine principal,
    // au lieu de retomber sur la page et son meta refresh.
    //
    // On ne retient QUE les domaines réels : une origine de dev incluse par
    // NEXT_PUBLIC_SITE_URL générerait une règle pour localhost, qui serait
    // matchée AVANT le filet et renverrait vers join.localhost.
    const byHost = SITE_ORIGINS.filter((origin) =>
      isProductionHost(new URL(origin).hostname)
    ).map((origin) => {
      const host = new URL(origin).hostname;
      return {
        source: '/:locale(en|fr|ar)/recrutement',
        has: [{ type: 'host', value: host }],
        destination: joinOrigin(origin),
        permanent: true,
      };
    });

    return [
      ...byHost,
      // Filet de sécurité : tout hôte non listé (localhost, preview
      // *.vercel.app) rejoint le domaine CANONIQUE — jamais SITE_URL, qui en
      // dev vaut http://localhost:3000 et produirait join.localhost. C'est le
      // pendant serveur de JOIN_FALLBACK_URL (lib/join.ts).
      {
        source: '/:locale(en|fr|ar)/recrutement',
        destination: joinOrigin(CANONICAL_ORIGIN),
        permanent: true,
      },
      // Variante sans préfixe de langue : elle ne devrait jamais être servie
      // ([locale]='recrutement' tombe dans notFound), mais un ancien lien
      // sans locale mérite le même sort qu'une URL morte.
      {
        source: '/recrutement',
        destination: joinOrigin(CANONICAL_ORIGIN),
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

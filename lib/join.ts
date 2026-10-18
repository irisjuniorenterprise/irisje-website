// lib/join.ts
//
// IRIS JOIN : plateforme de recrutement, de réservation d'entretien et de
// délibération des résultats. Elle vit sur un sous-domaine « join. » de
// chacun des deux domaines du site :
//   www.iris-junior-entreprise.com → https://join.iris-junior-entreprise.com
//   www.iris-junior-entreprise.tn  → https://join.iris-junior-entreprise.tn
//
// Module pur (aucun import serveur) : utilisable côté client.

/** Repli (rendu serveur, localhost, preview *.vercel.app…) : le domaine principal. */
export const JOIN_FALLBACK_URL = 'https://join.iris-junior-entreprise.com';

// Capture « iris-junior-entreprise.com|tn » pour www., l'apex ou un sous-domaine.
const SITE_HOST = /(?:^|\.)(iris-junior-entreprise\.(?:com|tn))$/i;

/** « www.iris-junior-entreprise.tn » → « https://join.iris-junior-entreprise.tn ». */
export const joinUrlFromHostname = (hostname: string): string => {
  const match = SITE_HOST.exec(hostname.trim().toLowerCase());
  return match ? `https://join.${match[1]}` : JOIN_FALLBACK_URL;
};

type JoinText = {
  /** Mot affiché dans la pastille « NEW ». */
  badge: string;
  /** Complément lu par les lecteurs d'écran (nom du lien = « IRIS JOIN Nouveau … »). */
  hint: string;
  /** Titre de la carte du menu mobile. */
  title: string;
  /** Sous-titre de la carte : rappelle la date limite (ex. « 7 octobre »). */
  until: (date: string) => string;
};

const JOIN_TEXT: Record<'fr' | 'en' | 'ar', JoinText> = {
  fr: {
    badge: 'Nouveau',
    hint: "plateforme de recrutement (s'ouvre dans un nouvel onglet)",
    title: "Rejoignez l'équipe IRIS",
    until: (date) => `Candidatures jusqu'au ${date}`,
  },
  en: {
    badge: 'New',
    hint: 'recruitment platform (opens in a new tab)',
    title: 'Join the IRIS team',
    until: (date) => `Applications open until ${date}`,
  },
  ar: {
    badge: 'جديد',
    hint: 'منصة التوظيف (تفتح في علامة تبويب جديدة)',
    title: 'انضم إلى فريق IRIS',
    until: (date) => `التقديم متاح حتى ${date}`,
  },
};

export const getJoinText = (locale: string): JoinText =>
  locale === 'en' || locale === 'ar' ? JOIN_TEXT[locale] : JOIN_TEXT.fr;

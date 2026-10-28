// lib/data/pageSections.ts
//
// Sections navigables de chaque page, dans l'ordre d'affichage : alimente le
// sommaire latéral (components/layout/SectionNav.tsx).
//
// Chaque entrée est l'`id` d'une <section> de la page. Le libellé affiché est
// lu dans messages/*.json → SectionNav.items.<pageKey>.<id>.
//
// ➜ Pour AJOUTER le sommaire à une autre page : ajoutez sa clé ci-dessous, puis
//   les libellés des 3 langues dans messages/{fr,en,ar}.json. Une page absente
//   de cette liste n'affiche aucun sommaire (pages légales, FAQ, 404…).
// ➜ Un id introuvable dans la page est ignoré automatiquement : pas de lien mort.

export const PAGE_SECTIONS = {
  home: ['accueil', 'slider', 'services', 'a-propos', 'devis', 'contact'],
  'a-propos': [
    'apropos-hero',
    'qui-sommes-nous',
    'notre-mission',
    'notre-vision',
    'nos-valeurs',
    'organigramme',
    'nous-trouver',
    'portfolio',
  ],
  services: ['services-hero', 'introduction', 'it', 'marketing', 'etudes', 'cta'],
} as const satisfies Record<string, readonly string[]>;

export type SectionPageKey = keyof typeof PAGE_SECTIONS;

/**
 * Clé de page à partir de la route SANS préfixe de langue
 * ('' = accueil, 'services', 'a-propos'…). undefined = pas de sommaire.
 */
export function sectionPageKey(route: string): SectionPageKey | undefined {
  const key = route === '' ? 'home' : route;
  return Object.prototype.hasOwnProperty.call(PAGE_SECTIONS, key)
    ? (key as SectionPageKey)
    : undefined;
}
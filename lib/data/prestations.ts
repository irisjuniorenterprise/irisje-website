// lib/data/prestations.ts
// Source unique des prestations du formulaire de devis (valeurs envoyées / présélectionnées).

export const PRESTATIONS = {
  web: 'developpement-web',
  mobile: 'developpement-mobile',
  chatbot: 'chatbot',
  branding: 'branding',
  community: 'community-management',
  etudeMarche: 'etude-marche',
  etudeNotoriete: 'etude-notoriete',
  etudeSatisfaction: 'etude-satisfaction',
  businessPlan: 'business-plan',
} as const;

export type PrestationValue = (typeof PRESTATIONS)[keyof typeof PRESTATIONS];

/** Vérifie qu'une valeur (ex. issue de l'URL) correspond bien à une prestation connue. */
export const isPrestationValue = (value: unknown): value is PrestationValue =>
  typeof value === 'string' && (Object.values(PRESTATIONS) as string[]).includes(value);

/** Lien vers le formulaire de devis avec la prestation présélectionnée. */
export const devisHref = (locale: string, prestation: PrestationValue): string =>
  `/${locale}/devis?prestation=${prestation}#formulaire-devis`;
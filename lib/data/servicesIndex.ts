// lib/data/servicesIndex.ts
//
// Index léger des pages de détail (services + guides) : slugs, catégories et
// libellés courts. Module PUR (aucun import serveur, aucun contenu long) :
// utilisable par lib/seo.ts (registre des routes, sitemap), le proxy, le
// footer et le fil d'Ariane sans alourdir le bundle client.
//
// Le contenu éditorial complet vit dans lib/data/servicesContent.*.ts et
// lib/data/guides.ts.
//
// ➜ Pour AJOUTER un guide : ajoutez son slug dans GUIDE_SLUGS, son titre court
//   dans GUIDE_TITLES et son contenu dans lib/data/guides.ts. Il obtient
//   automatiquement URL, sitemap, hreflang, fil d'Ariane et JSON-LD.
import type { Locale } from '../../i18n/config';
import { PRESTATIONS, type PrestationValue } from './prestations';

/** Date de dernière mise à jour éditoriale des pages de détail (ISO). */
export const CONTENT_LAST_MODIFIED = '2026-11-05';

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/** Le slug d'URL d'un service = la valeur de prestation du formulaire de devis. */
export type ServiceSlug = PrestationValue;

export const SERVICE_SLUGS = Object.values(PRESTATIONS) as ServiceSlug[];

export const isServiceSlug = (value: unknown): value is ServiceSlug =>
  typeof value === 'string' && (SERVICE_SLUGS as string[]).includes(value);

export type ServiceCategory = 'it' | 'marketing' | 'etudes';

/** Catégorie (= ancre de la page /services) de chaque prestation. */
export const SERVICE_CATEGORY: Record<ServiceSlug, ServiceCategory> = {
  [PRESTATIONS.web]: 'it',
  [PRESTATIONS.mobile]: 'it',
  [PRESTATIONS.chatbot]: 'it',
  [PRESTATIONS.branding]: 'marketing',
  [PRESTATIONS.community]: 'marketing',
  [PRESTATIONS.etudeMarche]: 'etudes',
  [PRESTATIONS.etudeNotoriete]: 'etudes',
  [PRESTATIONS.etudeSatisfaction]: 'etudes',
  [PRESTATIONS.businessPlan]: 'etudes',
};

/** Libellés courts (fil d'Ariane, liens internes, pied de page). */
export const SERVICE_NAMES: Record<Locale, Record<ServiceSlug, string>> = {
  fr: {
    [PRESTATIONS.web]: 'Développement web',
    [PRESTATIONS.mobile]: 'Développement mobile',
    [PRESTATIONS.chatbot]: 'Chatbot',
    [PRESTATIONS.branding]: 'Branding et identité visuelle',
    [PRESTATIONS.community]: 'Community management',
    [PRESTATIONS.etudeMarche]: 'Étude de marché',
    [PRESTATIONS.etudeNotoriete]: 'Étude de notoriété',
    [PRESTATIONS.etudeSatisfaction]: 'Étude de satisfaction',
    [PRESTATIONS.businessPlan]: 'Business plan',
  },
  en: {
    [PRESTATIONS.web]: 'Web development',
    [PRESTATIONS.mobile]: 'Mobile app development',
    [PRESTATIONS.chatbot]: 'Chatbot development',
    [PRESTATIONS.branding]: 'Branding and visual identity',
    [PRESTATIONS.community]: 'Community management',
    [PRESTATIONS.etudeMarche]: 'Market research',
    [PRESTATIONS.etudeNotoriete]: 'Brand awareness study',
    [PRESTATIONS.etudeSatisfaction]: 'Customer satisfaction study',
    [PRESTATIONS.businessPlan]: 'Business plan',
  },
  ar: {
    [PRESTATIONS.web]: 'تطوير المواقع الإلكترونية',
    [PRESTATIONS.mobile]: 'تطوير تطبيقات الجوال',
    [PRESTATIONS.chatbot]: 'تطوير روبوتات المحادثة',
    [PRESTATIONS.branding]: 'العلامة التجارية والهوية البصرية',
    [PRESTATIONS.community]: 'إدارة المجتمعات الرقمية',
    [PRESTATIONS.etudeMarche]: 'دراسة السوق',
    [PRESTATIONS.etudeNotoriete]: 'دراسة الشهرة',
    [PRESTATIONS.etudeSatisfaction]: 'دراسة رضا العملاء',
    [PRESTATIONS.businessPlan]: 'خطة العمل (Business Plan)',
  },
};

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

export const GUIDE_SLUGS = [
  'qu-est-ce-qu-une-junior-entreprise',
  'cahier-des-charges-site-web',
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export const isGuideSlug = (value: unknown): value is GuideSlug =>
  typeof value === 'string' && (GUIDE_SLUGS as readonly string[]).includes(value);

/** Titres courts (fil d'Ariane, liens internes). */
export const GUIDE_TITLES: Record<Locale, Record<GuideSlug, string>> = {
  fr: {
    'qu-est-ce-qu-une-junior-entreprise': "Qu'est-ce qu'une junior-entreprise ?",
    'cahier-des-charges-site-web': "Cahier des charges d'un site web",
  },
  en: {
    'qu-est-ce-qu-une-junior-entreprise': 'What is a junior enterprise?',
    'cahier-des-charges-site-web': 'Website requirements document',
  },
  ar: {
    'qu-est-ce-qu-une-junior-entreprise': 'ما هي المؤسسة الصغرى الطلابية؟',
    'cahier-des-charges-site-web': 'كراس الشروط لموقع إلكتروني',
  },
};

/** Libellés du chemin « /guides » dans le fil d'Ariane. */
export const GUIDES_LABEL: Record<Locale, string> = {
  fr: 'Guides',
  en: 'Guides',
  ar: 'أدلة',
};

/* ------------------------------------------------------------------ */
/* Types du contenu éditorial                                          */
/* ------------------------------------------------------------------ */

export type FaqItem = { q: string; a: string };

export type ServiceContent = {
  /** Titre H1 de la page (porte le mot-clé et le lieu). */
  h1: string;
  /** Meta description (≈ 150 caractères). */
  summary: string;
  /** Réponse directe en tête de page (40 à 60 mots) : extraite par Google et les IA. */
  answer: string;
  deliverables: string[];
  forWhom: string[];
  faq: FaqItem[];
};

export type ServiceUi = {
  quickAnswer: string;
  whatYouGet: string;
  forWhomTitle: string;
  processTitle: string;
  processSteps: { title: string; text: string }[];
  faqTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  otherServices: string;
  allServices: string;
  guidesTitle: string;
  byline: string;
  titleSuffix: string;
};

export type GuideSection = {
  h2: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
};

export type GuideContent = {
  h1: string;
  summary: string;
  answer: string;
  sections: GuideSection[];
  faq: FaqItem[];
};

export type GuideUi = {
  indexTitle: string;
  indexSummary: string;
  indexIntro: string;
  readGuide: string;
  updated: string;
  quickAnswer: string;
  faqTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  relatedServices: string;
  titleSuffix: string;
};

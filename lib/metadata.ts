// lib/metadata.ts
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://irisje.com';
const DEFAULT_IMAGE = '/logo-iris.png'; // Image dans /public

type PageMeta = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
};

// Définition statique des métadonnées pour chaque page (en français pour l'instant)
export const pageMetadata: Record<string, PageMeta> = {
  '/': {
    title: 'IRIS Junior Entreprise — Propulsez votre potentiel',
    description: 'IRIS Junior Entreprise accompagne les entrepreneurs, startups et PME avec des solutions innovantes en IT, études et marketing. Propulsez votre potentiel avec IRIS JE.',
    keywords: 'junior entreprise, conseil, IT, marketing, études, ENIS, Sfax',
    type: 'website',
  },
  '/a-propos': {
    title: 'À propos | IRIS Junior Entreprise',
    description: 'Découvrez IRIS Junior Entreprise, la Junior-Création de l\'ENIS. Notre mission, notre vision, nos valeurs et notre équipe.',
    keywords: 'à propos, IRIS JE, ENIS, junior entreprise, mission, valeurs',
    type: 'website',
  },
  '/services': {
    title: 'Services | IRIS Junior Entreprise',
    description: 'Découvrez nos prestations en IT, Marketing et Études. Nous mettons notre expertise au service de vos projets.',
    keywords: 'services, IT, développement web, marketing, études, conseil',
    type: 'website',
  },
  '/contact': {
    title: 'Contact | IRIS Junior Entreprise',
    description: 'Contactez IRIS Junior Entreprise pour toute demande d\'information, de devis ou de partenariat.',
    keywords: 'contact, IRIS JE, devis, partenariat, sponsoring',
    type: 'website',
  },
  '/devis': {
    title: 'Demande de devis | IRIS Junior Entreprise',
    description: 'Demandez un devis personnalisé pour vos projets IT, Marketing ou Études auprès d\'IRIS Junior Entreprise.',
    keywords: 'devis, demande de devis, projet, budget, délai',
    type: 'website',
  },
  '/faq': {
    title: 'FAQ | IRIS Junior Entreprise',
    description: 'Réponses aux questions fréquentes sur IRIS Junior Entreprise : services, recrutement, devis, fonctionnement.',
    keywords: 'FAQ, questions fréquentes, recrutement, services, IRIS JE',
    type: 'website',
  },
  '/recrutement': {
    title: 'Recrutement | IRIS Junior Entreprise',
    description: 'Rejoignez IRIS Junior Entreprise. Postulez pour intégrer notre équipe de consultants.',
    keywords: 'recrutement, postuler, candidature, junior entreprise, ENIS',
    type: 'website',
  },
  '/mentions-legales': {
    title: 'Mentions légales | IRIS Junior Entreprise',
    description: 'Mentions légales du site web d\'IRIS Junior Entreprise – Éditeur, coordonnées et responsable de publication.',
    keywords: 'mentions légales, éditeur, responsable, publication',
    type: 'website',
  },
  '/politique-confidentialite': {
    title: 'Politique de confidentialité | IRIS Junior Entreprise',
    description: 'Politique de confidentialité du site d\'IRIS Junior Entreprise – Protection de vos données personnelles.',
    keywords: 'confidentialité, données personnelles, RGPD, cookies',
    type: 'website',
  },
  '/cgu': {
    title: 'Conditions Générales d\'Utilisation | IRIS Junior Entreprise',
    description: 'Conditions Générales d\'Utilisation du site web d\'IRIS Junior Entreprise.',
    keywords: 'CGU, conditions générales, utilisation, site web',
    type: 'website',
  },
};

// Fonction utilitaire pour construire l'objet Metadata complet
export function buildMetadata(
  path: string,
  locale: string = 'fr',
  extra?: Partial<Metadata>
): Metadata {
  const meta = pageMetadata[path] || pageMetadata['/'];
  const url = `${SITE_URL}/${locale}${path === '/' ? '' : path}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        fr: `https://irisje.com/fr${path === '/' ? '' : path}`,
        en: `https://irisje.com/en${path === '/' ? '' : path}`,
        ar: `https://irisje.com/ar${path === '/' ? '' : path}`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'IRIS Junior Entreprise',
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: 'IRIS Junior Entreprise',
        },
      ],
      type: meta.type || 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_IMAGE],
      site: '@IRIS_JE', // adaptez si vous avez un compte Twitter
      creator: '@IRIS_JE',
    },
    ...extra,
  };
}
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

// ✅ URLs statiques du site (pages principales)
const staticPages = [
  '',
  '/a-propos',
  '/services',
  '/contact',
  '/devis',
  '/recrutement',
  '/faq',
  '/mentions-legales',
  '/politique-confidentialite',
  '/cgu',
];

// URL de base du site (à adapter selon l'environnement)
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // En production, utiliser la variable d'environnement ou le domaine par défaut
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://irisje.com';
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const today = new Date();

  // ✅ Générer une entrée pour chaque page × chaque locale
  const entries = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      // Construire l'URL avec la locale
      const path = page === '' ? `/${locale}` : `/${locale}${page}`;
      const url = `${baseUrl}${path}`;

      // Priorités différentes selon l'importance de la page
      let priority = 0.5;
      let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';

      // Pages prioritaires
      if (page === '') {
        priority = 1.0;
        changeFrequency = 'daily';
      } else if (page === '/services' || page === '/a-propos') {
        priority = 0.8;
        changeFrequency = 'weekly';
      } else if (page === '/contact' || page === '/devis' || page === '/recrutement') {
        priority = 0.7;
        changeFrequency = 'weekly';
      } else if (page === '/faq') {
        priority = 0.6;
        changeFrequency = 'monthly';
      } else {
        priority = 0.4;
        changeFrequency = 'monthly';
      }

      entries.push({
        url,
        lastModified: today,
        changeFrequency,
        priority,
      });
    }
  }

  return entries;
}
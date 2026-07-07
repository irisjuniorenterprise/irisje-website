// app/robots.ts
import { MetadataRoute } from 'next';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://irisje.com';
};

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',        // Ne pas indexer les routes API
        '/_next/',      // Ne pas indexer les fichiers Next.js
        '/404',         // Ne pas indexer la page 404
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
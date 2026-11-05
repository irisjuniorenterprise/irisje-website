// components/detail/detailJsonLd.ts
//
// Constructeurs de JSON-LD (schema.org) des pages de détail. Fonctions pures :
// uniquement des données visibles sur la page (pas de faux avis, pas de prix
// inventés — voir l'en-tête de components/seo/PageJsonLd.tsx).
import type { FaqItem } from '@/lib/data/servicesIndex';
import { CONTENT_LAST_MODIFIED } from '@/lib/data/servicesIndex';
import { SITE_NAME } from '@/lib/seo';

type Node = Record<string, unknown>;

export const faqNode = (pageUrl: string, items: FaqItem[]): Node => ({
  '@type': 'FAQPage',
  '@id': `${pageUrl}#faq`,
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

export const serviceNode = (args: {
  origin: string;
  pageUrl: string;
  locale: string;
  name: string;
  description: string;
  category: string;
}): Node => ({
  '@type': 'Service',
  '@id': `${args.pageUrl}#service`,
  name: args.name,
  description: args.description,
  serviceType: args.category,
  url: args.pageUrl,
  inLanguage: args.locale,
  areaServed: { '@type': 'Country', name: 'Tunisia' },
  provider: { '@type': 'Organization', '@id': `${args.origin}/#organization`, name: SITE_NAME },
});

export const articleNode = (args: {
  origin: string;
  pageUrl: string;
  locale: string;
  headline: string;
  description: string;
}): Node => ({
  '@type': 'Article',
  '@id': `${args.pageUrl}#article`,
  headline: args.headline,
  description: args.description,
  inLanguage: args.locale,
  datePublished: CONTENT_LAST_MODIFIED,
  dateModified: CONTENT_LAST_MODIFIED,
  mainEntityOfPage: args.pageUrl,
  image: `${args.origin}/og-image.png`,
  author: { '@type': 'Organization', '@id': `${args.origin}/#organization`, name: SITE_NAME },
  publisher: { '@type': 'Organization', '@id': `${args.origin}/#organization`, name: SITE_NAME },
});

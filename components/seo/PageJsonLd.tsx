// components/seo/PageJsonLd.tsx
'use client';

// Données structurées JSON-LD (schema.org) de la page courante, générées à
// partir du chemin et des traductions — placé une seule fois dans le layout,
// il couvre toutes les pages du site (rendu aussi dans le HTML serveur) :
//  - accueil : Organization (+ ProfessionalService : adresse, position, zone
//    desservie) + WebSite (nom du site pour Google) ;
//  - toutes les pages : WebPage typée (AboutPage, ContactPage, FAQPage…)
//    + BreadcrumbList (fil d'Ariane) ;
//  - /services : catalogue des prestations (OfferCatalog) ;
//  - /faq : questions / réponses (FAQPage).
// Les pages inconnues (404) n'émettent rien.
//
// `origin` = domaine réellement servi (.com ou .tn), fourni par le layout :
// les @id et les URLs du JSON-LD suivent le domaine de la page.
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import JsonLd from '@/components/seo/JsonLd';
import {
  ORGANIZATION,
  SITE_NAME,
  absoluteUrl,
  getRoute,
  normalizePath,
} from '@/lib/seo';

type Translator = {
  (key: string): string;
  has: (key: string) => boolean;
  raw: (key: string) => unknown;
};

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Prestations du catalogue : catégorie → clés dans ServicesPage.
const SERVICE_CATEGORIES: { key: string; items: string[] }[] = [
  { key: 'it', items: ['web', 'mobile', 'chatbot'] },
  { key: 'marketing', items: ['branding', 'community'] },
  { key: 'etudes', items: ['marche', 'notoriete', 'satisfaction', 'business'] },
];

export default function PageJsonLd({ origin }: { origin: string }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations() as unknown as Translator;

  // '/fr/services' → '/services' ; '/fr' → '/'
  const segments = pathname.split('/').filter(Boolean);
  const path = normalizePath(segments.slice(1).join('/'));
  const route = getRoute(path);
  if (!route) return null;

  const read = (key: string) => (t.has(key) ? t(key) : '');

  const pageUrl = absoluteUrl(locale, path, origin);
  const homeUrl = absoluteUrl(locale, '/', origin);
  const orgId = `${origin}/#organization`;
  const siteId = `${homeUrl}#website`;

  const title = read(`${route.namespace}.meta.title`);
  const description = read(`${route.namespace}.meta.description`);

  const graph: Record<string, unknown>[] = [];

  /* ---------- Accueil : identité de l'organisation et du site ---------- */
  if (path === '/') {
    const institution = read('AboutPage.map.institution');

    graph.push({
      '@type': ['Organization', 'ProfessionalService'],
      '@id': orgId,
      name: SITE_NAME,
      alternateName: ORGANIZATION.alternateName,
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/logo-iris.png`,
        width: 500,
        height: 500,
      },
      image: `${origin}/og-image.png`,
      description: read('HomePage.meta.description'),
      foundingDate: ORGANIZATION.foundingDate,
      email: ORGANIZATION.email,
      telephone: ORGANIZATION.telephone,
      address: { '@type': 'PostalAddress', ...ORGANIZATION.address },
      geo: { '@type': 'GeoCoordinates', ...ORGANIZATION.geo },
      areaServed: { '@type': 'Country', name: 'Tunisia' },
      knowsAbout: ORGANIZATION.knowsAbout,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: ORGANIZATION.email,
          telephone: ORGANIZATION.telephone,
          availableLanguage: ['fr', 'en', 'ar'],
        },
      ],
      sameAs: ORGANIZATION.sameAs,
      ...(institution
        ? { parentOrganization: { '@type': 'EducationalOrganization', name: institution } }
        : {}),
    });

    graph.push({
      '@type': 'WebSite',
      '@id': siteId,
      url: homeUrl,
      name: SITE_NAME,
      alternateName: ORGANIZATION.alternateName,
      inLanguage: locale,
      publisher: { '@id': orgId },
    });
  }

  /* ---------- Page courante ---------- */
  const page: Record<string, unknown> = {
    '@type': route.schema,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': siteId, name: SITE_NAME, url: homeUrl },
    about: { '@type': 'Organization', '@id': orgId, name: SITE_NAME },
  };

  if (path !== '/') {
    page.breadcrumb = { '@id': `${pageUrl}#breadcrumb` };
  }

  // Catalogue des prestations
  if (path === '/services') {
    const categories = SERVICE_CATEGORIES.map(({ key, items }) => ({
      '@type': 'OfferCatalog',
      name: read(`ServicesPage.${key}.title`),
      itemListElement: items
        .filter((item) => t.has(`ServicesPage.${key}.${item}.title`))
        .map((item) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: read(`ServicesPage.${key}.${item}.title`),
            description: stripHtml(read(`ServicesPage.${key}.${item}.desc`)),
            provider: { '@type': 'Organization', '@id': orgId, name: SITE_NAME },
          },
        })),
    })).filter((category) => category.itemListElement.length > 0);

    if (categories.length > 0) {
      page.mainEntity = {
        '@type': 'OfferCatalog',
        name: title,
        itemListElement: categories,
      };
    }
  }

  // Questions fréquentes
  if (path === '/faq' && t.has('FaqAccordion.items')) {
    const items = t.raw('FaqAccordion.items');
    if (Array.isArray(items)) {
      const questions = items
        .filter(
          (item): item is { question: string; answer: string } =>
            typeof item?.question === 'string' && typeof item?.answer === 'string',
        )
        .map((item) => ({
          '@type': 'Question',
          name: stripHtml(item.question),
          acceptedAnswer: { '@type': 'Answer', text: item.answer.trim() },
        }));

      if (questions.length > 0) page.mainEntity = questions;
    }
  }

  graph.push(page);

  /* ---------- Fil d'Ariane ---------- */
  if (path !== '/') {
    const crumbs = [{ name: read('Breadcrumb.home'), url: homeUrl }];
    let current = '';
    for (const segment of path.split('/').filter(Boolean)) {
      current += `/${segment}`;
      const label = read(`Breadcrumb.routes.${current}`);
      if (label) crumbs.push({ name: label, url: absoluteUrl(locale, current, origin) });
    }

    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />;
}
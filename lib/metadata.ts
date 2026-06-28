// lib/metadata.ts
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://irisje.com';
const DEFAULT_IMAGE = '/logo-iris.png';  // image unique pour toutes les pages

type MetaOptions = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  locale: string;
  path: string;
};

export function buildMetadata({
  title,
  description,
  keywords = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  locale,
  path,
}: MetaOptions): Metadata {
  const url = `${SITE_URL}/${locale}${path === '/' ? '' : path}`;

  return {
    title,
    description,
    keywords,
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
      title,
      description,
      url,
      siteName: 'IRIS Junior Entreprise',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'IRIS Junior Entreprise',
        },
      ],
      type,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@IRIS_JE',
      creator: '@IRIS_JE',
    },
  };
}
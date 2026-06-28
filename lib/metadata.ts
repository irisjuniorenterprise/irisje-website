// lib/metadata.ts
import type { Metadata } from 'next';
import { headers } from 'next/headers';

type MetaOptions = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  locale: string;
  path: string;
};

export async function buildMetadata({
  title,
  description,
  keywords = '',
  image = '/logo-iris.png',
  type = 'website',
  locale,
  path,
}: MetaOptions): Promise<Metadata> {
  // Récupérer l'URL réelle depuis les headers
  const headersList = await headers();
  const host = headersList.get('host') || 'irisje.vercel.app';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const SITE_URL = `${protocol}://${host}`;

  const url = `${SITE_URL}/${locale}${path === '/' ? '' : path}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        fr: `https://${host}/fr${path === '/' ? '' : path}`,
        en: `https://${host}/en${path === '/' ? '' : path}`,
        ar: `https://${host}/ar${path === '/' ? '' : path}`,
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
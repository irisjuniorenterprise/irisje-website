// app/not-found.tsx
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { locales, defaultLocale } from '@/i18n/config';
import './not-found.css';

async function getLocale(): Promise<string> {
  const headersList = await headers();

  // ✅ Priorité 1 : locale depuis l'URL courante (via middleware)
  const xLocale = headersList.get('x-locale');
  if (xLocale && locales.includes(xLocale as any)) return xLocale;

  // ✅ Priorité 2 : depuis le referer (si l'user naviguait déjà)
  const referer = headersList.get('referer') || '';
  const refererSegment = new URL(referer || 'http://x').pathname.split('/')[1];
  if (refererSegment && locales.includes(refererSegment as any)) return refererSegment;

  // ✅ Fallback : accept-language du navigateur
  const acceptLanguage = headersList.get('accept-language') || '';
  const preferred = acceptLanguage.split(',')[0].split('-')[0];
  return locales.includes(preferred as any) ? preferred : defaultLocale;
}

export const metadata: Metadata = {
  title: 'Page non trouvée | IRIS Junior Entreprise',
  description: "La page que vous recherchez n'existe pas.",
  openGraph: {
    title: 'Page non trouvée | IRIS Junior Entreprise',
    description: "La page que vous recherchez n'existe pas.",
    images: ['/logo-iris.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page non trouvée | IRIS Junior Entreprise',
    description: "La page que vous recherchez n'existe pas.",
    images: ['/logo-iris.png'],
  },
};

export default async function RootNotFound() {
  const locale = await getLocale();
  redirect(`/${locale}/404`);
}
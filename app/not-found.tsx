// app/not-found.tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { locales, defaultLocale } from '@/i18n/config';

async function getLocaleFromRequest(): Promise<string> {
  const headersList = await headers();
  
  const acceptLanguage = headersList.get('accept-language') || 'fr';
  const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
  if (locales.includes(preferredLocale as any)) {
    return preferredLocale;
  }
  
  return defaultLocale;
}

export default async function RootNotFound() {
  const locale = await getLocaleFromRequest();
  redirect(`/${locale}/404`);
}
// app/not-found.tsx
import { headers } from 'next/headers';
import { locales, defaultLocale } from '@/i18n/config';
import NotFoundContent from '@/components/NotFoundContent';
import './not-found.css';

async function getLocale(): Promise<string> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const preferred = acceptLanguage.split(',')[0].split('-')[0];
  return locales.includes(preferred as any) ? preferred : defaultLocale;
}

export default async function RootNotFound() {
  const locale = await getLocale();
  return <NotFoundContent locale={locale} />;
}
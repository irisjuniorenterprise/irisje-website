import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n/config';
import NotFoundContent from '@/components/NotFoundContent';

export async function generateMetadata() {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: 'NotFound' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  return defaultLocale;
}

export default async function LocaleNotFound() {
  const locale = await resolveLocale();
  return <NotFoundContent locale={locale} />;
}
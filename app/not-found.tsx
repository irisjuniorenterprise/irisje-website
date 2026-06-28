// app/not-found.tsx
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n/config';
import NotFoundContent from '@/components/NotFoundContent';
import Header from '@/components/layout/Header';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Slogan from '@/components/ui/Slogan';
import Footer from '@/components/layout/Footer';
import './not-found.css';

async function getLocale(): Promise<string> {
  const headersList = await headers();

  const nextIntlLocale = headersList.get('x-next-intl-locale');
  if (nextIntlLocale && locales.includes(nextIntlLocale as any)) return nextIntlLocale;

  const xLocale = headersList.get('x-locale');
  if (xLocale && locales.includes(xLocale as any)) return xLocale;

  const referer = headersList.get('referer') || '';
  try {
    const refLocale = new URL(referer).pathname.split('/')[1];
    if (refLocale && locales.includes(refLocale as any)) return refLocale;
  } catch {}

  const acceptLang = headersList.get('accept-language') || '';
  const preferred = acceptLang.split(',')[0].split('-')[0];
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
  const isRtl = locale === 'ar';
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* ✅ Tous les composants qui utilisent useTranslations
            doivent être DANS le provider */}
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <Breadcrumb />
          <main id="main">
            <NotFoundContent locale={locale} />
          </main>
          <Slogan />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
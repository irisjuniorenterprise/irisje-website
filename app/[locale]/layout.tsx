// app/[locale]/layout.tsx
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientSideEffects from '@/components/ClientSideEffects';
import '../globals.css';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Slogan from '@/components/ui/Slogan';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// ✅ Viewport géré uniquement ici — supprime les <meta> manuels
export const viewport: Viewport = {
  themeColor: '#1a3969',
  width: 'device-width',
  initialScale: 1,
};

// ✅ Metadata centralisée — favicon, titre, manifest, PWA
export const metadata: Metadata = {
  title: {
    default: 'IRIS Junior Entreprise',
    template: '%s | IRIS Junior Entreprise',
  },
  description: 'IRIS Junior Entreprise — Propulsez votre potentiel',
  manifest: '/manifest.json?v=2',
  icons: {
    icon: [
      { url: '/favicon.ico' },                          // fallback universel
      { url: '/logo-iris.png', type: 'image/png' },     // navigateurs modernes
    ],
    apple: '/logo-iris.png',                            // iOS home screen
    shortcut: '/favicon.ico',
  },
  other: {
    'msapplication-TileColor': '#1a3969',               // tuile Windows
    'msapplication-TileImage': '/logo-iris.png',
  },
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      {/* ✅ Pas de <head> manuel — Next.js injecte tout via metadata et viewport */}
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <a href="#main" className="skip-link">
            {locale === 'fr' ? 'Aller au contenu principal' :
             locale === 'en' ? 'Skip to main content' :
             'التجاوز إلى المحتوى الرئيسي'}
          </a>
          <Header />
          <Breadcrumb />
          <main id="main">{children}</main>
          <Slogan />
          <Footer />
          <ClientSideEffects />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
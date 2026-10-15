// app/[locale]/layout.tsx
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientSideEffects from '@/components/ClientSideEffects';
import SnapScroll from '@/components/layout/SnapScroll';
import '../globals.css';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Slogan from '@/components/ui/Slogan';
import BackToTop from '@/components/ui/BackToTop';
import LoadingScreen from '@/components/layout/LoadingScreen';
import PageLoader from '@/components/layout/PageLoader';
import { Suspense } from 'react';
import PageJsonLd from '@/components/seo/PageJsonLd';
import { getRequestSite } from '@/lib/request-site';

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

  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      {/* ✅ Pas de <head> manuel — Next.js injecte tout via metadata et viewport */}
      <body suppressHydrationWarning>
        {/* Écran de chargement persistant : durée minimale d'affichage (une
            pulsation du logo), au premier chargement comme à chaque changement
            de page. Rendu hors <Suspense> : il est dans le HTML initial. */}
        <PageLoader>
          <LoadingScreen instant />
        </PageLoader>

        {/* getMessages() importe le JSON de traductions (donnée runtime) :
            wrappe dans <Suspense> pour que le shell <html>/<body> ET l'écran
            de chargement soient envoyés immédiatement en streaming, sans
            attendre la fin du rendu du layout (doc Next — « Interaction
            with loading.js »). Sans ce boundary, l'apparition de l'écran
            de chargement est bloquée jusqu'à la résolution complète du
            layout. */}
        <Suspense fallback={<LoadingScreen instant />}>
          <LocaleChrome locale={locale}>{children}</LocaleChrome>
        </Suspense>
      </body>
    </html>
  );
}

// Contenu du layout : traductions + chrome du site (header, main, footer…).
// Asynchrone — c'est lui qui importe les messages, rendu dans le
// <Suspense> ci-dessus.
async function LocaleChrome({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale });
  // Domaine réellement servi (.com / .tn) : sert aux URLs du JSON-LD
  const { origin } = await getRequestSite();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <a href="#main" className="skip-link">
        {locale === 'fr' ? 'Aller au contenu principal' :
         locale === 'en' ? 'Skip to main content' :
         'التجاوز إلى المحتوى الرئيسي'}
      </a>
      {/* Données structurées schema.org de la page (Organization, WebSite, fil d'Ariane…) */}
      <PageJsonLd origin={origin} />
      <Header />
      <Breadcrumb />
      <main id="main">{children}</main>
      <Slogan />
      <Footer />
      <BackToTop />
      <ClientSideEffects />
      <SnapScroll />
    </NextIntlClientProvider>
  );
}
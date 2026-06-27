// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientSideEffects from '@/components/ClientSideEffects';


type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <a href="#main" className="skip-link">
            Aller au contenu principal
          </a>
          <Header />
          
          <main id="main">{children}</main>
          
          <Footer />
          <ClientSideEffects />
        </NextIntlClientProvider>
      </body>
    </html>
    
  );
}
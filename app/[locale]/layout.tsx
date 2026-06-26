// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import '../globals.css';

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
  const isRtl = locale === 'ar';

  return (
    
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <a href="#main" className="skip-link">
            {locale === 'fr' ? 'Aller au contenu principal' :
             locale === 'en' ? 'Skip to main content' :
             'التجاوز إلى المحتوى الرئيسي'}
          </a>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
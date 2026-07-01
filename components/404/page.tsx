// app/[locale]/404/page.tsx
import NotFoundContent from '@/components/NotFoundContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const { getTranslations } = await import('next-intl/server');
  const t = await getTranslations({ locale, namespace: 'NotFound' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function NotFoundPage({ params }: Props) {
  const { locale } = await params;
  return <NotFoundContent locale={locale} />;
}
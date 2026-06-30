import NotFoundContent from '@/components/NotFoundContent';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props) {
  const { locale } = params;
  const { getTranslations } = await import('next-intl/server');

  const t = await getTranslations({
    locale,
    namespace: 'NotFound'
  });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function NotFoundPage({ params }: Props) {
  const { locale } = params;

  return <NotFoundContent locale={locale} />;
}
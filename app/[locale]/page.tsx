// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>Bienvenue sur IRIS Junior Entreprise</p>
    </div>
  );
}
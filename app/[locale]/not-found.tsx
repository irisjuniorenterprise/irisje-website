// app/[locale]/not-found.tsx
//
// 404 DANS une langue du site. ⚠️ Ne lire ni cookies() ni headers() ici : un
// not-found fait partie de l'arbre de rendu de [locale], et une lecture
// dynamique rendait TOUTES les pages du site dynamiques (pas de rendu statique,
// pas de cache CDN, TTFB plus long). La langue vient de next-intl
// (setRequestLocale, appelé par app/[locale]/layout.tsx), sans en-têtes.
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import NotFoundContent from '@/components/NotFoundContent';

// Statique : un titre neutre suffit (une page 404 n'est pas indexée).
export const metadata: Metadata = {
  title: 'Page introuvable — Page not found — الصفحة غير موجودة',
  robots: { index: false, follow: false },
};

export default async function LocaleNotFound() {
  const locale = await getLocale();
  return <NotFoundContent locale={locale} />;
}

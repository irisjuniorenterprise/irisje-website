// app/[locale]/not-found.tsx
import { getTranslations } from 'next-intl/server';
import NotFoundContent from '@/components/NotFoundContent';

export default async function LocaleNotFound() {
  // Pas d'accès direct à params ici (limitation Next.js),
  // donc on récupère la locale déjà injectée par le layout parent
  // via next-intl (le NextIntlClientProvider du layout est déjà actif)
  return <NotFoundContent locale="fr" />; 
  // ⚠️ temporaire — voir note ci-dessous pour la locale dynamique
}
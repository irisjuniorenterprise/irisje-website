// components/forms/LazyForms.tsx
'use client';

// Versions « chargement différé » des trois formulaires.
//
// Les formulaires embarquent react-hook-form + zod + @hookform/resolvers :
// avec un import statique, ce code part dans le JavaScript initial de la page
// alors qu'il n'est utile qu'une fois le formulaire visible. Ici :
//   1. next/dynamic sépare chaque formulaire dans son propre chunk ;
//   2. LazyOnVisible ne déclenche le téléchargement que quand le bloc approche
//      de l'écran (400 px d'avance : le formulaire est prêt avant d'être vu) ;
//   3. un squelette de même emprise évite les sauts de mise en page.
//
// Les pages (Server Components) importent ces wrappers à la place des
// formulaires. Les props sont identiques à celles des formulaires d'origine.

import dynamic from 'next/dynamic';
import LazyOnVisible from '@/components/ui/LazyOnVisible';
import FormSkeleton from './FormSkeleton';
import type { PrestationValue } from '@/lib/data/prestations';

const ROOT_MARGIN = '400px';

const ContactForm = dynamic(() => import('./ContactForm'), {
  loading: () => <FormSkeleton minHeight={560} fields={4} />,
});

const DevisForm = dynamic(() => import('./DevisForm'), {
  loading: () => <FormSkeleton minHeight={680} fields={5} />,
});

const RecruitmentForm = dynamic(() => import('./RecruitmentForm'), {
  loading: () => <FormSkeleton minHeight={760} fields={6} />,
});

export function LazyContactForm({ locale }: { locale: string }) {
  return (
    <LazyOnVisible
      rootMargin={ROOT_MARGIN}
      fallback={<FormSkeleton minHeight={560} fields={4} />}
    >
      <ContactForm locale={locale} />
    </LazyOnVisible>
  );
}

export function LazyDevisForm({
  locale,
  defaultPrestation,
}: {
  locale: string;
  /** Prestation présélectionnée (ex. depuis la page Services) */
  defaultPrestation?: PrestationValue;
}) {
  return (
    <LazyOnVisible
      rootMargin={ROOT_MARGIN}
      fallback={<FormSkeleton minHeight={680} fields={5} />}
    >
      <DevisForm locale={locale} defaultPrestation={defaultPrestation} />
    </LazyOnVisible>
  );
}

export function LazyRecruitmentForm({ locale }: { locale: string }) {
  return (
    <LazyOnVisible
      rootMargin={ROOT_MARGIN}
      fallback={<FormSkeleton minHeight={760} fields={6} />}
    >
      <RecruitmentForm locale={locale} />
    </LazyOnVisible>
  );
}
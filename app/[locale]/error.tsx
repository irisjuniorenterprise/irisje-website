'use client';

// app/[locale]/error.tsx : filet de sécurité d'une page (le header et le footer
// du layout restent affichés). Voir components/ErrorContent.tsx.
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ErrorContent, { toLang } from '@/components/ErrorContent';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale?: string }>();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorContent lang={toLang(params?.locale)} onRetry={reset} />;
}

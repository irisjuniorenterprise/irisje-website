'use client';

// app/global-error.tsx : dernier filet de sécurité, si le layout racine lui-même
// échoue. Doit définir <html> et <body>. Langue déduite de l'URL.
import { useEffect } from 'react';
import ErrorContent, { toLang } from '@/components/ErrorContent';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const lang = toLang(
    typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : undefined,
  );

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <ErrorContent lang={lang} onRetry={reset} />
      </body>
    </html>
  );
}

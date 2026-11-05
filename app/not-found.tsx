// app/not-found.tsx
//
// 404 RACINE (hors préfixe de langue valide) : volontairement STATIQUE et
// trilingue. ⚠️ Ne lire ni headers() ni cookies() ici : un not-found racine
// dynamique rend TOUTES les pages du site dynamiques (pas de rendu statique,
// pas de CDN). Les 404 sous /fr, /en, /ar passent par app/[locale]/not-found.tsx
// (voir proxy.ts), avec le design complet du site.
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable | IRIS Junior Entreprise',
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  const link = { color: '#1a3969', fontWeight: 600 } as const;
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, color: '#1a3969' }}>404</h1>
          <p style={{ margin: 0 }}>Page introuvable · Page not found · الصفحة غير موجودة</p>
          <p style={{ margin: 0 }}>
            <Link href="/fr" style={link}>Accueil</Link> · <Link href="/en" style={link}>Home</Link> ·{' '}
            <Link href="/ar" style={link}>الرئيسية</Link>
          </p>
        </main>
      </body>
    </html>
  );
}

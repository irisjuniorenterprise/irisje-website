'use client';

// components/ErrorContent.tsx
//
// Contenu des pages d'erreur (error.tsx / global-error.tsx) en FR / EN / AR,
// sans dépendre des traductions chargées côté serveur : si le chargement des
// messages est précisément ce qui a échoué, cette page doit quand même
// s'afficher. Les textes sont donc inline (même convention que le skip-link
// du layout).
import Link from 'next/link';

const TEXT = {
  fr: {
    title: 'Une erreur est survenue',
    text: "Désolé, la page n'a pas pu s'afficher. Vous pouvez réessayer ou revenir à l'accueil.",
    retry: 'Réessayer',
    home: "Retour à l'accueil",
  },
  en: {
    title: 'Something went wrong',
    text: "Sorry, the page couldn't be displayed. You can try again or go back to the home page.",
    retry: 'Try again',
    home: 'Back to home',
  },
  ar: {
    title: 'حدث خطأ',
    text: 'عذرًا، تعذّر عرض الصفحة. يمكنك المحاولة مجددًا أو العودة إلى الصفحة الرئيسية.',
    retry: 'إعادة المحاولة',
    home: 'العودة إلى الرئيسية',
  },
} as const;

type Lang = keyof typeof TEXT;

export const toLang = (value: string | undefined): Lang =>
  value === 'en' || value === 'ar' ? value : 'fr';

export default function ErrorContent({ lang, onRetry }: { lang: Lang; onRetry: () => void }) {
  const t = TEXT[lang];
  return (
    <main
      id="main"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '6rem 1.5rem 4rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ margin: 0, color: 'var(--primary, #1a3969)' }}>{t.title}</h1>
      <p style={{ margin: 0, maxWidth: '32rem', color: 'var(--text-secondary, #5d6470)' }}>{t.text}</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" className="btn btn-cta" onClick={onRetry}>
          {t.retry}
        </button>
        <Link href={`/${lang}`} className="btn btn-outline" style={{ color: 'var(--primary, #1a3969)' }}>
          {t.home}
        </Link>
      </div>
    </main>
  );
}

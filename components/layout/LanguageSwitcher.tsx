// components/layout/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { locales, type Locale } from '@/i18n/config';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES: Record<Locale, { short: string; name: string }> = {
  fr: { short: 'FR', name: 'Français' },
  en: { short: 'EN', name: 'English' },
  ar: { short: 'عربي', name: 'العربية' },
};

type LanguageSwitcherProps = {
  /** Locale courante (fr | en | ar) */
  locale: string;
  /** Chemin courant sans le préfixe de locale (ex. « /services ») */
  pathWithoutLocale: string;
  /** Libellé accessible du groupe (ex. « Langue ») */
  label: string;
  /** Appelé au clic sur une langue (ex. fermer le menu mobile) */
  onNavigate?: () => void;
};

export default function LanguageSwitcher({
  locale,
  pathWithoutLocale,
  label,
  onNavigate,
}: LanguageSwitcherProps) {
  // Langue « visée » : fait glisser l'indicateur immédiatement, avant la navigation
  const [pending, setPending] = useState<Locale | null>(null);

  const current = (locales.includes(locale as Locale) ? locale : 'fr') as Locale;
  const visual = pending ?? current;
  const activeIndex = locales.indexOf(visual);

  // « / » → « /fr » ; « /services » → « /fr/services »
  const buildHref = (target: Locale) =>
    pathWithoutLocale === '/' ? `/${target}` : `/${target}${pathWithoutLocale}`;

  return (
    <div className={styles.switcher} role="group" aria-label={label} dir="ltr">
      <span
        className={styles.thumb}
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
        aria-hidden="true"
      />

      {locales.map((code) => {
        const { short, name } = LANGUAGES[code];
        const isCurrent = code === current;
        const itemClass = [
          styles.item,
          code === 'ar' ? styles.arabic : '',
          code === visual ? styles.selected : '',
        ]
          .filter(Boolean)
          .join(' ');

        if (isCurrent) {
          return (
            <span key={code} className={itemClass} lang={code} aria-current="true">
              {short}
              {/* Pas d'aria-label sur un <span> (rôle generic) : le nom
                  complet est ajouté en texte visuellement masqué. */}
              <span className="sr-only"> ({name})</span>
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={buildHref(code)}
            className={itemClass}
            lang={code}
            hrefLang={code}
            // Le libellé doit CONTENIR le texte visible (WCAG 2.5.3) :
            // « EN » seul ne décrit pas la langue, « English » seul casse
            // la correspondance nom/texte visible.
            aria-label={`${short} — ${name}`}
            title={`${short} — ${name}`}
            prefetch={false}
            onClick={() => {
              setPending(code);
              onNavigate?.();
            }}
          >
            {short}
          </Link>
        );
      })}
    </div>
  );
}
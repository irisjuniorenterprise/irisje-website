// components/portfolio/ComingSoon.tsx
//
// État « vide » de la section Réalisations : affiché tant qu'aucun projet n'est
// publié. Même ADN visuel que le reste du site (bleu IRIS + orange CTA), avec
// trois ingrédients pour créer l'attente :
//   1. un message clair (« Bientôt disponible » + « Restez connectés »),
//   2. une progression en 3 étapes (Réalisation ✓ → Mise en valeur ● → Dévoilement ○),
//   3. un aperçu flouté de ce que sera la grille de projets (cartes « mystère »).
// Le ton est celui d'un dévoilement imminent : les projets existent, ils sont en
// cours de mise en valeur. Les boutons (devis / contact) restent disponibles.
//
// Accessibilité : tout le décor est aria-hidden ; le sens passe par le titre,
// le texte, la liste ordonnée des étapes (état annoncé aux lecteurs d'écran) et
// les liens. Les animations sont coupées par prefers-reduced-motion.
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './ComingSoon.module.css';

type ComingSoonProps = {
  locale: string;
  /** true une fois la section entrée dans le viewport : déclenche l'entrée en scène. */
  active: boolean;
};

type StepState = 'done' | 'current' | 'upcoming';

// Les projets existent déjà : il ne reste qu'à les mettre en valeur, puis les dévoiler.
// ➜ Quand la mise en valeur est terminée, passer 'polish' à 'done' et 'reveal' à 'current'.
const STEPS: Array<{ key: 'delivered' | 'polish' | 'reveal'; state: StepState }> = [
  { key: 'delivered', state: 'done' },
  { key: 'polish', state: 'current' },
  { key: 'reveal', state: 'upcoming' },
];

/** Cartes « mystère » : léger décalage pour un aspect vivant, jamais aligné au cordeau. */
const TEASERS = [0, 1, 2] as const;

export default function ComingSoon({ locale, active }: ComingSoonProps) {
  const t = useTranslations('Portfolio.coming_soon');

  return (
    <div className={styles.stage} data-active={active}>
      {/* ── Décor (purement visuel) ── */}
      <div className={styles.decor} aria-hidden="true">
        <span className={styles.grid} />
        <span className={`${styles.orb} ${styles.orbA}`} />
        <span className={`${styles.orb} ${styles.orbB}`} />
        <span className={`${styles.spark} ${styles.sparkA}`} />
        <span className={`${styles.spark} ${styles.sparkB}`} />
        <span className={`${styles.spark} ${styles.sparkC}`} />
        <span className={`${styles.spark} ${styles.sparkD}`} />
      </div>

      <div className={styles.layout}>
        {/* ── Colonne texte ── */}
        <div className={styles.content}>
          <p className={`${styles.eyebrow} ${styles.reveal}`} style={{ '--d': '0ms' } as React.CSSProperties}>
            <span className={styles.pulseDot} aria-hidden="true" />
            {t('eyebrow')}
          </p>

          {/* Un mot du titre est mis en lumière (balise <hl> dans les messages) */}
          <h3 className={`${styles.title} ${styles.reveal}`} style={{ '--d': '90ms' } as React.CSSProperties}>
            {t.rich('title', {
              hl: (chunks) => <span className={styles.hl}>{chunks}</span>,
            })}
          </h3>

          <p className={`${styles.text} ${styles.reveal}`} style={{ '--d': '180ms' } as React.CSSProperties}>
            {t('text')}
          </p>

          {/* Progression : l'état de chaque étape est annoncé en clair (pas
              seulement par la couleur). */}
          <ol
            className={`${styles.steps} ${styles.reveal}`}
            aria-label={t('steps_label')}
            style={{ '--d': '270ms' } as React.CSSProperties}
          >
            {STEPS.map(({ key, state }) => (
              <li
                key={key}
                className={styles.step}
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className={styles.marker} aria-hidden="true">
                  {state === 'done' && <Icons.Check size={16} stroke="currentColor" strokeWidth={3} />}
                </span>
                <span className={styles.stepLabel}>
                  {t(`steps.${key}`)}
                  <span className="sr-only"> — {t(`status.${state}`)}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className={`${styles.actions} ${styles.reveal}`} style={{ '--d': '360ms' } as React.CSSProperties}>
            <p className={styles.pitch}>
              <strong>{t('stay_tuned')}</strong> {t('pitch')}
            </p>
            <div className={styles.buttons}>
              <Link href={`/${locale}/devis`} className="btn btn-cta">
                {t('cta_primary')}
                <Icons.ChevronRight size={16} stroke="currentColor" aria-hidden="true" />
              </Link>
              <Link href={`/${locale}/contact`} className="btn btn-outline">
                {t('cta_secondary')}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Aperçu flouté de la future grille ── */}
        <div className={styles.teasers} aria-hidden="true">
          {TEASERS.map((i) => (
            <div
              key={i}
              className={`${styles.teaser} ${styles.reveal}`}
              style={{ '--d': `${300 + i * 140}ms`, '--float': `${i * 0.9}s` } as React.CSSProperties}
              data-index={i}
            >
              <span className={styles.thumb}>
                <span className={styles.thumbGlyph}>?</span>
              </span>
              <span className={styles.lines}>
                <span className={styles.line} />
                <span className={`${styles.line} ${styles.lineShort}`} />
              </span>
              <span className={styles.pill}>{t('badge')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

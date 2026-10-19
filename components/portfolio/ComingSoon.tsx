// components/portfolio/ComingSoon.tsx
//
// État « vide » de la section Réalisations : affiché tant qu'aucun projet n'est
// publié. Même ADN visuel que le reste du site (bleu IRIS + orange CTA), pensé
// comme un teaser de lancement :
//   1. un message clair (« Bientôt disponible » + « Restez connectés »),
//   2. une progression en 3 étapes (Réalisation ✓ → Mise en valeur ● → Dévoilement ○),
//   3. une pile de cartes « mystère » en 3D dont le cadenas s'entrouvre par
//      intervalles : on devine ce qui arrive sans le voir,
//   4. un halo qui suit le pointeur, une bordure lumineuse qui tourne et un
//      bandeau défilant en pied de carte pour l'énergie.
// Le ton est celui d'un dévoilement imminent : les projets existent, ils sont en
// cours de mise en valeur. Les boutons (devis / contact) restent disponibles.
//
// Accessibilité : tout le décor est aria-hidden ; le sens passe par le titre,
// le texte, la liste ordonnée des étapes (état annoncé aux lecteurs d'écran) et
// les liens. Animations, tilt et halo sont coupés par prefers-reduced-motion.
'use client';

import { useEffect, useRef } from 'react';
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

/** Ordre d'empilement de la pile : du fond vers l'avant. */
const DECK = ['back', 'mid', 'front'] as const;

/** Nombre de répétitions du texte du bandeau (assez long pour couvrir une grande largeur). */
const TICKER_REPEAT = 3;

const css = (vars: Record<string, string>) => vars as React.CSSProperties;

/** Cadenas dont l'anse se soulève par intervalles (animation CSS sur .shackle). */
function Padlock() {
  return (
    <svg className={styles.lock} viewBox="0 0 48 48" width="46" height="46" aria-hidden="true" focusable="false">
      <g className={styles.shackle}>
        <path
          d="M16 21v-5a8 8 0 0 1 16 0v5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
      </g>
      <rect x="10.5" y="21" width="27" height="20" rx="5.5" fill="currentColor" />
      <circle cx="24" cy="30" r="2.7" fill="var(--primary)" />
      <rect x="22.8" y="31" width="2.4" height="5.2" rx="1.2" fill="var(--primary)" />
    </svg>
  );
}

export default function ComingSoon({ locale, active }: ComingSoonProps) {
  const t = useTranslations('Portfolio.coming_soon');
  const stageRef = useRef<HTMLDivElement>(null);

  // Halo + légère inclinaison de la pile qui suivent la souris. Écouteurs natifs
  // (et non props JSX) : décor pur, aucun re-rendu React, rien d'interactif pour
  // les technologies d'assistance. Uniquement pour une vraie souris (pas au tactile).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      stage.style.setProperty('--mx', `${x}px`);
      stage.style.setProperty('--my', `${y}px`);
      stage.style.setProperty('--px', (x / rect.width).toFixed(3));
      stage.style.setProperty('--py', (y / rect.height).toFixed(3));
    };
    const leave = () => {
      ['--mx', '--my', '--px', '--py'].forEach((name) => stage.style.removeProperty(name));
    };

    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerleave', leave);
    return () => {
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
    };
  }, []);

  // Mots du bandeau : réutilise les textes existants (aucune clé de plus à traduire).
  const tickerWords = [
    t('eyebrow'),
    t('stay_tuned').replace(/[.。]\s*$/, ''),
    t('steps.reveal'),
  ];

  return (
    <div ref={stageRef} className={styles.stage} data-active={active}>
      {/* ── Décor (purement visuel) ── */}
      <div className={styles.decor} aria-hidden="true">
        <span className={styles.grid} />
        <span className={`${styles.orb} ${styles.orbA}`} />
        <span className={`${styles.orb} ${styles.orbB}`} />
        <span className={styles.spot} />
        <span className={`${styles.spark} ${styles.sparkA}`} />
        <span className={`${styles.spark} ${styles.sparkB}`} />
        <span className={`${styles.spark} ${styles.sparkC}`} />
        <span className={`${styles.spark} ${styles.sparkD}`} />
      </div>

      <div className={styles.layout}>
        {/* ── Colonne texte ── */}
        <div className={styles.content}>
          <p className={`${styles.eyebrow} ${styles.reveal}`} style={css({ '--d': '0ms' })}>
            <span className={styles.pulseDot} aria-hidden="true" />
            {t('eyebrow')}
          </p>

          {/* Un mot du titre est mis en lumière (balise <hl> dans les messages) */}
          <h3 className={`${styles.title} ${styles.reveal}`} style={css({ '--d': '90ms' })}>
            {t.rich('title', {
              hl: (chunks) => <span className={styles.hl}>{chunks}</span>,
            })}
          </h3>

          <p className={`${styles.text} ${styles.reveal}`} style={css({ '--d': '180ms' })}>
            {t('text')}
          </p>

          {/* Progression : l'état de chaque étape est annoncé en clair (pas
              seulement par la couleur). */}
          <ol
            className={`${styles.steps} ${styles.reveal}`}
            aria-label={t('steps_label')}
            style={css({ '--d': '270ms' })}
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

          <div className={`${styles.actions} ${styles.reveal}`} style={css({ '--d': '360ms' })}>
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

        {/* ── Pile de cartes « mystère » : aperçu flouté de la future grille ── */}
        <div className={styles.showcase} aria-hidden="true">
          <div className={styles.deck}>
            {DECK.map((pos, i) => (
              <div
                key={pos}
                className={`${styles.card} ${styles.reveal}`}
                data-pos={pos}
                style={css({ '--d': `${260 + i * 150}ms`, '--float': `${i * 1.1}s` })}
              >
                <div className={styles.media}>
                  {pos === 'front' ? (
                    <Padlock />
                  ) : (
                    <span className={styles.glyph}>?</span>
                  )}
                  <span className={styles.pill}>{t('badge')}</span>
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.line} />
                  <span className={`${styles.line} ${styles.lineShort}`} />
                  <span className={styles.chips}>
                    <span className={styles.chip} />
                    <span className={styles.chip} />
                    <span className={styles.chip} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bandeau défilant (décor) ── */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <ul key={copy} className={styles.tickerList}>
              {Array.from({ length: TICKER_REPEAT }).flatMap((_, round) =>
                tickerWords.map((word, index) => (
                  <li key={`${round}-${index}`} className={styles.tickerItem}>
                    {word}
                    <span className={styles.tickerStar} />
                  </li>
                )),
              )}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

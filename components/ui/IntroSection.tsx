// components/ui/IntroSection.tsx
//
// Section « introduction » réutilisable (titre + carte de texte + bouton).
// Utilisée par l'accueil (Notre expertise, Qui sommes-nous ?) et par la page
// À propos (Qui sommes-nous ?), pour une présentation identique et lisible
// sur petit écran :
//   • le texte vit dans une carte aux marges réduites (plus de « colonne
//     étroite » en mobile) ;
//   • la 1ʳᵉ phrase du 1ᵉʳ paragraphe sert d'accroche (plus grande, plus
//     contrastée), le reste suit en texte courant ;
//   • les paragraphes suivants sont des notes avec un filet d'accent ;
//   • le bouton prend toute la largeur en mobile.
//
// Composant serveur pur (aucun hook). Alignement : titre centré, texte au
// DÉBUT de la ligne (gauche en FR/EN, droite en AR), conformément à
// app/alignment.css. Propriétés logiques uniquement : RTL natif.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { visuallyHidden } from '@/components/ui/visuallyHidden';
import styles from './IntroSection.module.css';

type Cta = {
  href: string;
  label: string;
  /** Complément lu par les lecteurs d'écran (lien descriptif). */
  srSuffix?: string;
};

type Props = {
  /** Ancre de la section (ex. « services », « a-propos »). */
  id: string;
  title: string;
  /** Paragraphes : le premier reçoit l'accroche, les suivants sont des notes. */
  paragraphs: string[];
  /**
   * true : les paragraphes contiennent du HTML de confiance venant des
   * fichiers de traduction (ex. <strong>). Jamais de saisie utilisateur.
   */
  allowHtml?: boolean;
  cta?: Cta;
  /** Fond alterné (classe globale `section-alt`). */
  alt?: boolean;
  /** Filet bas de la section (comme les autres sections de l'accueil). */
  bordered?: boolean;
  /** Contenu libre ajouté sous les paragraphes, dans la carte. */
  children?: ReactNode;
};

/** « Phrase 1. Phrase 2. » → [« Phrase 1. », « Phrase 2. »] (une seule phrase → reste vide). */
function splitLead(text: string): [string, string] {
  const match = text.match(/^(.+?[.!?؟…])\s+(.+)$/s);
  return match ? [match[1], match[2]] : [text, ''];
}

function Text({
  value,
  html,
  className,
}: {
  value: string;
  html: boolean;
  className: string;
}) {
  return html ? (
    <p className={className} dangerouslySetInnerHTML={{ __html: value }} />
  ) : (
    <p className={className}>{value}</p>
  );
}

export default function IntroSection({
  id,
  title,
  paragraphs,
  allowHtml = false,
  cta,
  alt = false,
  bordered = false,
  children,
}: Props) {
  const [first, ...notes] = paragraphs;
  const [lead, body] = splitLead(first ?? '');

  return (
    <section
      className={`placeholder ${alt ? 'section-alt ' : ''}${styles.section}`}
      suppressHydrationWarning
      id={id}
      style={bordered ? { borderBottom: '1px solid var(--border-light)' } : undefined}
    >
      <div className={styles.inner}>
        <h2 className={`section-title ${styles.title}`}>{title}</h2>

        <div className={styles.card}>
          <Text value={lead} html={allowHtml} className={styles.lead} />
          {body && <Text value={body} html={allowHtml} className={styles.body} />}

          {notes.map((note, index) => (
            <Text key={index} value={note} html={allowHtml} className={styles.note} />
          ))}

          {children}
        </div>

        {cta && (
          <div className={styles.cta}>
            <Link href={cta.href} className={`btn btn-cta ${styles.button}`}>
              {cta.label}
              {cta.srSuffix && <span style={visuallyHidden}>{` — ${cta.srSuffix}`}</span>}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
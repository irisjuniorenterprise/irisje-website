// components/ui/CtaBand.tsx
// Bandeau d'appel à l'action (CTA) avec l'illustration de marque en fond.
// Composant serveur : aucun JS client. Réutilisable sur n'importe quelle page.
//
// La classe globale `placeholder` est conservée pour l'animation d'apparition
// au scroll (ClientSideEffects) ; `id` reste exposé pour le scrollspy.
import type { ReactNode } from 'react';
import styles from './CtaBand.module.css';

type CtaBandProps = {
  /** Ancre de la section (ex. « cta », « contact ») */
  id: string;
  /** Titre (h2) */
  title: string;
  /** Texte principal sous le titre */
  description?: string;
  /** Petite phrase en italique sous le texte principal (optionnelle) */
  note?: string;
  /** Boutons d'action (ex. <Link className="btn btn-cta">…</Link>) */
  children?: ReactNode;
  /** Pleine hauteur d'écran (comme le CTA des pages en snap scroll : services,
   *  accueil, à propos). Pour les pages sans snap, ex. les guides. */
  fullHeight?: boolean;
};

export default function CtaBand({
  id,
  title,
  description,
  note,
  children,
  fullHeight = false,
}: CtaBandProps) {
  return (
    <section className={`placeholder ${styles.band}${fullHeight ? ` ${styles.full}` : ''}`} id={id} suppressHydrationWarning>
      <div className={`container ${styles.inner}`}>
        <h2 data-rv className={styles.title}>{title}</h2>
        {description && <p data-rv className={styles.description}>{description}</p>}
        {note && <p data-rv className={styles.note}>{note}</p>}
        {children && <div data-rv className={styles.actions}>{children}</div>}
      </div>
    </section>
  );
}
// components/forms/FormSkeleton.tsx
//
// Squelette affiché avant (et pendant) le chargement différé d'un formulaire.
// Purement visuel : aucun texte, donc aucune clé de traduction à ajouter.

import styles from './FormSkeleton.module.css';

type FormSkeletonProps = {
  /** Hauteur minimale réservée (px), proche de celle du formulaire final */
  minHeight?: number;
  /** Nombre de champs simples simulés */
  fields?: number;
  /** Affiche aussi une zone de texte (message / description) */
  textarea?: boolean;
};

export default function FormSkeleton({
  minHeight = 520,
  fields = 4,
  textarea = true,
}: FormSkeletonProps) {
  return (
    <div className={styles.skeleton} style={{ minHeight }} aria-busy="true">
      <div className={`${styles.line} ${styles.title}`} aria-hidden="true" />
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className={`${styles.line} ${styles.field}`} aria-hidden="true" />
      ))}
      {textarea && <div className={`${styles.line} ${styles.area}`} aria-hidden="true" />}
      <div className={`${styles.line} ${styles.button}`} aria-hidden="true" />
    </div>
  );
}
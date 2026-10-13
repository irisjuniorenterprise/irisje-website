// components/forms/FormHeader.tsx
//
// En-tête commun aux formulaires (Contact, Devis) : pastille d'icône, titre,
// courte phrase d'introduction et rappel des champs obligatoires.
// Le titre est un <h2> (le <h1> est porté par le hero de la page) et sert de
// nom accessible au formulaire via aria-labelledby.
//
// NB : on utilise des <div> et non des <span> : la section parente peut porter
// la classe globale `.placeholder`, dont la règle `.placeholder span` ajoute
// une puce « ✦ » et passe le texte en majuscules.

import type { ReactNode } from 'react';
import styles from './FormHeader.module.css';

type FormHeaderProps = {
  /** id du titre, à référencer par aria-labelledby sur le <form> */
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  requiredNote: string;
};

export default function FormHeader({
  id,
  icon,
  title,
  subtitle,
  requiredNote,
}: FormHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.badge} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.text}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.note}>{requiredNote}</div>
      </div>
    </header>
  );
}
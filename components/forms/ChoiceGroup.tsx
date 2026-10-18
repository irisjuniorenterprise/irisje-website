// components/forms/ChoiceGroup.tsx
'use client';

import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import styles from './FormShared.module.css';

type ChoiceOption = { value: string; label: string };

type ChoiceGroupProps = {
  /** Identifiant unique du groupe (ex. « contact-sujet ») */
  id: string;
  label: string;
  icon: ReactNode;
  options: readonly ChoiceOption[];
  /** Résultat de register('champ') de react-hook-form */
  registration: UseFormRegisterReturn;
  /** Message d'erreur de validation (affiché sous le groupe) */
  error?: string;
};

/** Choix unique présenté en cartes (boutons radio accessibles). */
export default function ChoiceGroup({
  id,
  label,
  icon,
  options,
  registration,
  error,
}: ChoiceGroupProps) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div
      className={`${styles.field} ${error ? styles.groupInvalid : ''}`}
      role="radiogroup"
      aria-labelledby={labelId}
      aria-required="true"
      aria-invalid={!!error}
      // Le message d'erreur est rattaché au groupe : il est annoncé dès
      // l'entrée dans les radios, pas seulement s'il est survolé à la souris.
      aria-describedby={error ? errorId : undefined}
    >
      <span id={labelId} className={styles.choiceLabel}>
        {icon}
        <span>{label} *</span>
      </span>

      <div className={styles.choiceGrid}>
        {options.map((option, index) => (
          <label key={option.value} className={styles.choiceOption}>
            <input
              type="radio"
              // Id stable : sert au déplacement du focal sur le premier
              // champ en erreur après un envoi refusé.
              id={`${id}-${index}`}
              value={option.value}
              {...registration}
              className={styles.choiceRadio}
            />
            <span className={styles.choiceBox}>
              <span className={styles.choiceDot} aria-hidden="true" />
              <span className={styles.choiceText}>{option.label}</span>
            </span>
          </label>
        ))}
      </div>

      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

// components/ui/ToolTag.tsx
'use client';

// Pastille d'outil d'une prestation (React JS, Figma, SWOT…).
// Même apparence qu'avant au repos (pilule grise) ; en plus :
//  - survol : la pastille se soulève et prend la teinte accent + contour ;
//  - clic / toucher : retour « pression », puis la pastille est marquée
//    (fond bleu IRIS + coche) — un second clic la démarque ;
//  - clavier : atteignable avec Tab, activable avec Entrée / Espace, anneau
//    de focus visible ; l'état est annoncé aux lecteurs d'écran (aria-pressed).
// Le marquage est purement visuel (il n'envoie rien) : il permet au visiteur
// de repérer les outils qui l'intéressent en parcourant les prestations.
import { useState, type ReactNode } from 'react';
import styles from './ToolTag.module.css';

export default function ToolTag({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState(false);

  return (
    <button
      type="button"
      className={`${styles.tag} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={() => setSelected((value) => !value)}
    >
      <svg
        className={styles.check}
        viewBox="0 0 12 12"
        width="10"
        height="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 6.5l2.2 2.2L9.5 3.5" />
      </svg>
      <span>{children}</span>
    </button>
  );
}
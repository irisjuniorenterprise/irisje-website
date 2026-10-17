// components/ui/ToolTag.tsx
'use client';

// Pastille d'outil d'une prestation (React JS, Figma, SWOT…).
// Apparence au repos : pilule grise, étiquette en MAJUSCULES (Montserrat
// 0.85rem, gris --text-muted) précédée de l'étoile décorative ✦ accent.
// En plus :
//  - survol : la pastille se soulève et prend la teinte accent + contour ;
//  - clic / toucher : retour « pression », puis la pastille est marquée
//    (fond bleu IRIS + coche) — un second clic la démarque ;
//  - clavier : atteignable avec Tab, activable avec Entrée / Espace, anneau
//    de focus visible ; l'état est annoncé aux lecteurs d'écran (aria-pressed).
// Étoile et style d'étiquette étaient produits par la règle globale
// .placeholder span* (globals.css), qui « fuyait » dans les pastilles de la
// page services — d'où un portfolio visuellement différent. ToolTag les porte
// désormais lui-même : rendu strictement identique sur toutes les pages.
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
      {/* Étoile décorative « ✦ » : reprend la puce que la règle globale
          .placeholder span::before ajoutait aux pastilles de la page
          services. ToolTag la porte désormais lui-même pour qu'elle
          apparaisse partout où le composant est utilisé (services,
          portfolio…) et dans les mêmes proportions. */}
      <span className={styles.star} aria-hidden="true">✦</span>
      <span className={styles.label}>{children}</span>
    </button>
  );
}
// components/ui/visuallyHidden.ts
//
// Style « visuellement masqué » : le texte reste lu par les lecteurs d'écran
// et pris en compte par les moteurs de recherche, mais n'apparaît pas à
// l'écran. Sert à compléter un libellé générique (« En savoir plus ») avec
// le sujet du lien — exigence Lighthouse « Links do not have descriptive text ».
import type { CSSProperties } from 'react';

export const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
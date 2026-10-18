// components/forms/formA11y.ts
// Aides d'accessibilité partagées par les formulaires du site (contact,
// devis, recrutement).

/**
 * Construit la valeur d'`aria-describedby` à partir des ids réellement
 * présents dans le DOM. Une référence vers un id inexistant est ignorée par
 * les lecteurs d'écran et signalée par axe (`aria-valid-attr-value`) : on ne
 * déclare donc que ce qui est rendu.
 */
export function describedBy(
  ...ids: Array<string | false | undefined | null>
): string | undefined {
  const value = ids.filter(Boolean).join(' ');
  return value.length > 0 ? value : undefined;
}

/**
 * Après un envoi refusé par la validation, déplace le focal sur le premier
 * contrôle en erreur. Sans cela, le message s'affiche là où il se trouve
 * (parfois en haut de page) pendant que le clavier reste sur le bouton
 * d'envoi : l'utilisateur ne sait pas pourquoi rien ne s'est passé.
 *
 * `controls` liste les champs DANS L'ORDRE VISUEL du formulaire, associés à
 * l'id de leur premier contrôle (celui qui reçoit le focal).
 */
export function focusFirstInvalid<T extends object>(
  errors: T,
  controls: Record<string, string>,
): void {
  const list = errors as Record<string, unknown>;
  const first = Object.keys(controls).find((field) => list[field]);
  if (!first) return;
  document.getElementById(controls[first])?.focus();
}

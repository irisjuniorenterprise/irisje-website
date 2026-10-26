// components/organigramme/memberCard.types.ts
//
// Données de la fiche membre (member card), partagées entre le composant
// serveur Organigramme.tsx (qui les construit et les traduit) et le composant
// client MemberCardLayer.tsx (qui les affiche). Tout est déjà traduit côté
// serveur : le client ne reçoit que des chaînes prêtes à l'emploi.

export type MemberTier = 'admin' | 'exec' | 'extended';

export type MemberContact = {
  kind: 'email' | 'linkedin' | 'github' | 'phone';
  /** Lien déjà assaini (mailto:, tel:, http(s):). */
  href: string;
  /** Libellé accessible (aria-label / title). */
  label: string;
};

export type MemberInfo = {
  /** Identifiant du poste (valeur de data-member sur le bouton déclencheur). */
  id: string;
  name: string;
  /** false = nom de maquette (« Prénom et NOM ») affiché en grisé. */
  hasName: boolean;
  role: string;
  tier: MemberTier;
  tierLabel: string;
  photo?: string;
  /** 'president' agrandit l'avatar. */
  level?: 'president' | 'bureau' | 'head';
  /** aria-label du bouton déclencheur / de la fiche. */
  openLabel: string;
  dialogLabel: string;
  /** « Mission » (texte par défaut du poste) ou « À propos » (bio fournie). */
  textLabel: string;
  text: string;
  /** « Rattaché à » : intitulé du poste supérieur. */
  reportsTo?: string;
  /** « 3 personnes » : taille de l'équipe directe (absent si 0). */
  team?: string;
  since?: string;
  tags: string[];
  stars?: number;
  starsLabel?: string;
  contacts: MemberContact[];
};

export type MemberLabels = {
  close: string;
  reportsTo: string;
  team: string;
  pinHint: string;
};
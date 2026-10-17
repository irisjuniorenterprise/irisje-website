// lib/data/organigramme.ts
//
// Source unique de l'organigramme affiché sur la page « À propos ».
// C'est le SEUL fichier à modifier pour changer la structure ou les noms.
//
// ─── Comment ça marche ──────────────────────────────────────────────────
// L'organigramme est un ARBRE : chaque poste (OrgNode) peut contenir
//
//   • children   → sa sous-arborescence (les postes placés SOUS lui, reliés
//                  par un trait). Imbrication illimitée.
//
//   • aside      → des postes placés DE CHAQUE CÔTÉ du trait vertical
//                  (ex. Trésorier et Secrétaire Général autour du Président).
//                  Maximum 2 (un à gauche, un à droite ; inversé en arabe).
//
//   • assistants → les adjoints (« bureau étendu ») : regroupés dans UN SEUL
//                  cadre en bas de l'organigramme, avec leur rattachement.
//
// ─── Textes (intitulés des postes) ──────────────────────────────────────
// `roleKey` est une clé du namespace `Organigramme.roles` dans
// messages/{fr,en,ar}.json.
//
// ─── Noms et photos ─────────────────────────────────────────────────────
// `name`  : laissez vide pour afficher « Prénom et NOM » (maquette).
// `photo` : chemin d'une image placée dans /public (ex. '/team/yassine.jpg').
// `stars` : (adjoints) nombre d'étoiles de 0 à 5, optionnel.

export type OrgLevel = 'president' | 'bureau' | 'head';

/** Une personne rattachée à un poste (adjoint du bureau étendu). */
export type OrgPerson = {
  name?: string;
  photo?: string;
  /** Clé de `Organigramme.roles.*` — par défaut « assistant » (Adjoint(e)). */
  roleKey?: string;
  /** Nombre d'étoiles (0 à 5) affichées dans le Bureau étendu. */
  stars?: number;
};

export type OrgNode = {
  /** Identifiant unique (clé React) — ex. 'rh-formation'. */
  id: string;
  /** Clé de `Organigramme.roles.*` (intitulé du poste, traduit). */
  roleKey: string;
  name?: string;
  photo?: string;
  /**
   * Style de la carte : 'president' (avatar agrandi), 'bureau'
   * (membre du bureau exécutif) ou 'head' (responsable, par défaut).
   */
  level?: OrgLevel;
  /** Adjoints (bureau étendu). */
  assistants?: OrgPerson[];
  /** Postes placés de part et d'autre du trait vertical (max. 2). */
  aside?: OrgNode[];
  /** Sous-arborescence (postes placés sous celui-ci). */
  children?: OrgNode[];
};

export const ORGANIGRAMME: OrgNode = {
  id: 'president',
  roleKey: 'president',
  level: 'president',
  // name: 'Prénom NOM',
  // photo: '/team/president.jpg',

  // Bureau administratif : de part et d'autre du Président
  aside: [
    { id: 'tresorier', roleKey: 'treasurer', level: 'bureau' },
    { id: 'secretaire-general', roleKey: 'secretary_general', level: 'bureau' },
  ],

  // Responsables de pôles
  children: [
    {
      id: 'rh-formation',
      roleKey: 'hr_training',
      // exemple : assistants: [{ name: 'Prénom Nom', stars: 4 }],
      assistants: [{}],
    },

    {
      // Le Responsable Projet supervise deux départements : IT et Études
      id: 'projet',
      roleKey: 'project',
      assistants: [{}],
      children: [
        {
          id: 'it',
          roleKey: 'it',
        },
        {
          id: 'etudes',
          roleKey: 'studies',
          assistants: [{}],
        },
      ],
    },

    {
      id: 'developpement-commercial',
      roleKey: 'business_dev',
      assistants: [{}],
    },

    {
      id: 'marketing',
      roleKey: 'marketing',
    },

    {
      id: 'qualite',
      roleKey: 'quality',
    },
  ],
};
// components/organigramme/Organigramme.tsx
//
// Organigramme récursif (composant serveur, aucun JS envoyé au navigateur).
// La structure vient de lib/data/organigramme.ts ; les intitulés de postes
// viennent du namespace `Organigramme` des messages (fr / en / ar).
//
// Hiérarchie (du haut vers le bas) :
//   Bureau administratif (racine + postes `aside` : Président, SG, Trésorier)
//   > Bureau exécutif    (`children` : responsables de départements)
//   > Bureau étendu      (`assistants` : toujours SOUS leur responsable)
//
// Bureau étendu : tous les adjoints sont regroupés dans UN SEUL cadre en
// traits interrompus, en bas de l'organigramme. Chaque adjoint reprend les
// mêmes styles que les responsables : bandeau de nom (.ribbon) et poste
// (.role, « Adjoint(e) Projet »…, clés `assistant_of.<roleKey>`). Une étoile
// bleue (CSS ::before) précède le nom ; si `stars` est fourni, une notation
// de 0 à 5 étoiles s'affiche en plus.
//
// Rendu : arbre horizontal avec connecteurs en CSS sur grand écran, liste
// verticale indentée sur tablette / mobile. Compatible RTL (arabe).
//
// Animation d'entrée (CSS pur, chorégraphiée depuis ce fichier) :
//   schedule() calcule l'instant de départ (ms) de chaque élément ; il est
//   transmis au CSS via des variables (--at, --link, --link-before/after) et
//   les durées via --dur-* (constante DUR). Séquence :
//   étiquette admin > Président > trait > tronc > traits latéraux >
//   Trésorier puis SG > trait > étiquette exécutif > trait > barre qui
//   s'étend depuis le centre (responsables du centre vers les bords) >
//   cadre du Bureau étendu > adjoints en cascade.
//   Pour accélérer / ralentir : ajuster DUR, GAP, SETTLE et FLOW ci-dessous.
//
// Rejeu : l'enveloppe client <OrganigrammeReplay> met l'animation en pause
// jusqu'à ce que la section soit visible, et la relance à chaque rechargement
// ou navigation vers la page (voir OrganigrammeReplay.tsx).

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ORGANIGRAMME, type OrgNode, type OrgPerson } from '@/lib/data/organigramme';
import OrganigrammeReplay from './OrganigrammeReplay';
import styles from './Organigramme.module.css';

type TFunction = (key: string) => string;

type Props = {
  locale: string;
  /** Racine de l'arbre (par défaut : ORGANIGRAMME de lib/data/organigramme.ts). */
  root?: OrgNode;
};

const MAX_STARS = 5;
const MAX_ASIDE = 2; // postes latéraux : 1 à gauche, 1 à droite

/* ------------------------------------------------------------------ */
/* Chronologie d'apparition                                            */
/* ------------------------------------------------------------------ */

/** Durées des animations (ms). Exposées au CSS sous forme de --dur-<clé>. */
const DUR = {
  label: 400, // étiquettes de bureau
  card: 600, // carte d'un poste
  stem: 280, // trait vertical court
  trunk: 420, // tronc entre Trésorier et SG
  hline: 360, // trait horizontal vers un poste latéral
  half: 220, // une demi-barre (+ descente) vers un responsable
  frame: 800, // cadre du bureau étendu
} as const;

/** Les barres avancent à ~80 % de la durée d'une demi-barre (le reste = descente). */
const SWEEP_STEP = DUR.half * 0.8;
/** Instant d'apparition de la carte racine (après son étiquette). */
const ROOT_CARD_AT = 200;
/** Fraction de DUR.card après laquelle la suite démarre (la carte est déjà bien visible). */
const SETTLE = 0.5;
/** Fraction de DUR.stem après laquelle la suite démarre. */
const FLOW = 0.7;
/** Fraction de DUR.trunk après laquelle les traits latéraux démarrent. */
const TRUNK_REACH = 0.55;
/** Décalages (ms) entre éléments d'une même série. */
const GAP = {
  aside: 150, // Trésorier > SG
  assistant: 70, // adjoints du bureau étendu
} as const;
/** Au-delà, les adjoints suivants apparaissent ensemble (évite une cascade trop longue). */
const MAX_ASSISTANT_STAGGER = 14;

const DURATION_VARS = Object.fromEntries(
  Object.entries(DUR).map(([key, ms]) => [`--dur-${key}`, `${ms}ms`]),
) as CSSProperties;

/** Variables CSS numériques (instants de départ en ms) pour piloter les animations. */
const vars = (values: Record<string, number>): CSSProperties =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Math.round(value)]),
  ) as CSSProperties;

type Side = 'start' | 'mid' | 'end';

/** Arrivée des traits vers un poste : instants de départ des deux demi-barres. */
type Entry = { side: Side; before: number; after: number };

type Timing = {
  /** Côté du centre (début / centre / fin de ligne) : sens du balayage de la barre. */
  side: Side;
  /** Départ des demi-barres (moitié côté début / côté fin de ligne) qui mènent au poste. */
  linkBefore: number;
  linkAfter: number;
  /** Premier trait qui mène au poste (utilisé par la vue mobile). */
  link: number;
  card: number;
  stem: number;
  trunk: number;
  asideLink: number[];
  asideCard: number[];
  stemMid: number;
  tier: number;
  stemTier: number;
  children: Timing[];
  /** Instant où tout le sous-arbre est bien visible. */
  end: number;
};

/**
 * Planifie l'apparition d'un poste et de son sous-arbre.
 * Ordre : carte > trait > postes latéraux (tronc, traits, cartes) > trait >
 * étiquette exécutif (racine) > trait > barre qui s'étend du centre vers les bords.
 */
function schedule(node: OrgNode, entry: Entry, isRoot: boolean): Timing {
  const aside = (node.aside ?? []).slice(0, MAX_ASIDE);
  const kids = node.children ?? [];

  const card = isRoot ? ROOT_CARD_AT : entry.after + DUR.half * 0.9;
  const timing: Timing = {
    side: entry.side,
    linkBefore: entry.before,
    linkAfter: entry.after,
    link: Math.min(entry.before, entry.after),
    card,
    stem: 0,
    trunk: 0,
    asideLink: [],
    asideCard: [],
    stemMid: 0,
    tier: 0,
    stemTier: 0,
    children: [],
    end: card + DUR.card * SETTLE,
  };

  let t = card + DUR.card * SETTLE;

  if (aside.length > 0 || kids.length > 0) {
    timing.stem = t;
    t += DUR.stem * FLOW;
  }

  if (aside.length > 0) {
    timing.trunk = t;
    const firstLink = t + DUR.trunk * TRUNK_REACH;
    aside.forEach((_, i) => {
      const link = firstLink + i * GAP.aside;
      timing.asideLink.push(link);
      timing.asideCard.push(link + DUR.hline * 0.65);
    });
    const lastCard = timing.asideCard[timing.asideCard.length - 1];
    timing.end = Math.max(timing.end, lastCard + DUR.card * SETTLE);
    t = lastCard + DUR.card * SETTLE;

    if (kids.length > 0) {
      timing.stemMid = t;
      t += DUR.stem * FLOW;
    }
  }

  if (isRoot && kids.length > 0) {
    timing.tier = t;
    t += DUR.label * 0.6;
    timing.stemTier = t;
    t += DUR.stem * FLOW;
  }

  // Barre horizontale : elle part du centre et gagne les bords, demi-barre par
  // demi-barre. Chaque responsable reçoit donc deux départs (avant / après).
  const middle = (kids.length - 1) / 2;
  timing.children = kids.map((child, i) => {
    const side: Side = i > middle ? 'end' : i < middle ? 'start' : 'mid';
    const far = Math.abs(i - middle) * 2; // rang de la demi-barre extérieure
    const near = Math.max(far - 1, 0); // rang de la demi-barre côté centre
    const nearAt = t + near * SWEEP_STEP;
    const farAt = t + far * SWEEP_STEP;

    const childEntry: Entry =
      side === 'end'
        ? { side, before: nearAt, after: farAt }
        : side === 'start'
          ? { side, before: farAt, after: nearAt }
          : { side, before: t, after: t };

    return schedule(child, childEntry, false);
  });

  timing.end = Math.max(timing.end, ...timing.children.map((c) => c.end));
  return timing;
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

/** Silhouette affichée quand aucune photo n'est fournie. */
function DefaultAvatar() {
  return (
    <svg
      className={styles.placeholderSvg}
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="96" height="96" fill="#e2e8f0" />
      <circle cx="48" cy="38" r="17" fill="#cbd5e1" />
      <path d="M14 96c0-19 15-32 34-32s34 13 34 32z" fill="#cbd5e1" />
    </svg>
  );
}

function Avatar({ photo, alt, sizes }: { photo?: string; alt: string; sizes: string }) {
  if (!photo) return <DefaultAvatar />;
  return <Image src={photo} alt={alt} fill sizes={sizes} className={styles.photo} />;
}

/* ------------------------------------------------------------------ */
/* Bureau étendu (adjoints) : un seul cadre pour tous                  */
/* ------------------------------------------------------------------ */

type ExtendedEntry = { owner: OrgNode; person: OrgPerson };

/** Parcourt l'arbre (racine, postes latéraux, puis responsables) et liste les adjoints. */
function collectAssistants(node: OrgNode): ExtendedEntry[] {
  const own = (node.assistants ?? []).map((person) => ({ owner: node, person }));
  const aside = (node.aside ?? []).flatMap(collectAssistants);
  const children = (node.children ?? []).flatMap(collectAssistants);
  return [...own, ...aside, ...children];
}

/** Notation de 0 à 5 étoiles (affichée seulement si `value` est fourni). */
function Stars({ value, tr }: { value?: number; tr: TFunction }) {
  if (value === undefined) return null;
  const count = Math.max(0, Math.min(MAX_STARS, Math.round(value)));

  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={`${tr('stars_label')} : ${count}/${MAX_STARS}`}
    >
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <svg
          key={i}
          className={i < count ? styles.starOn : styles.starOff}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

function AssistantRow({
  entry,
  tr,
  at,
}: {
  entry: ExtendedEntry;
  tr: TFunction;
  at: number;
}) {
  const { owner, person } = entry;
  const hasName = Boolean(person.name?.trim());
  const name = person.name?.trim() || tr('name_placeholder');
  // « Adjoint(e) Projet », « Adjoint(e) Dev-Co »… (roleKey de l'adjoint prioritaire s'il est fourni)
  const role = person.roleKey ? tr(`roles.${person.roleKey}`) : tr(`assistant_of.${owner.roleKey}`);

  return (
    <li className={styles.assistant} style={vars({ '--at': at })}>
      <span className={styles.miniAvatar}>
        <Avatar photo={person.photo} alt={hasName ? name : ''} sizes="52px" />
      </span>
      <div className={styles.assistantText}>
        {/* Mêmes styles que les cartes des responsables (Qualité, Projet…) */}
        <p className={styles.ribbon}>
          <span>{name}</span>
        </p>
        <p className={styles.role}>{role}</p>
        <Stars value={person.stars} tr={tr} />
      </div>
    </li>
  );
}

function ExtendedBureau({
  entries,
  tr,
  at,
}: {
  entries: ExtendedEntry[];
  tr: TFunction;
  /** Instant où le cadre commence à se dessiner (après le dernier responsable). */
  at: number;
}) {
  if (entries.length === 0) return null;

  return (
    <div
      className={styles.extendedBureau}
      role="group"
      aria-label={tr('extended_bureau')}
      style={vars({ '--at': at })}
    >
      <p className={styles.extendedTitle}>
        {tr('extended_bureau')}
        <span className={styles.extendedCount}> · {entries.length}</span>
      </p>

      <ul className={styles.assistantList} role="list">
        {entries.map((entry, index) => (
          <AssistantRow
            key={`${entry.owner.id}-assistant-${index}`}
            entry={entry}
            tr={tr}
            // Les adjoints apparaissent un à un une fois le cadre bien entamé
            at={at + DUR.frame * 0.55 + Math.min(index, MAX_ASSISTANT_STAGGER) * GAP.assistant}
          />
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carte d'un poste                                                    */
/* ------------------------------------------------------------------ */

function OrgCard({ node, tr, at }: { node: OrgNode; tr: TFunction; at: number }) {
  const role = tr(`roles.${node.roleKey}`);
  const hasName = Boolean(node.name?.trim());
  const name = node.name?.trim() || tr('name_placeholder');
  const levelClass = node.level ? (styles[node.level] ?? '') : '';

  return (
    <div className={[styles.card, levelClass].filter(Boolean).join(' ')} style={vars({ '--at': at })}>
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          <Avatar photo={node.photo} alt={hasName ? name : role} sizes="132px" />
        </div>
      </div>

      <div className={styles.identity}>
        <p className={styles.ribbon}>
          <span>{name}</span>
        </p>
        <p className={styles.role}>{role}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étiquette de bureau                                                 */
/* ------------------------------------------------------------------ */

function TierLabel({
  tier,
  label,
  at,
}: {
  tier: 'admin' | 'exec';
  label: string;
  at: number;
}) {
  const tierClass = tier === 'admin' ? styles.tierLabelAdmin : styles.tierLabelExec;
  return (
    <p className={`${styles.tierLabel} ${tierClass}`} style={vars({ '--at': at })}>
      {label}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Branche (poste + postes latéraux + sous-arborescence)               */
/* ------------------------------------------------------------------ */

function OrgBranch({
  node,
  tr,
  timing,
  isRoot = false,
}: {
  node: OrgNode;
  tr: TFunction;
  timing: Timing;
  isRoot?: boolean;
}) {
  const aside = (node.aside ?? []).slice(0, MAX_ASIDE); // 1 à gauche, 1 à droite
  const children = node.children ?? [];
  const hasAside = aside.length > 0;
  const hasChildren = children.length > 0;

  // Racine = bureau administratif ; tous les descendants = bureau exécutif.
  const tierClass = isRoot ? styles.tierAdmin : styles.tierExec;
  // Sens du balayage de la barre (les responsables à l'extrémité reçoivent la barre en dernier)
  const sideClass =
    timing.side === 'start' ? styles.sideStart : timing.side === 'end' ? styles.sideEnd : '';

  const body = (
    <>
      {isRoot && <TierLabel tier="admin" label={tr('bureau_admin')} at={0} />}

      <OrgCard node={node} tr={tr} at={timing.card} />

      {(hasAside || hasChildren) && (
        <span className={styles.stem} style={vars({ '--at': timing.stem })} aria-hidden="true" />
      )}

      {hasAside && (
        <ul className={styles.aside} role="list" style={vars({ '--at': timing.trunk })}>
          {aside.map((sideNode, i) => (
            <li
              key={sideNode.id}
              className={`${styles.asideItem} ${styles.tierAdmin}`}
              style={vars({ '--link': timing.asideLink[i] })}
            >
              <span className={styles.spacer} aria-hidden="true" />
              <OrgCard node={sideNode} tr={tr} at={timing.asideCard[i]} />
              <span className={styles.hLine} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}

      {hasAside && hasChildren && (
        <span className={styles.stem} style={vars({ '--at': timing.stemMid })} aria-hidden="true" />
      )}

      {isRoot && hasChildren && (
        <>
          <TierLabel tier="exec" label={tr('bureau_exec')} at={timing.tier} />
          <span
            className={styles.stem}
            style={vars({ '--at': timing.stemTier })}
            aria-hidden="true"
          />
        </>
      )}

      {hasChildren && (
        <ul className={styles.children} role="list">
          {children.map((child, i) => (
            <OrgBranch key={child.id} node={child} tr={tr} timing={timing.children[i]} />
          ))}
        </ul>
      )}
    </>
  );

  return (
    <li
      className={[styles.item, tierClass, sideClass].filter(Boolean).join(' ')}
      style={vars({
        '--link': timing.link,
        '--link-before': timing.linkBefore,
        '--link-after': timing.linkAfter,
      })}
    >
      {body}

      {/* Bureau étendu : un seul cadre, tout en bas, avec tous les adjoints */}
      {isRoot && (
        <ExtendedBureau entries={collectAssistants(node)} tr={tr} at={timing.end} />
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export default async function Organigramme({ locale, root = ORGANIGRAMME }: Props) {
  const t = await getTranslations({ locale, namespace: 'Organigramme' });
  const tr = t as unknown as TFunction;
  const timing = schedule(root, { side: 'mid', before: 0, after: 0 }, true);

  return (
    <OrganigrammeReplay className={styles.wrapper} style={DURATION_VARS}>
      {/* Sans JavaScript, pas de déclencheur : on lance les animations directement */}
      <noscript>
        <style>{`div[data-anim][data-anim] *,div[data-anim][data-anim] *::before,div[data-anim][data-anim] *::after{animation-play-state:running!important}`}</style>
      </noscript>

      <h2 className="section-title">{tr('title')}</h2>
      <p className={styles.subtitle}>{tr('subtitle')}</p>

      {/* Région défilable au clavier : l'arbre peut dépasser en largeur
          si de nombreuses sous-branches sont ajoutées. */}
      <div
        className={styles.scroller}
        role="region"
        aria-label={tr('aria_label')}
        tabIndex={0}
      >
        <ul className={styles.tree} role="list">
          <OrgBranch node={root} tr={tr} timing={timing} isRoot />
        </ul>
      </div>
    </OrganigrammeReplay>
  );
}
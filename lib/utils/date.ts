// lib/utils/date.ts

/**
 * Fenêtre de recrutement (fuseau horaire de la Tunisie, UTC+1, sans heure d'été),
 * reconduite chaque année : du 1er septembre au 31 octobre, les DEUX inclus.
 * Pour la modifier, il suffit de changer ces 2 constantes.
 */
const TIMEZONE = 'Africa/Tunis';
export const RECRUITMENT_OPEN = { month: 9, day: 1 } as const; // 01/09 (inclus)
export const RECRUITMENT_CLOSE = { month: 10, day: 31 } as const; // 31/10 (inclus)

/** « mois × 100 + jour » : 1er septembre → 901, 31 octobre → 1031 (comparable directement). */
const dayKey = (month: number, day: number): number => month * 100 + day;
const OPEN_KEY = dayKey(RECRUITMENT_OPEN.month, RECRUITMENT_OPEN.day);
const CLOSE_KEY = dayKey(RECRUITMENT_CLOSE.month, RECRUITMENT_CLOSE.day);

type DateParts = { year: number; month: number; day: number };

/** Retourne l'année / le mois (1-12) / le jour courants à Tunis. */
const getTunisDateParts = (date: Date = new Date()): DateParts => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: read('year'), month: read('month'), day: read('day') };
};

/**
 * Vérifie si la période de recrutement est ouverte.
 * @returns true du 01/09 au 31/10 inclus (heure de Tunis), false le reste de l'année.
 */
export const isRecruitmentOpen = (date: Date = new Date()): boolean => {
  const { month, day } = getTunisDateParts(date);
  const key = dayKey(month, day);
  return key >= OPEN_KEY && key <= CLOSE_KEY;
};

/**
 * Retourne la date de la prochaine ouverture des candidatures (1er septembre).
 * À midi UTC pour éviter tout décalage de jour lors du formatage.
 */
export const getNextRecruitmentDate = (date: Date = new Date()): Date => {
  const { year, month, day } = getTunisDateParts(date);

  const openingPassed = dayKey(month, day) >= OPEN_KEY;

  const targetYear = openingPassed ? year + 1 : year;
  return new Date(Date.UTC(targetYear, RECRUITMENT_OPEN.month - 1, RECRUITMENT_OPEN.day, 12));
};

/** Formate une date de recrutement selon la locale (ex. « 1 octobre 2027 »). */
export const formatRecruitmentDate = (date: Date, locale: string): string =>
  date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * Dernier jour d'ouverture, sans l'année (ex. « 31 octobre »). Dérivé des
 * constantes de la fenêtre : aucune date n'est écrite en dur dans l'interface.
 */
export const formatRecruitmentEnd = (locale: string): string =>
  new Date(Date.UTC(2000, RECRUITMENT_CLOSE.month - 1, RECRUITMENT_CLOSE.day, 12)).toLocaleDateString(
    locale,
    { day: 'numeric', month: 'long', timeZone: 'UTC' },
  );

// lib/utils/date.ts

/**
 * Fenêtre de recrutement (fuseau horaire de la Tunisie, UTC+1, sans heure d'été).
 * Pour la modifier, il suffit de changer ces 4 constantes.
 */
const TIMEZONE = 'Africa/Tunis';
export const RECRUITMENT_MONTH = 10; // Octobre
export const RECRUITMENT_OPEN_DAY = 1; // Ouvert à partir du 01/10 (inclus)
export const RECRUITMENT_CLOSE_DAY = 7; // Fermé dès le 07/10 (jour de fermeture inclus)

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
 * @returns true du 01/10 au 06/10 inclus (heure de Tunis), false dès le 07/10.
 */
export const isRecruitmentOpen = (date: Date = new Date()): boolean => {
  const { month, day } = getTunisDateParts(date);
  return (
    month === RECRUITMENT_MONTH &&
    day >= RECRUITMENT_OPEN_DAY &&
    day < RECRUITMENT_CLOSE_DAY
  );
};

/**
 * Retourne la date de la prochaine ouverture des candidatures (1er octobre).
 * À midi UTC pour éviter tout décalage de jour lors du formatage.
 */
export const getNextRecruitmentDate = (date: Date = new Date()): Date => {
  const { year, month, day } = getTunisDateParts(date);

  const openingPassed =
    month > RECRUITMENT_MONTH ||
    (month === RECRUITMENT_MONTH && day >= RECRUITMENT_OPEN_DAY);

  const targetYear = openingPassed ? year + 1 : year;
  return new Date(Date.UTC(targetYear, RECRUITMENT_MONTH - 1, RECRUITMENT_OPEN_DAY, 12));
};

/** Formate une date de recrutement selon la locale (ex. « 1 octobre 2027 »). */
export const formatRecruitmentDate = (date: Date, locale: string): string =>
  date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
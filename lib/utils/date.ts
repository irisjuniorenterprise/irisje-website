// lib/utils/date.ts

/**
 * Vérifie si la période de recrutement est ouverte.
 * @returns {boolean} true si nous sommes en septembre (mois = 8), false sinon.
 */
export const isRecruitmentOpen = (): boolean => {
  const now = new Date();
  // Utiliser le fuseau horaire de la Tunisie (UTC+1)
  const tunisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Tunis' }));
  return tunisTime.getMonth() === 8; // Septembre = 8 (0-indexé)
};

/**
 * Retourne la date de la prochaine ouverture des candidatures.
 * @returns {Date} Date du 1er septembre prochain.
 */
export const getNextRecruitmentDate = (): Date => {
  const now = new Date();
  const nextSeptember = new Date(now.getFullYear(), 8, 1);
  if (now.getMonth() > 8) {
    nextSeptember.setFullYear(nextSeptember.getFullYear() + 1);
  }
  return nextSeptember;
};
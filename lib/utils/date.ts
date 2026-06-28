// lib/utils/date.ts

/**
 * Vérifie si la période de recrutement est ouverte.
 * @returns {boolean} true si nous sommes en Octobre (mois = 5), false sinon.
 */
export const isRecruitmentOpen = (): boolean => {
  const now = new Date();
  // Utiliser le fuseau horaire de la Tunisie (UTC+1)
  const tunisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Tunis' }));
  return tunisTime.getMonth() === 5; // Octobre = 5 (0-indexé)
};

/**
 * Retourne la date de la prochaine ouverture des candidatures.
 * @returns {Date} Date du 1er Octobre prochain.
 */
export const getNextRecruitmentDate = (): Date => {
  const now = new Date();
  const nextOctober = new Date(now.getFullYear(), 5, 1);
  if (now.getMonth() > 5) {
    nextOctober.setFullYear(nextOctober.getFullYear() + 1);
  }
  return nextOctober;
};
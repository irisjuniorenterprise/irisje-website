// tests/a11y/axe.mjs
//
// Utilitaires partagés par les suites d'accessibilité automatisée.
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Fait passer toutes les animations a duree finie a leur etat final.
 *
 * Les entrees animees (orgPop, orgTextIn...) passent par un etat ou le
 * texte est plus clair que sa valeur de contraste finale : axe peut
 * echantillonne ce frame et signaler un faux positif. Les boucles
 * infinies (carrousel, marquee) sont laissees telles quelles.
 */
async function settleAnimations(page) {
  await page.evaluate(() => {
    if (typeof document.getAnimations !== 'function') return;
    for (const animation of document.getAnimations()) {
      const timing = animation.effect && animation.effect.getComputedTiming
        ? animation.effect.getComputedTiming()
        : null;
      if (timing && (timing.iterations === Infinity || !Number.isFinite(timing.iterations))) continue;
      try {
        animation.finish();
      } catch {
        // animation sans piste : ignoree
      }
    }
  });
}

// WCAG 2.2 niveau AA, plus les niveaux A/AA des versions antérieures.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Attend qu'aucune violation WCAG 2.2 AA ne soit détectée sur la page
 * courante. Le rapport est formaté pour rester lisible dans la sortie du
 * runner : impact, identifiant de règle, aide, url de documentation, puis
 * jusqu'à 8 nœuds fautifs (cible CSS + extrait de HTML).
 */
export async function expectNoA11yViolations(page, label) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const report = formatViolations(results.violations);
  expect(report, `violations axe (WCAG 2.2 AA) sur ${label}`).toBe('');
}

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .slice(0, 8)
        .map(
          (node) =>
            `      ${node.target.join(' ')}\n        ${node.html
              .replace(/\s+/g, ' ')
              .slice(0, 200)}`,
        )
        .join('\n');
      return `  [${violation.impact}] ${violation.id} — ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join('\n');
}

/**
 * Attend la fin de l'hydratation React.
 *
 * Les gestionnaires d'événements ne sont pas encore branchés tant que
 * l'hydratation n'est pas terminée : un clic ou une frappe envoyés avant
 * sont absorbés silencieusement, ce qui donne des faux négatifs dans les
 * tests clavier. React pose une propriété `__reactFiber$*` sur les nœuds du
 * rendu côté client : sa présence sur <main> est donc un signal fiable.
 */
export async function waitForHydration(page) {
  await page
    .waitForFunction(() => {
      const main = document.querySelector('#main');
      return !!main && Object.keys(main).some((key) => key.startsWith('__reactFiber$'));
    }, undefined, { timeout: 30_000 })
    .catch(() => {
      // Timeout : on laisse le test poursuivre pour que l'échec soit
      // attribuable au composant testé, pas à l'outillage.
    });
}

/**
 * Fait défiler la page par paliers puis revient en haut.
 *
 * Les formulaires sont chargés à la demande (next/dynamic + IntersectionObserver,
 * cf. components/forms/LazyForms.tsx) : sans défilement, ils ne sont pas encore
 * dans le DOM au moment du scan et les violations n'y seraient pas détectées.
 */
export async function revealLazyContent(page) {
  await page.waitForLoadState('load');
  await waitForHydration(page);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  });
  await settleAnimations(page);
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

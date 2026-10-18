// tests/slider-anchors.spec.mjs
//
// Vérification que chaque CTA du slider de l'accueil mène à la section
// destinée de la page services, et que le navigateur s'y POSITIONNE
// réellement (id présent + ancre tenue en présence du header sticky, du snap
// scroll strict — la page services est dans SNAP_ROUTES — et de l'animation
// de révélation `.placeholder`).
import { test, expect } from '@playwright/test';
import { waitForHydration } from './a11y/axe.mjs';

const LOCALES = ['fr', 'en', 'ar'];
// Ancres ciblées par lib/data/sliderData.tsx, dans l'ordre des diapositives
// (1 = sans ancre, 2 = #it, 3 = #marketing, 4 = #etudes).
const SLIDES = [
  { slide: 2, anchor: 'it' },
  { slide: 3, anchor: 'marketing' },
  { slide: 4, anchor: 'etudes' },
];
// Hauteur du header sticky (snap-scroll.css : --snap-header-h). Le contenu
// démarre sous lui ; l'ancre doit y reposer la section cible.
const HEADER_H = 81;

/**
 * Met en pause l'avance automatique via le bouton ⏸ du slider, pour que la
 * diapositive visée ne défile pas pendant le test. Contrairement à
 * emulateMedia({ reducedMotion: 'reduce' }), ceci garde le snap scroll ACTIF —
 * c'est justement le comportement à vérifier.
 */
async function pauseAutoplay(page) {
  await page
    .getByRole('button', {
      name: /Mettre le défilement automatique en pause|Pause the automatic rotation|إيقاف التدوير التلقائي مؤقتًا/,
    })
    .click();
}

/** Affiche la diapositive `index` (1-based) en cliquant son indicateur. */
async function goToSlide(page, index) {
  await page.locator(`#slider [class*="dots"] button`).nth(index - 1).click();
}

/**
 * Attend que la section soit réellement posée sous le header.
 *
 * On ne cherche pas une position « stable » (trompeur : le défilement est
 * animé et une lecture fige peut être prise pour le repos) mais la cible
 * elle-même : le poll recommence jusqu'à atteindre l'alignement, ce qui
 * absorbe le streaming, l'hydratation et l'animation de révélation.
 */
async function expectAligned(page, selector) {
  await expect
    .poll(
      async () => {
        const box = await page.locator(selector).boundingBox();
        if (!box) return 'section absente';
        const delta = Math.round(box.y) - HEADER_H;
        return Math.abs(delta) <= 4 ? 'ok' : `décalé de ${delta}px`;
      },
      { timeout: 15_000, intervals: [100, 150, 250, 500] }
    )
    .toBe('ok');
}

for (const locale of LOCALES) {
  test(`${locale} : chaque CTA du slider positionne sur sa section`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await waitForHydration(page);
    await pauseAutoplay(page);

    for (const { slide, anchor } of SLIDES) {
      await goToSlide(page, slide);

      const cta = page.locator(`#slider a[href="/${locale}/services#${anchor}"]`);
      await expect(cta).toBeVisible();
      await cta.click();

      await expect(page).toHaveURL(new RegExp(`/services#${anchor}$`));

      // L'id existe (un seul) et le navigateur s'y aligne SOUS le header
      const section = page.locator(`main section[id="${anchor}"]`);
      await expect(section).toHaveCount(1);
      await expectAligned(page, `main section[id="${anchor}"]`);

      // Retour à l'accueil pour le CTA suivant
      await page.goto(`/${locale}`);
      await waitForHydration(page);
      await pauseAutoplay(page);
    }
  });

  test(`${locale} : ouverture directe sur /services#ancre positionne correctement`, async ({
    page,
  }) => {
    // Scénario « lien partagé / favori » : pas de clic sur le slider.
    for (const { anchor } of SLIDES) {
      await page.goto(`/${locale}/services#${anchor}`);

      const section = page.locator(`main section[id="${anchor}"]`);
      await expect(section).toHaveCount(1);
      await expectAligned(page, `main section[id="${anchor}"]`);
    }
  });
}

test('le CTA « nos services » du slider ouvre la page services en haut', async ({ page }) => {
  await page.goto('/fr');
  await waitForHydration(page);
  await pauseAutoplay(page);

  // Première diapositive : lien sans ancre → retour en haut de la page
  const cta = page.locator('#slider a[href="/fr/services"]');
  await expect(cta).toBeVisible();
  await cta.click();

  await expect(page).toHaveURL(/\/fr\/services$/);
  // Aucun défilement : le hero services doit rester la première chose visible
  // (il démarre sous le header sticky + le fil d'Ariane, d'où la marge).
  await expect
    .poll(async () => {
      const box = await page.locator('main section[id="services-hero"]').boundingBox();
      return box ? Math.round(box.y) : null;
    }, { timeout: 10_000 })
    .toBeLessThanOrEqual(HEADER_H + 60);
});

test('les raccourcis de la page services mènent aussi à leur section', async ({ page }) => {
  // Même mécanique d'ancre, cette fois au sein d'une page déjà ouverte
  await page.goto('/fr/services');
  await waitForHydration(page);

  for (const { anchor } of SLIDES) {
    await page.locator(`main a[href="#${anchor}"]`).first().click();
    await expectAligned(page, `main section[id="${anchor}"]`);
  }
});

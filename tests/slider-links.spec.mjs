// tests/slider-links.spec.mjs
//
// Non-régression : les liens CTA des diapositives doivent être activables.
//
// Régression couverte : `setPointerCapture` était posé au `pointerdown` sur
// tout le conteneur du slider. Le navigateur redirige alors le `pointerup`
// vers le conteneur et calcule la cible du `click` comme l'ancêtre commun du
// lien et de ce conteneur (Pointer Events / UI Events — w3c/pointerevents#75).
// L'ancre du CTA ne recevait donc jamais le clic : aucun lien du slider ne
// fonctionnait sur Chrome / Edge.
//
// Deux garde-fous associés sont aussi couverts ici :
//   - l'avance automatique est gelée pendant l'appui, pour qu'une diapositive
//     ne change pas sous le doigt (l'ancre deviendrait `inert`) ;
//   - un glissement antérieur ne doit pas faire avaler le clic suivant.
import { test, expect } from '@playwright/test';
import { waitForHydration } from './a11y/axe.mjs';

const cta = (page, href) => page.locator(`#slider a[href="${href}"]`);

/**
 * Fait glisser horizontalement la piste du slider, depuis `fromRatio` vers
 * `toRatio` de la largeur du bloc, pour changer de diapositive à la main.
 */
async function dragSlider(page, fromRatio = 0.7, toRatio = 0.3) {
  const box = await page.locator('#slider').boundingBox();
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * fromRatio, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * toRatio, y, { steps: 10 });
  await page.mouse.up();
}

// Mouvement réduit = avance automatique désactivée (Slider.tsx :
// `autoPlayAvailable`) : la diapositive affichée est déterministe.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('le clic sur le CTA de la première diapositive navigue', async ({ page }) => {
  await page.goto('/fr');
  await waitForHydration(page);

  const servicesCta = cta(page, '/fr/services');
  await servicesCta.scrollIntoViewIfNeeded();
  await expect(servicesCta).toBeVisible();
  await servicesCta.click();

  await expect(page).toHaveURL(/\/fr\/services$/);
});

test('le CTA reste cliquable après un glissement de la piste', async ({ page }) => {
  await page.goto('/fr');
  await waitForHydration(page);

  await page.locator('#slider').scrollIntoViewIfNeeded();
  await dragSlider(page);

  // La glisse doit avoir affiché la diapositive suivante (« Services IT »)
  const itCta = cta(page, '/fr/services#it');
  await expect(itCta).toBeVisible();
  await itCta.click();

  await expect(page).toHaveURL(/\/fr\/services#it$/);
});

test('Entrée au clavier active le CTA, même après un glissement', async ({ page }) => {
  await page.goto('/fr');
  await waitForHydration(page);

  await page.locator('#slider').scrollIntoViewIfNeeded();
  await dragSlider(page);

  const itCta = cta(page, '/fr/services#it');
  await expect(itCta).toBeVisible();
  await itCta.focus();
  await expect(itCta).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/fr\/services#it$/);
});

test('le glissement reste possible depuis le fond d’une diapositive', async ({ page }) => {
  await page.goto('/fr');
  await waitForHydration(page);

  await page.locator('#slider').scrollIntoViewIfNeeded();
  await dragSlider(page);

  // Deuxième glisse : on est bien passé à la 3ᵉ diapositive (« Branding »)
  await dragSlider(page);
  await expect(cta(page, '/fr/services#marketing')).toBeVisible();
});

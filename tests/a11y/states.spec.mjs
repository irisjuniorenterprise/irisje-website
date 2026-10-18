// tests/a11y/states.spec.mjs
//
// Scan axe-core des états interactifs : menu mobile, accordéon ouvert,
// carte retournée, modale du portfolio et formulaire après échec de
// validation. Un scan au repos ne voit jamais ces états.
import { test, expect } from '@playwright/test';
import { expectNoA11yViolations, revealLazyContent, waitForHydration } from './axe.mjs';

test.describe('menu mobile ouvert', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fr', async ({ page }) => {
    await page.goto('/fr');
    await waitForHydration(page);
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expectNoA11yViolations(page, '/fr (menu mobile ouvert)');
  });
});

test('faq : accordéon ouvert', async ({ page }) => {
  await page.goto('/fr/faq');
  await waitForHydration(page);
  const toggle = page.getByRole('button', { name: /IRIS Junior Entreprise \?/ }).first();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expectNoA11yViolations(page, '/fr/faq (accordéon ouvert)');
});

test('a-propos : carte de valeur retournée', async ({ page }) => {
  await page.goto('/fr/a-propos');
  await revealLazyContent(page);
  const reveal = page.getByRole('button', { name: /Découvrir/ }).first();
  await reveal.scrollIntoViewIfNeeded();
  await reveal.click();
  await expect(reveal).toHaveAttribute('aria-expanded', 'true');
  await expectNoA11yViolations(page, '/fr/a-propos (carte retournée)');
});

test('a-propos : modale portfolio ouverte', async ({ page }) => {
  await page.goto('/fr/a-propos');
  await revealLazyContent(page);
  const opener = page
    .getByRole('button', { name: /Voir les détails du projet/ })
    .first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expectNoA11yViolations(page, '/fr/a-propos (modale portfolio)');
});

test('contact : erreurs de validation affichées', async ({ page }) => {
  await page.goto('/fr/contact');
  await revealLazyContent(page);
  const submit = page.getByRole('button', { name: 'Envoyer' });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();
  await expect(page.locator('#contact-nom-error')).toBeVisible();
  await expect(page.locator('p[id$="-error"]').first()).toBeVisible();
  await expectNoA11yViolations(page, '/fr/contact (erreurs de validation)');
});

test('devis : erreurs de validation affichées', async ({ page }) => {
  await page.goto('/fr/devis');
  await revealLazyContent(page);
  const submit = page.getByRole('button', { name: /Demander un devis/ });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();
  await expect(page.locator('#devis-nom-error')).toBeVisible();
  await expectNoA11yViolations(page, '/fr/devis (erreurs de validation)');
});

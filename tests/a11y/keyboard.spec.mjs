// tests/a11y/keyboard.spec.mjs
//
// Parcours clavier : lien d'évitement, accordéon, gestion du focus après un
// envoi refusé, et modale (ouverture, focal à l'intérieur, Échap, restitution).
import { test, expect } from '@playwright/test';
import { revealLazyContent, waitForHydration } from './axe.mjs';

test('le lien d’évitement est le premier arrêt de tabulation', async ({ page }) => {
  await page.goto('/fr');
  await waitForHydration(page);
  await page.keyboard.press('Tab');

  const skipLink = page.locator('a.skip-link');
  await expect(skipLink).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('faq : Entrée ouvre la question et expose le panneau', async ({ page }) => {
  await page.goto('/fr/faq');
  await waitForHydration(page);

  const toggle = page.getByRole('button', { name: /Qu’est-ce qu|Qu'est-ce qu/ }).first();
  await toggle.focus();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('contact : le focal va sur le premier champ en erreur après un envoi refusé', async ({
  page,
}) => {
  await page.goto('/fr/contact');
  await revealLazyContent(page);

  const submit = page.getByRole('button', { name: 'Envoyer' });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();

  await expect(page.locator('#contact-nom')).toBeFocused();
  await expect(page.locator('#contact-nom')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-nom')).toHaveAttribute(
    'aria-describedby',
    'contact-nom-error',
  );
  await expect(page.locator('#contact-nom-error')).toBeVisible();
});

test('contact : le message d’erreur du groupe de radios est rattaché au radiogroup', async ({
  page,
}) => {
  await page.goto('/fr/contact');
  await revealLazyContent(page);

  const submit = page.getByRole('button', { name: 'Envoyer' });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();

  const group = page.getByRole('radiogroup').first();
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await expect(group).toHaveAttribute('aria-describedby', 'contact-sujet-error');
});

test('modale portfolio : Entrée ouvre, Échap ferme et rend le focal au déclencheur', async ({
  page,
}) => {
  await page.goto('/fr/a-propos');
  await revealLazyContent(page);

  const opener = page.getByRole('button', { name: /Voir les détails du projet/ }).first();
  await opener.scrollIntoViewIfNeeded();
  await opener.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const focusInside = await page.evaluate(() => {
    const el = document.querySelector('[role="dialog"]');
    return el ? el.contains(document.activeElement) : false;
  });
  expect(focusInside, 'le focal doit entrer dans la modale').toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('carte de valeur : Échap referme et rend le focal au bouton', async ({ page }) => {
  await page.goto('/fr/a-propos');
  await revealLazyContent(page);

  const reveal = page.getByRole('button', { name: /Découvrir/ }).first();
  await reveal.scrollIntoViewIfNeeded();
  await reveal.focus();
  await page.keyboard.press('Enter');
  await expect(reveal).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(reveal).toHaveAttribute('aria-expanded', 'false');
  await expect(reveal).toBeFocused();
});

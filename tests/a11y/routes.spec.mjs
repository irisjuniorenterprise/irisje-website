// tests/a11y/routes.spec.mjs
//
// Scan axe-core de chaque route, dans les trois locales.
//
// Le 404 est scanné via une URL inexistante : le catch-all
// app/[locale]/[...rest] répond 200 avec le contenu « page introuvable ».
import { test } from '@playwright/test';
import { expectNoA11yViolations, revealLazyContent } from './axe.mjs';

const LOCALES = ['fr', 'en', 'ar'];

const ROUTES = [
  '/',
  '/a-propos',
  '/cgu',
  '/contact',
  '/devis',
  '/faq',
  '/mentions-legales',
  '/politique-confidentialite',
  // /recrutement retiré : la route sert un 308 vers la plateforme IRIS JOIN
  // (domaine externe). Playwright suivrait la redirection et scannerait un
  // site qui n'est pas le nôtre.
  '/services',
  '/route-inexistante',
];

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    test(`${locale}${route}`, async ({ page }) => {
      await page.goto(`/${locale}${route}`);
      await revealLazyContent(page);
      await expectNoA11yViolations(page, `/${locale}${route}`);
    });
  }
}

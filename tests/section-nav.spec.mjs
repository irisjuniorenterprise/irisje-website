// tests/section-nav.spec.mjs
//
// Barre « Sur cette page » (components/layout/SectionNav.tsx) : un bouton
// unique, dans le flux sous le header (donc jamais au-dessus du contenu),
// qui ouvre la liste des sections de la page. Vérifie qu'elle :
//  - ne recouvre rien et ne déborde pas, du plus petit écran au plus grand ;
//  - mène VRAIMENT à la section (header + barre sticky, snap scroll,
//    animation de révélation) et met en évidence la section courante ;
//  - se ferme au clic sur une section, avec Échap, et rend le focus ;
//  - n'apparaît pas sur les pages sans sections.
import { test, expect } from '@playwright/test';
import { waitForHydration } from './a11y/axe.mjs';

// Header sticky (81 px, 71 px sous 769 px) + barre (48 px).
const BAR_H = 48;
const headerH = (width) => (width <= 768 ? 71 : 81);

const L = {
  fr: { title: 'Sur cette page', nav: 'Sections de la page', link: 'Marketing' },
  en: { title: 'On this page', nav: 'Page sections', link: 'Marketing' },
  ar: { title: 'في هذه الصفحة', nav: 'أقسام الصفحة', link: 'التسويق' },
};
const toggleOf = (page, l) => page.getByRole('button', { name: new RegExp(l.title) });

for (const [locale, l] of Object.entries(L)) {
  test(`services (${locale}) : ouvrir, naviguer, fermer`, async ({ page }) => {
    await page.goto(`/${locale}/services`);
    await waitForHydration(page);

    const nav = page.getByRole('navigation', { name: l.nav });
    await expect(nav).toBeHidden();

    await toggleOf(page, l).click();
    await expect(nav).toBeVisible();

    await nav.getByRole('link', { name: l.link }).click();
    await expect(page).toHaveURL(/#marketing$/);
    await expect(nav).toBeHidden();
    const width = page.viewportSize().width;
    await expect
      .poll(async () =>
        Math.round(
          await page.evaluate(() => document.getElementById('marketing').getBoundingClientRect().top),
        ),
      )
      .toBeLessThanOrEqual(headerH(width) + BAR_H + 2);

    // La barre reste visible, collée sous le header, et indique la section.
    await expect(toggleOf(page, l)).toBeVisible();
    await toggleOf(page, l).click();
    await expect(nav.locator('a[aria-current="location"]')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await expect(toggleOf(page, l)).toBeFocused();
  });
}

// Du plus petit téléphone à l'écran large : aucun débordement, aucun
// chevauchement, bouton entièrement visible et de taille tactile.
for (const width of [320, 360, 390, 768, 1024, 1440]) {
  test(`barre ${width}px : ne recouvre rien, ne déborde pas`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/fr/services');
    await waitForHydration(page);

    const toggle = toggleOf(page, L.fr);
    const box = await toggle.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.height).toBeGreaterThanOrEqual(44);

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(noOverflow).toBe(true);

    // En haut de page : le contenu (main) commence sous la barre, pas dessous.
    const { barBottom, mainTop } = await page.evaluate(() => ({
      barBottom: document.querySelector('[data-section-bar]').getBoundingClientRect().bottom,
      mainTop: document.querySelector('main').getBoundingClientRect().top,
    }));
    expect(mainTop).toBeGreaterThanOrEqual(barBottom - 1);

    // Défilée : la barre se colle juste sous le header.
    await page.mouse.wheel(0, 1200);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Math.round(document.querySelector('[data-section-bar]').getBoundingClientRect().top),
        ),
      )
      .toBe(headerH(width));
  });
}

test('pages sans sections : aucune barre', async ({ page }) => {
  await page.goto('/fr/faq');
  await waitForHydration(page);
  await expect(page.getByRole('navigation', { name: L.fr.nav })).toHaveCount(0);
  await expect(toggleOf(page, L.fr)).toHaveCount(0);
});

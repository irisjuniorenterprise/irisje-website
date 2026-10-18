// playwright.config.mjs
//
// Tests d'accessibilité automatisés (axe-core).
//
// Edge est déjà installé sur la machine : `channel: 'msedge'` permet à
// Playwright de réutiliser le navigateur du système au lieu d'en
// télécharger un (aucun binaire n'est téléchargé à l'exécution).
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['list']],
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'msedge',
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
  // Le serveur de développement sert aussi à l'audit : on le réutilise s'il
  // tourne déjà (c'est le cas pendant l'audit), sinon on le lance.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

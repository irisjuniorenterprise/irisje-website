// tests/seo/seo.spec.mjs
//
// Garde-fous SEO : statut 404, canonical, hreflang, h1, en-têtes, robots,
// sitemap. À lancer avec `npm run test:seo` (le serveur dev ou `next start`
// doit répondre sur http://localhost:3000).
import { test, expect } from '@playwright/test';

const LOCALES = ['fr', 'en', 'ar'];
const PAGES = ['', '/services', '/a-propos', '/devis', '/contact', '/faq'];

test.describe('Statut HTTP', () => {
  for (const url of ['/fr/page-inexistante', '/fr/services/inexistant']) {
    test(`${url} répond 404 (pas de soft 404)`, async ({ request }) => {
      const res = await request.get(url, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
    });
  }

  test('/fr/recrutement redirige définitivement (308)', async ({ request }) => {
    const res = await request.get('/fr/recrutement', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
  });
});

test.describe('En-têtes', () => {
  test("pas d'en-tête Link hreflang (le HTML fait foi)", async ({ request }) => {
    const res = await request.get('/fr', { maxRedirects: 0 });
    const link = res.headers()['link'] ?? '';
    expect(link).not.toMatch(/hreflang/i);
  });
});

for (const locale of LOCALES) {
  for (const path of PAGES) {
    const url = `/${locale}${path}`;

    test(`balises SEO de ${url}`, async ({ page }) => {
      const res = await page.goto(url);
      expect(res?.status()).toBe(200);

      // Un seul h1, un titre non vide, une description non vide.
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).trim().length).toBeGreaterThan(10);
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect((description ?? '').trim().length).toBeGreaterThan(50);

      // Un seul canonical, absolu, qui pointe vers cette page.
      const canonicals = page.locator('link[rel="canonical"]');
      await expect(canonicals).toHaveCount(1);
      const href = await canonicals.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
      expect(new URL(href).pathname).toBe(url);

      // hreflang : les trois langues + x-default, sans doublon.
      const langs = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('hreflang')));
      for (const l of [...LOCALES, 'x-default']) expect(langs).toContain(l);
      expect(new Set(langs).size).toBe(langs.length);
    });
  }
}

// En local, robots.txt interdit tout et le sitemap est vide (hôte hors
// production : voir proxy.ts / lib/seo.ts). On simule donc l'hôte canonique.
const PROD_HOST = { 'x-forwarded-host': 'www.iris-junior-entreprise.com' };

test('robots.txt déclare le sitemap et ne bloque pas /_next/', async ({ request }) => {
  const res = await request.get('/robots.txt', { headers: PROD_HOST });
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i);
  expect(body).not.toMatch(/Disallow:\s*\/_next/i);
});

test('sitemap.xml liste les pages localisées, sans /recrutement', async ({ request }) => {
  const res = await request.get('/sitemap.xml', { headers: PROD_HOST });
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('/fr/services');
  expect(body).not.toContain('/recrutement');
});

// Données structurées : le balisage doit rester valide et « honnête ».
// Les types absents de la liste ne doivent PAS apparaître tant qu'on n'a pas
// de données réelles (avis clients, produits à prix, vidéos…) : un balisage
// Review / Product inventé expose le site à une action manuelle de Google.
const FORBIDDEN_LD_TYPES = [
  'Review',
  'AggregateRating',
  'Product',
  'VideoObject',
  'SearchAction',
];

const collectTypes = (node, out = new Set()) => {
  if (Array.isArray(node)) node.forEach((n) => collectTypes(n, out));
  else if (node && typeof node === 'object') {
    const type = node['@type'];
    for (const t of Array.isArray(type) ? type : type ? [type] : []) out.add(t);
    Object.values(node).forEach((v) => collectTypes(v, out));
  }
  return out;
};

test.describe('Données structurées JSON-LD', () => {
  for (const locale of LOCALES) {
    test(`/${locale} : Organization, LocalBusiness, WebSite, sans type interdit`, async ({ request }) => {
      const html = await (await request.get(`/${locale}`)).text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      expect(blocks.length).toBeGreaterThan(0);
      const types = collectTypes(blocks.map((m) => JSON.parse(m[1])));
      for (const t of ['Organization', 'LocalBusiness', 'WebSite', 'PostalAddress']) {
        expect(types, `${t} manquant`).toContain(t);
      }
      for (const t of FORBIDDEN_LD_TYPES) expect(types, `${t} interdit`).not.toContain(t);
    });

    test(`/${locale}/services : BreadcrumbList + OfferCatalog avec Service`, async ({ request }) => {
      const html = await (await request.get(`/${locale}/services`)).text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      const types = collectTypes(blocks.map((m) => JSON.parse(m[1])));
      for (const t of ['BreadcrumbList', 'ListItem', 'OfferCatalog', 'Service']) {
        expect(types, `${t} manquant`).toContain(t);
      }
    });
  }
});

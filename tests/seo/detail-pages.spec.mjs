// tests/seo/detail-pages.spec.mjs
//
// Garde-fous des pages de détail (services, guides) et de la couche GEO/AEO :
// uniquement des requêtes HTTP (aucun navigateur requis).
//   npm run build && npm start   (ou BASE_URL=… npm run test:seo)
import { test, expect } from '@playwright/test';

const LOCALES = ['fr', 'en', 'ar'];
const SERVICES = [
  'developpement-web',
  'developpement-mobile',
  'chatbot',
  'branding',
  'community-management',
  'etude-marche',
  'etude-notoriete',
  'etude-satisfaction',
  'business-plan',
];
const GUIDES = ['qu-est-ce-qu-une-junior-entreprise', 'cahier-des-charges-site-web'];

const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const data = JSON.parse(m[1]);
    return data['@graph'] ?? [data];
  });
const types = (html) => jsonLd(html).map((n) => n['@type']);

test.describe('Pages de détail : services et guides', () => {
  for (const locale of LOCALES) {
    for (const slug of SERVICES) {
      const url = `/${locale}/services/${slug}`;
      test(`${url}`, async ({ request }) => {
        const res = await request.get(url, { maxRedirects: 0 });
        expect(res.status()).toBe(200);
        const html = await res.text();
        expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
        expect(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]).toMatch(
          new RegExp(`${url}$`),
        );
        expect(types(html)).toEqual(expect.arrayContaining(['Service', 'FAQPage', 'BreadcrumbList']));
        // FAQ visible dans le HTML (citable par les IA), sans JavaScript.
        expect((html.match(/<details/g) ?? []).length).toBeGreaterThanOrEqual(2);
      });
    }
    for (const slug of GUIDES) {
      const url = `/${locale}/guides/${slug}`;
      test(`${url}`, async ({ request }) => {
        const res = await request.get(url, { maxRedirects: 0 });
        expect(res.status()).toBe(200);
        const html = await res.text();
        expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
        expect(types(html)).toEqual(expect.arrayContaining(['Article', 'FAQPage', 'BreadcrumbList']));
      });
    }
    test(`/${locale}/guides (index)`, async ({ request }) => {
      expect((await request.get(`/${locale}/guides`, { maxRedirects: 0 })).status()).toBe(200);
    });
  }

  test('pas de faux balisage (Review, AggregateRating, Product…)', async ({ request }) => {
    const html = await (await request.get('/fr/services/developpement-web')).text();
    for (const t of ['Review', 'AggregateRating', 'Product', 'VideoObject']) {
      expect(types(html)).not.toContain(t);
    }
  });
});

test.describe('404 localisés', () => {
  for (const locale of LOCALES) {
    test(`/${locale}/introuvable → 404 dans la bonne langue`, async ({ request }) => {
      const res = await request.get(`/${locale}/introuvable`, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
      expect(await res.text()).toContain(`<html lang="${locale}"`);
    });
  }
  test('slug de service inconnu → 404', async ({ request }) => {
    const res = await request.get('/fr/services/inconnu', { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });
});

test.describe('Un seul domaine indexable', () => {
  test('le domaine secondaire (.tn) redirige en 308 en gardant le chemin', async ({ request }) => {
    const res = await request.get('/fr/services/chatbot?x=1', {
      maxRedirects: 0,
      headers: { 'x-forwarded-host': 'www.iris-junior-entreprise.tn' },
    });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe(
      'https://www.iris-junior-entreprise.com/fr/services/chatbot?x=1',
    );
  });

  test('un hôte de preview est noindex ; le domaine de production ne l’est pas', async ({ request }) => {
    const preview = await request.get('/fr', {
      maxRedirects: 0,
      headers: { 'x-forwarded-host': 'mon-projet.vercel.app' },
    });
    expect(preview.headers()['x-robots-tag']).toMatch(/noindex/);
    const prod = await request.get('/fr', {
      maxRedirects: 0,
      headers: { 'x-forwarded-host': 'www.iris-junior-entreprise.com' },
    });
    expect(prod.headers()['x-robots-tag'] ?? '').not.toMatch(/noindex/);
  });

  test('canonical et hreflang : uniquement le domaine principal', async ({ request }) => {
    const html = await (await request.get('/fr/services')).text();
    const hrefs = [...html.matchAll(/<link rel="(?:canonical|alternate)"[^>]*href="([^"]+)"/g)].map(
      (m) => new URL(m[1]).hostname,
    );
    expect(new Set(hrefs)).toEqual(new Set(['www.iris-junior-entreprise.com']));
  });
});

test.describe('GEO / AEO', () => {
  test('robots.txt autorise les robots IA de recherche', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    for (const bot of ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot', 'GPTBot']) {
      expect(body).toContain(bot);
    }
    expect(body).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  test('/llms.txt est servi en texte et liste les services', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/text\/plain/);
    const body = await res.text();
    expect(body).toContain('/fr/services/developpement-web');
  });

  test('le sitemap contient les pages de détail avec hreflang', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    for (const slug of SERVICES) expect(body).toContain(`/fr/services/${slug}`);
    for (const slug of GUIDES) expect(body).toContain(`/en/guides/${slug}`);
    expect(body).toContain('hreflang="ar"');
  });
});

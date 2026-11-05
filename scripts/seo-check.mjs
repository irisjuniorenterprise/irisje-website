#!/usr/bin/env node
// scripts/seo-check.mjs
//
// Phase 0 : vérifie EN PRODUCTION les causes classiques de désindexation ou de
// chute de classement. Aucune dépendance. Usage :
//   node scripts/seo-check.mjs https://www.iris-junior-entreprise.com
//   npm run seo:check -- https://www.iris-junior-entreprise.com
//
// Contrôles : statuts, redirections (apex / .tn / sans préfixe de langue),
// X-Robots-Tag, <meta robots>, canonical, hreflang, robots.txt (pas de
// « Disallow: / »), sitemap, JSON-LD, temps de réponse du serveur.
const base = (process.argv[2] ?? 'https://www.iris-junior-entreprise.com').replace(/\/$/, '');
const host = new URL(base).hostname;
const apex = host.replace(/^www\./, '');
const isLocal = host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host);
const results = [];
const ok = (label, detail = '') => results.push(['OK  ', label, detail]);
const ko = (label, detail = '') => results.push(['FAIL', label, detail]);
const warn = (label, detail = '') => results.push(['WARN', label, detail]);
const check = (cond, label, detail) => (cond ? ok(label) : ko(label, detail));

const get = async (url, init = {}) => {
  const t0 = performance.now();
  const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Googlebot/2.1 (seo-check)' }, ...init });
  return { res, ms: Math.round(performance.now() - t0) };
};

// 1. Pages clés
for (const path of ['/fr', '/fr/services', '/fr/services/developpement-web', '/en', '/ar']) {
  const { res, ms } = await get(base + path);
  const html = res.status === 200 ? await res.text() : '';
  check(res.status === 200, `${path} répond 200`, `statut ${res.status}`);
  if (res.status !== 200) continue;
  const xrt = res.headers.get('x-robots-tag') ?? '';
  check(!/noindex/i.test(xrt), `${path} sans X-Robots-Tag noindex`, `en-tête : ${xrt}`);
  const metaRobots = html.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? '';
  check(!/noindex/i.test(metaRobots), `${path} sans <meta robots> noindex`, `meta : ${metaRobots}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const canonicalOk = isLocal
    ? !!canonical && new URL(canonical).pathname === path // en local, l'origine est celle de production
    : canonical === base + path;
  check(canonicalOk, `${path} canonical = URL`, `canonical : ${canonical}`);
  check(/hrefLang="x-default"|hreflang="x-default"/i.test(html), `${path} hreflang x-default présent`);
  check(/application\/ld\+json/.test(html), `${path} JSON-LD présent`);
  (ms < 600 ? ok : warn)(`${path} temps de réponse`, `${ms} ms (cible < 600 ms ; le rendu statique/CDN fait < 200 ms)`);
  const cache = res.headers.get('x-vercel-cache') ?? res.headers.get('x-nextjs-cache') ?? res.headers.get('cf-cache-status');
  if (cache) ok(`${path} cache CDN`, cache);
}

// 2. robots.txt
{
  const { res } = await get(base + '/robots.txt');
  const body = await res.text();
  check(res.status === 200, 'robots.txt répond 200');
  check(!/^\s*Disallow:\s*\/\s*$/im.test(body), "robots.txt ne bloque pas tout le site", 'Disallow: / trouvé !');
  check(/Sitemap:\s*\S+/i.test(body), 'robots.txt déclare le sitemap');
  check(!/Disallow:\s*\/_next/i.test(body), 'robots.txt ne bloque pas /_next/');
}

// 3. sitemap
{
  const { res } = await get(base + '/sitemap.xml');
  const body = await res.text();
  const count = (body.match(/<loc>/g) ?? []).length;
  check(res.status === 200 && count > 0, 'sitemap.xml non vide', `statut ${res.status}, ${count} URL`);
  ok('sitemap : nombre d’URL', String(count));
  const hosts = new Set([...body.matchAll(/<loc>https?:\/\/([^/]+)/g)].map((m) => m[1]));
  check(hosts.size === 1, 'sitemap : un seul domaine', [...hosts].join(', '));
}

// 4. Redirections de domaine
for (const [from, expectTo] of [
  ...(isLocal
    ? []
    : [
        [`https://${apex}/fr`, `${base}/fr`],
        ['https://www.iris-junior-entreprise.tn/fr', `${base}/fr`],
        ['https://iris-junior-entreprise.tn/fr', `${base}/fr`],
      ]),
  [`${base}/`, null],
  [`${base}/services`, `${base}/fr/services`],
]) {
  try {
    const { res } = await get(from);
    const rawLoc = res.headers.get('location');
    const loc = rawLoc ? new URL(rawLoc, from).href : rawLoc;
    if (expectTo) {
      check([301, 308].includes(res.status) && loc === expectTo, `${from} → ${expectTo}`, `statut ${res.status}, location ${loc}`);
    } else {
      check([301, 302, 307, 308].includes(res.status), `${from} redirige vers une langue`, `statut ${res.status}`);
    }
  } catch (e) {
    warn(`${from} injoignable`, String(e.cause?.code ?? e.message));
  }
}

// 5. 404 réels
{
  const { res } = await get(base + '/fr/page-qui-n-existe-pas');
  check(res.status === 404, 'URL inconnue → 404 (pas de soft 404)', `statut ${res.status}`);
}

// 6. llms.txt (optionnel)
{
  const { res } = await get(base + '/llms.txt');
  (res.status === 200 ? ok : warn)('/llms.txt', `statut ${res.status}`);
}

for (const [level, label, detail] of results) console.log(`${level}  ${label}${detail ? ` — ${detail}` : ''}`);
const failures = results.filter(([l]) => l === 'FAIL').length;
console.log(`\n${failures === 0 ? '✔ Aucun blocage technique détecté.' : `✖ ${failures} problème(s) à corriger.`}`);
console.log('Étape suivante : Search Console → Pages (indexation) et Inspection d’URL (voir docs/SEO-GEO-AEO.md).');
process.exit(failures === 0 ? 0 : 1);

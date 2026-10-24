# Changements SEO (design inchangé)

| Fichier | Changement |
|---|---|
| `proxy.ts` | **Vrai 404** pour les URL inconnues sous `/fr`, `/en`, `/ar` (elles répondaient 200 : soft 404). Même page `not-found.tsx`, localisée. `alternateLinks: false` : supprime l'en-tête HTTP `Link` hreflang de next-intl, qui contredisait le HTML et le sitemap (.tn). |
| `next.config.js` | `Cache-Control` d'un jour (+ revalidation) sur `/geojson`, `/slider`, `/portfolio` et les logos/images de `public/`. Formats d'image AVIF/WebP. Suppression de `images.domains` (déprécié). |
| `messages/{fr,en,ar}.json` | Titres et descriptions réécrits avec mots-clés (accueil, services, devis, contact, à propos, FAQ). Pages légales inchangées. |
| `app/layout.tsx`, `app/[locale]/layout.tsx`, `public/manifest.json` | Slogan unifié : plus de « Propulsez / Boostez » contradictoires. |
| `app/[locale]/**/page.tsx` | `alt=""` sur le logo décoratif du hero (le logo du header porte déjà le nom de la marque). |
| `tests/seo/seo.spec.mjs` + `npm run test:seo` | Garde-fous : 404, 308 de /recrutement, absence d'en-tête `Link`, canonical unique, hreflang, h1 unique, robots, sitemap. |

## Vérifié sur un build de production
`tsc` et `next build` passent. Testé avec `next start` : URL inconnues = 404, `/fr/recrutement` = 308,
pas d'en-tête `Link`, en-têtes de cache présents, un seul `h1` et un seul canonical par page, hreflang complet.
Les tests Playwright qui ouvrent un navigateur (balises par page) n'ont pas pu être lancés ici (Edge absent).

## Non traité (hors design / hors code)
- Pages dédiées par service, portfolio réel, études de cas, blog : c'est le plus gros levier de classement.
- Toutes les pages restent rendues à la demande (`getRequestSite()` lit les en-têtes).
- `package-lock.json` n'est pas synchronisé avec `package.json` (`npm ci` échoue : `@swc/helpers` manquant) : lancez `npm install` et committez le lock.
- Google Business Profile (Sfax) et backlinks.

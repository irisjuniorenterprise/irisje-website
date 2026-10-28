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

## Données structurées (rapports « Améliorations » Search Console, 2026)
| Fichier | Changement |
|---|---|
| `components/seo/PageJsonLd.tsx` | Type `LocalBusiness` ajouté à l'organisation (accueil). Chaque `Service` du catalogue reçoit `url` (ancre de sa section), `serviceType` et `areaServed`. Commentaire d'en-tête documentant les types retenus / écartés. |
| `tests/seo/seo.spec.mjs` | Garde-fous JSON-LD : Organization / LocalBusiness / WebSite présents, BreadcrumbList + OfferCatalog sur `/services`, et **aucun** `Review`, `AggregateRating`, `Product`, `VideoObject`, `SearchAction`. |

**Conservé** : `BreadcrumbList` (seul rapport pertinent), `Organization`/`LocalBusiness`/`WebSite`, `OfferCatalog`.
**FAQPage** : conservé. Google n'affiche plus les résultats enrichis FAQ depuis le 07/05/2026 et le rapport a disparu de Search Console en juin ; le balisage reste valide et sans effet négatif. Ne pas s'attendre à voir « FAQ » dans Search Console.
**Non applicable** : Product, Merchant listings, Review snippets, Video, AMP (pas de produit à prix, pas d'avis publiés, pas de vidéo, pas d'AMP) ; `SearchAction` (retiré, pas de recherche interne).

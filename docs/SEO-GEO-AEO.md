# SEO · GEO · AEO — guide de pilotage

Ce document complète `CHANGES-SEO.md`. Il couvre ce que le **code** ne peut pas
faire à votre place (Search Console, profils, liens, mesure) et explique ce qui a
été mis en place dans le code.

> Principe directeur. Google indique que le GEO et l'AEO restent du SEO : il
> n'exige ni fichier ni balisage « spécial IA » pour apparaître dans ses réponses
> génératives. Ce qui compte : un site **indexé proprement**, **rapide**, au
> **contenu utile et vérifiable**, et une **entité (marque) cohérente** sur le web.

## 1. Ce qui a été fait dans le code

| Sujet | Avant | Après |
|---|---|---|
| Domaines | `.com` et `.tn` indexés avec le même contenu | Un seul domaine indexé ; le `.tn` redirige en 308 (`NEXT_PUBLIC_REDIRECT_SITE_URLS`) |
| Rendu | Toutes les pages dynamiques (lecture de `headers()`/`cookies()`) | Pages prérendues (SSG) + régénération horaire ; cache CDN |
| Écran de chargement | 1,2 s minimum à chaque page (ajoutait ~1,2 s au LCP) | 0,3 s |
| Contenu | 5 pages utiles | + 9 pages de service × 3 langues + 2 guides × 3 langues + index |
| JSON-LD | Organization, WebSite, OfferCatalog, FAQ | + `Service`, `Article`, `FAQPage` par page, `foundingLocation`, `hasMap` |
| Robots | `*` seulement | + robots IA de recherche et d'entraînement listés explicitement |
| `llms.txt` | absent | généré depuis les mêmes données (effet incertain, coût nul) |
| 404 | not-found racine dynamique | 404 localisés (FR/EN/AR) dans le layout de langue, statut 404 |
| Erreurs | aucune page d'erreur | `error.tsx` + `global-error.tsx` trilingues |
| GeoJSON | 1,9 Mo | 0,5 Mo |

### Revenir au double domaine (déconseillé)
Dans l'environnement : `NEXT_PUBLIC_REDIRECT_SITE_URLS=` (vide) et
`NEXT_PUBLIC_ALTERNATE_SITE_URLS=https://www.iris-junior-entreprise.tn`.

## 2. Phase 0 — Diagnostic (à faire en premier)

1. **Après déploiement**, lancez : `npm run seo:check -- https://www.iris-junior-entreprise.com`
   Il vérifie noindex, canonical, robots.txt, sitemap, redirections, 404, temps de réponse.
2. **Search Console** (propriété *Domaine* si possible) :
   - *Pages* : repérez « Autre page avec balise canonique », « Doublon, Google a choisi une
     autre URL », « Exclue par la balise noindex », « Explorée, actuellement non indexée ».
   - *Inspection d'URL* sur `/fr` : « URL canonique choisie par Google » doit être
     `https://www.iris-junior-entreprise.com/fr`.
   - *Sitemaps* : soumettez `https://www.iris-junior-entreprise.com/sitemap.xml`.
   - Ajoutez aussi la propriété **.tn** : elle permet de suivre la fusion des signaux.
3. **Requête de marque** : tapez « IRIS Junior Entreprise » (et « IRIS Junior Entreprise Sfax »).
   - Absent même sur la marque → problème technique / de canonical (étape 2).
   - Présent sur la marque mais pas sur les requêtes génériques → problème de contenu et d'autorité (phases 2–3).
4. **PageSpeed Insights** (mobile) sur `/fr` et `/fr/services` : visez LCP < 2,5 s, CLS < 0,1, INP < 200 ms.
5. **Patience** : après une refonte (URLs, redirections, domaines), comptez plusieurs
   semaines avant stabilisation. Ne retouchez pas les titres en continu.

## 3. Phase 3 — Autorité et entité (hors code)

L'entité = « IRIS Junior Entreprise » doit être décrite **de façon identique** partout.

**Fiche d'identité de référence (à copier telle quelle partout)**
- Nom : IRIS Junior Entreprise (alias : IRIS JE)
- Description courte : « Junior-entreprise de l'ENIS (Sfax), fondée en 2014 : développement web et mobile, chatbots, branding, community management, études de marché et business plans. »
- Adresse : ENIS, Route Soukra Km 3.5, 3038 Sfax, Tunisie
- Email, téléphone : ceux de `ORGANIZATION` dans `lib/seo.ts`
- Site : `https://www.iris-junior-entreprise.com`

**Checklist**
- [ ] **Google Business Profile** : créer/revendiquer la fiche (catégorie « Agence de développement Web » ou « Société de conseil »), même adresse, site, horaires. Activer la messagerie.
- [ ] Profils **LinkedIn, Facebook, Instagram, X, GitHub, TikTok** : même nom, même description, lien vers le site (déjà listés dans `sameAs`).
- [ ] **Bing Webmaster Tools** : ajouter le site et soumettre le sitemap (plusieurs assistants s'appuient sur l'index Bing). Variable : `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
- [ ] **Liens entrants de qualité** (priorité haute, c'est ce qui fait monter une jeune marque) :
  - site de l'**ENIS** et de l'Université de Sfax (page « clubs / junior-entreprise ») ;
  - **JET** (Junior Enterprises of Tunisia) et réseaux de junior-entreprises ;
  - partenaires, clients, sponsors (page « Ils nous font confiance » chez eux, avec lien) ;
  - presse et médias locaux (communiqué à chaque événement ou milestone) ;
  - annuaires sérieux (pas de fermes de liens).
- [ ] **Wikidata** : créer un élément pour l'organisation *si* des sources indépendantes la mentionnent (articles de presse). Ne rien publier sans source.
- [ ] **Avis Google** réels de clients satisfaits (ne jamais en inventer, ni les baliser en JSON-LD sans les afficher).
- [ ] **Réalisations** : publier de vraies études de cas (contexte → solution → résultat chiffré) dans `/realisations`, avec l'accord des clients. C'est le contenu qui manque le plus.

## 4. Phase 2 — Contenu : comment l'étendre

- Services : modifier `lib/data/servicesContent.{fr,en,ar}.ts`.
- Guides : ajouter un slug dans `GUIDE_SLUGS` (`lib/data/servicesIndex.ts`), son titre court
  (`GUIDE_TITLES`) et son contenu dans `lib/data/guides.ts` → URL, sitemap, hreflang,
  fil d'Ariane et JSON-LD sont automatiques. Pensez aussi à la clé `Breadcrumb.routes`
  dans `messages/*.json` (`/guides/<slug>`).
- ⚠️ Le contenu livré a été rédigé à partir des informations du projet : **faites-le
  relire** (livrables, déroulé de mission, formulations) avant publication.
- Sujets de guides à fort potentiel local : « combien coûte un site web en Tunisie »
  (avec de vrais prix/fourchettes de l'équipe), « comment choisir une agence web à Sfax »,
  « étude de marché : par où commencer », « business plan : modèle et erreurs », « community
  management : planning éditorial type ».

## 5. Phase 4 — Règles d'écriture GEO / AEO

1. **Réponse d'abord** : chaque page ouvre sur 40–60 mots qui répondent directement à la question du titre (c'est le passage cité).
2. **Titres = questions réelles** (« Combien coûte… ? », « Quelle différence entre… ? »).
3. **Faits précis, datés, sourcés** : chiffres, dates, noms, lieux. Pas d'adjectifs creux.
4. **Un fait = une phrase autonome** (compréhensible sans le contexte), facile à citer.
5. **FAQ réelles** : reprenez les vraies questions reçues par mail/téléphone.
6. **Cohérence** : mêmes faits (année de fondation, adresse, services) sur toutes les pages et tous les profils.
7. **Mise à jour visible** : date de mise à jour (déjà affichée sur les guides) ; mettez-la à jour quand le contenu change réellement.
8. **Ne pas inventer** : aucun faux avis, prix, chiffre, client. Les IA et Google recoupent.

## 6. Mesurer (mensuel)

**SEO** — Search Console : impressions, clics, position moyenne sur 10 requêtes cibles,
pages indexées, Core Web Vitals.

**GEO / AEO** — testez ces 15 questions dans ChatGPT (avec recherche), Gemini, Perplexity
et Claude ; notez si IRIS est **cité**, **recommandé** ou **absent**, et quelle page est source :

1. Qu'est-ce qu'une junior-entreprise en Tunisie ?
2. Quelles sont les junior-entreprises à Sfax ?
3. Où faire développer un site web à Sfax ?
4. Agence ou junior-entreprise pour créer une application mobile en Tunisie ?
5. Qui peut réaliser une étude de marché en Tunisie pour une startup ?
6. IRIS Junior Entreprise : que fait-elle ?
7. Comment obtenir un devis de site web à Sfax ?
8. Comment rédiger un cahier des charges de site web ?
9. Qui crée des chatbots pour entreprises en Tunisie ?
10. Où faire créer un logo et une charte graphique à Sfax ?
11. Qui peut m'aider à rédiger un business plan en Tunisie ?
12. Community management pour PME à Sfax : à qui s'adresser ?
13. Que propose la junior-entreprise de l'ENIS ?
14. Comment faire une étude de satisfaction client ?
15. Meilleures junior-entreprises tunisiennes en IT

Consignez le résultat dans un tableau (date · moteur · question · cité oui/non · source).
La visibilité IA est **probabiliste** : répétez 2–3 fois et suivez la tendance, pas un test isolé.

## 7. Limites assumées
- Aucun balisage ne **garantit** une citation par une IA ni un classement Google.
- `llms.txt` : Google ne l'utilise pas ; effet non démontré ailleurs (coût nul, donc conservé).
- Le rendu des nouvelles pages (mise en page) n'a pas été vérifié visuellement dans un navigateur : contrôlez-les (mobile et arabe/RTL) avant la mise en ligne.

<div align="center">
<img src="public/horiz-logo.png" alt="IRIS Junior Entreprise" width="320" />
<br />
<br />
# Site Web Officiel — IRIS Junior Entreprise
 
**Plateforme web multilingue (FR / EN / AR) de la Junior-Entreprise de l'ENIS**
 
<br />
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![next-intl](https://img.shields.io/badge/next--intl-1a3969?style=for-the-badge&logo=next.js&logoColor=white)
![Licence MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg?style=for-the-badge)
 
<br />
[🌐 Site en ligne](https://irisje.com) · [📋 Wiki](../../wiki) · [🐛 Signaler un bug](../../issues) · [💡 Proposer une amélioration](../../issues)
 
</div>
---
 
## 📋 Table des matières
 
- [À propos du projet](#-à-propos-du-projet)
- [Technologies utilisées](#️-technologies-utilisées)
- [Installation](#️-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)
- [Licence](#-licence)
- [Contact](#-contact)
---
 
## 🚀 À propos du projet
 
**IRIS Junior Entreprise** est la Junior-Création de l'École Nationale d'Ingénieurs de Sfax (ENIS), fondée en 2014. Elle accompagne entreprises, startups et porteurs de projets dans leurs besoins en IT, Marketing et Études stratégiques.
 
Ce dépôt contient le **site web officiel** de l'association — conçu pour centraliser l'information institutionnelle, valoriser les réalisations de l'équipe et fluidifier les échanges avec clients, partenaires et futurs membres.
 
### Ce que le site offre
 
| Fonctionnalité | Description |
|----------------|-------------|
| 🏛️ Présentation institutionnelle | Mission, vision, valeurs et organigramme de l'association |
| ⚙️ Catalogue de services | Prestations détaillées en IT, Marketing et Études |
| 📬 Formulaire de contact | Canal de communication direct avec l'équipe |
| 💼 Demande de devis | Formulaire personnalisé pour les prospects |
| 🎓 Espace recrutement | Candidature en ligne (ouvert en octobre) |
| ❓ FAQ | Réponses aux questions les plus fréquentes |
| 📄 Pages légales | Mentions légales, CGU, politique de confidentialité |
| 🌍 Multilingue | Français, Anglais, Arabe — avec support RTL natif |
 
---
 
## 🛠️ Technologies utilisées
 
| Technologie | Rôle | Version |
|-------------|------|---------|
| **Next.js** | Framework principal — App Router | 16 |
| **TypeScript** | Langage de développement typé | — |
| **React** | Bibliothèque UI | 19 |
| **next-intl** | Internationalisation (i18n) | — |
| **react-hook-form** | Gestion et contrôle des formulaires | — |
| **Zod** | Validation des données côté client | — |
| **CSS Modules** | Styles encapsulés par composant | — |
| **Git / GitHub** | Versionnement et collaboration | — |
 
---
 
## ⚙️ Installation
 
### Prérequis
 
- **Node.js** v18 ou supérieur
- **npm**, **yarn** ou **pnpm**
- **Git**
### Étapes
 
```bash
# 1. Cloner le dépôt
git clone https://github.com/irisjuniorentreprise/irisje-website.git
 
# 2. Accéder au dossier du projet
cd irisje-website
 
# 3. Installer les dépendances
npm install
 
# 4. Configurer les variables d'environnement
cp .env.example .env.local
# → Éditer .env.local avec les valeurs appropriées
 
# 5. Lancer le serveur de développement
npm run dev
```
 
L'application est accessible sur **[http://localhost:3000](http://localhost:3000)**
 
> ⚠️ Le fichier `.env.local` ne doit jamais être commité. Il est exclu du dépôt via `.gitignore`.
 
---
 
## 🖥️ Utilisation
 
### Navigation principale
 
| Page | Description |
|------|-------------|
| **Accueil** | Présentation de l'association avec slider dynamique |
| **À propos** | Mission, vision, valeurs et équipe |
| **Services** | Catalogue des prestations en IT, Marketing et Études |
| **Devis** | Formulaire de demande de devis personnalisé |
| **Recrutement** | Formulaire de candidature (ouvert en octobre) |
| **FAQ** | Foire aux questions |
| **Contact** | Formulaire de contact direct |
 
### Commandes disponibles
 
```bash
# Mode développement (hot reload)
npm run dev
 
# Build de production
npm run build
 
# Démarrer en mode production
npm start
 
# Vérification du code (linting)
npm run lint
```
 
---
 
## 📂 Structure du projet
 
```
irisje/
├── app/                                    # Application Next.js (App Router)
│   ├── [locale]/                           # Routes internationalisées (fr / en / ar)
│   │   ├── layout.tsx                      # Layout avec configuration i18n
│   │   ├── page.tsx                        # Page d'accueil
│   │   ├── a-propos/                       # Page À propos
│   │   ├── contact/                        # Page Contact
│   │   ├── devis/                          # Page Devis
│   │   ├── faq/                            # Page FAQ
│   │   ├── recrutement/                    # Page Recrutement
│   │   ├── services/                       # Page Services
│   │   ├── mentions-legales/               # Mentions légales
│   │   ├── cgu/                            # Conditions générales d'utilisation
│   │   └── politique-confidentialite/      # Politique de confidentialité
│   ├── layout.tsx                          # Root layout global
│   ├── not-found.tsx                       # Page 404 personnalisée
│   ├── globals.css                         # Styles globaux
│   └── not-found.css                       # Styles de la page 404
│
├── components/                             # Composants réutilisables
│   ├── layout/                             # Header et Footer
│   ├── forms/                              # Formulaires (Contact, Devis, Recrutement)
│   ├── ui/                                 # Composants UI (Breadcrumb, Slider, Slogan)
│   ├── faq/                                # Accordéon FAQ
│   ├── portfolio/                          # Section Portfolio
│   ├── recruitment/                        # Composant recrutement fermé
│   └── icons/                              # Bibliothèque d'icônes SVG
│
├── i18n/                                   # Configuration de l'internationalisation
│   ├── config.ts                           # Locales et paramètres i18n
│   └── request.ts                          # Configuration next-intl
│
├── lib/                                    # Logique partagée et utilitaires
│   ├── data/                               # Données statiques (slider…)
│   ├── utils/                              # Fonctions utilitaires (dates…)
│   └── metadata.ts                         # Métadonnées SEO centralisées
│
├── messages/                               # Fichiers de traduction JSON
│   ├── fr.json                             # Traductions françaises
│   ├── en.json                             # Traductions anglaises
│   └── ar.json                             # Traductions arabes
│
├── public/                                 # Assets publics (images, favicon…)
│   ├── logo-iris.png
│   ├── logo-s-no-bg.png
│   └── horiz-logo.png
│
├── middleware.ts                           # Middleware de routage i18n
├── package.json
└── CONTRIBUTING.md
```
 
---
 
## 📍 Roadmap
 
### ✅ Phase 1 — Initialisation du projet
- [x] Configuration Next.js 16 avec App Router
- [x] Mise en place de next-intl (FR, EN, AR)
- [x] Support RTL natif pour l'arabe
- [x] Structure de dossiers et architecture du projet
- [x] Styles globaux et variables CSS
### ✅ Phase 2 — Pages principales
- [x] Page d'accueil avec slider dynamique
- [x] Page À propos (mission, vision, valeurs)
- [x] Page Services (IT, Marketing, Études)
- [x] Page Contact
- [x] Page Devis
- [x] Page FAQ
- [x] Page Recrutement
- [x] Pages légales (mentions légales, CGU, politique de confidentialité)
### ✅ Phase 3 — Composants
- [x] Header responsive avec navigation et menu mobile
- [x] Footer avec liens et réseaux sociaux
- [x] Breadcrumb
- [x] Slider
- [x] Slogan
- [x] Formulaires (Contact, Devis, Recrutement)
- [x] FAQ Accordéon
- [x] Portfolio
- [x] Page 404 personnalisée
- [x] ClientSideEffects (scrollspy, reveal)
### 🚧 Phase 4 — Optimisations (en cours)
- [ ] Correction des métadonnées (namespace incorrect)
- [ ] Correction du statut recrutement défini en dur
- [ ] Optimisation des formulaires (composant `FormField` mutualisé)
- [ ] Refactor `ClientSideEffects` (suppression des variables globales)
- [ ] Migration vers `next/image` dans le Portfolio
- [ ] Ajout des fichiers `error.tsx` et `loading.tsx`
### 📅 Phase 5 — Déploiement (planifié)
- [ ] Déploiement sur Vercel
- [ ] Configuration du domaine personnalisé
- [ ] Mise en place du monitoring
- [ ] Tests de performance et SEO (Lighthouse ≥ 90)
---
 
## 🤝 Contribution
 
Les contributions sont les bienvenues. Merci de suivre le workflow défini ci-dessous pour maintenir la cohérence du projet.
 
### GitHub Flow
 
```bash
# 1. Forker le projet et cloner votre fork
git clone https://github.com/votre-username/irisje-website.git
 
# 2. Créer une branche de fonctionnalité
git checkout -b feature/US-XX-nom-de-la-fonctionnalite
 
# 3. Effectuer vos modifications et commiter
git commit -m "feat(module): description précise de la modification"
 
# 4. Pousser la branche sur votre fork
git push origin feature/US-XX-nom-de-la-fonctionnalite
 
# 5. Ouvrir une Pull Request vers la branche main
# → Minimum 1 approbation requise avant le merge
```
 
### Convention de commits
 
Le projet suit le standard **[Conventional Commits](https://www.conventionalcommits.org/)** :
 
| Préfixe | Usage |
|---------|-------|
| `feat` | Ajout d'une nouvelle fonctionnalité |
| `fix` | Correction d'un bug |
| `docs` | Mise à jour de la documentation |
| `style` | Modifications CSS / UI sans impact fonctionnel |
| `refactor` | Réécriture de code sans changement de comportement |
| `chore` | Tâches de configuration ou de maintenance |
 
> Pour plus de détails, consulter le fichier [CONTRIBUTING.md](CONTRIBUTING.md).
 
---
 
## 📄 Licence
 
Distribué sous la licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.
 
---
 
## ✉️ Contact
 
**IRIS Junior Entreprise**
 
📧 [iris.juniorentreprise@gmail.com](mailto:iris.juniorentreprise@gmail.com)
🐦 [@IRIS_JE](https://twitter.com/IRIS_JE)
🔗 [github.com/irisjuniorentreprise](https://github.com/irisjuniorentreprise)
🌐 [irisje.com](https://irisje.com)
 
---
 
<div align="center">
Fait avec ❤️ par l'équipe **IRIS Junior Entreprise**
 
**#ToTheNEXTLevel 🚀**
 
</div>
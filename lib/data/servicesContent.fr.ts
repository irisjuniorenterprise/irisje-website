// lib/data/servicesContent.fr.ts
// Contenu éditorial FR des pages de détail des services.
// ⚠️ À relire et valider par l'équipe IRIS (livrables, déroulé, formulations).
import { PRESTATIONS } from './prestations';
import type { ServiceContent, ServiceSlug, ServiceUi } from './servicesIndex';

export const UI_FR: ServiceUi = {
  quickAnswer: 'En bref',
  whatYouGet: 'Ce que vous obtenez',
  forWhomTitle: 'Pour qui ?',
  processTitle: 'Comment se déroule une mission',
  processSteps: [
    { title: 'Échange et cadrage', text: 'Vous décrivez votre besoin, nous précisons les objectifs, le périmètre et le délai.' },
    { title: 'Devis personnalisé', text: 'Vous recevez une proposition chiffrée adaptée à votre projet et à votre budget.' },
    { title: 'Réalisation', text: "L'équipe réalise la mission avec des points d'étape pour valider chaque avancée." },
    { title: 'Livraison et suivi', text: 'Nous livrons les résultats, vous les présentons et restons disponibles pour les ajustements.' },
  ],
  faqTitle: 'Questions fréquentes',
  ctaTitle: 'Parlons de votre projet',
  ctaText: 'Décrivez votre besoin en quelques lignes : nous vous répondons avec un devis personnalisé.',
  ctaButton: 'Demander un devis',
  otherServices: 'Autres prestations',
  allServices: 'Voir tous les services',
  guidesTitle: 'Guides pratiques',
  byline: "IRIS Junior Entreprise, junior-entreprise de l'ENIS à Sfax",
  titleSuffix: 'IRIS Junior Entreprise',
};

export const SERVICES_FR: Record<ServiceSlug, ServiceContent> = {
  [PRESTATIONS.web]: {
    h1: 'Développement web à Sfax et en Tunisie',
    summary: "Site vitrine, e-commerce ou plateforme web sur mesure, réalisés par les étudiants-ingénieurs d'IRIS Junior Entreprise (ENIS, Sfax). Devis personnalisé.",
    answer: "IRIS Junior Entreprise conçoit et développe des sites vitrines, des boutiques en ligne, des plateformes et des applications web sur mesure pour les startups, PME et associations. Les projets sont réalisés par des étudiants-ingénieurs de l'ENIS à Sfax, sur la base d'un devis personnalisé.",
    deliverables: [
      'Cahier des charges et maquettes validés avec vous',
      "Développement du site ou de l'application web",
      'Version adaptée aux mobiles et pensée pour le référencement naturel (SEO)',
      'Mise en ligne et transmission des accès',
    ],
    forWhom: [
      'Startups qui lancent leur site ou leur première version de produit',
      'PME et associations qui créent ou refondent leur présence en ligne',
    ],
    faq: [
      { q: "Que peut-on faire développer par IRIS Junior Entreprise ?", a: "Des sites vitrines, des sites e-commerce, des plateformes de réservation ou de gestion et des applications web sur mesure. Décrivez votre besoin dans le formulaire de devis : l'équipe vous répond avec une proposition adaptée." },
      { q: 'Comment obtenir un devis pour un site web ?', a: "Remplissez le formulaire de devis en indiquant votre projet, votre budget et le délai souhaité. IRIS Junior Entreprise vous répond par email avec une proposition personnalisée." },
    ],
  },
  [PRESTATIONS.mobile]: {
    h1: 'Développement mobile à Sfax et en Tunisie',
    summary: "Applications mobiles Android et iOS sur mesure, de la maquette à la publication, par les étudiants-ingénieurs d'IRIS Junior Entreprise (ENIS, Sfax).",
    answer: "IRIS Junior Entreprise développe des applications mobiles sur mesure pour Android et iOS : de la définition des fonctionnalités à la maquette, puis au développement et à la publication. Un devis personnalisé est établi après l'étude de votre besoin.",
    deliverables: [
      'Définition des fonctionnalités et parcours utilisateur',
      "Maquettes de l'interface validées avec vous",
      "Développement et tests de l'application",
      'Accompagnement à la publication sur les stores',
    ],
    forWhom: [
      'Startups qui veulent tester une idée avec une première application',
      'Entreprises qui veulent offrir un service mobile à leurs clients',
    ],
    faq: [
      { q: 'Peut-on faire une application pour Android et iOS ?', a: "Oui. Le choix de la technologie dépend de votre besoin et de votre budget : nous le définissons ensemble lors de l'échange de cadrage, avant le devis." },
      { q: "Que préparer avant de demander un devis d'application mobile ?", a: "Une description de l'objectif, des utilisateurs visés et des fonctionnalités essentielles suffit pour démarrer. L'équipe vous aide à préciser le reste." },
    ],
  },
  [PRESTATIONS.chatbot]: {
    h1: 'Création de chatbot pour votre entreprise',
    summary: "Chatbot sur mesure pour répondre automatiquement à vos clients (site web, messagerie), réalisé par IRIS Junior Entreprise, ENIS Sfax. Devis personnalisé.",
    answer: "Un chatbot répond automatiquement aux questions de vos clients, à toute heure, sur votre site ou vos messageries. IRIS Junior Entreprise conçoit des chatbots sur mesure : scénarios de conversation, intégration à vos canaux et tests, sur la base d'un devis personnalisé.",
    deliverables: [
      'Définition des questions et des scénarios de conversation',
      'Conception et développement du chatbot',
      'Intégration à votre site ou à vos canaux de messagerie',
      'Tests et ajustements avant la mise en service',
    ],
    forWhom: [
      'Entreprises qui reçoivent beaucoup de questions répétitives',
      'Équipes qui veulent proposer une assistance en dehors des horaires de bureau',
    ],
    faq: [
      { q: "À quoi sert un chatbot pour une entreprise ?", a: "Il répond automatiquement aux questions fréquentes, oriente les visiteurs vers le bon service et collecte des demandes, ce qui libère du temps à votre équipe." },
      { q: "Sur quels canaux peut-on intégrer un chatbot ?", a: "Principalement sur votre site web et vos messageries. Les canaux exacts sont définis avec vous lors du cadrage du projet." },
    ],
  },
  [PRESTATIONS.branding]: {
    h1: 'Branding et identité visuelle à Sfax',
    summary: "Logo, charte graphique et identité de marque cohérente pour votre entreprise, par l'équipe branding d'IRIS Junior Entreprise (ENIS, Sfax).",
    answer: "Le branding définit l'image de votre marque : nom, logo, couleurs, typographies et ton. IRIS Junior Entreprise crée ou fait évoluer votre identité visuelle et vous remet une charte graphique pour garder une communication cohérente, sur la base d'un devis personnalisé.",
    deliverables: [
      "Analyse de votre positionnement et de votre public",
      'Création ou refonte du logo',
      'Charte graphique (couleurs, typographies, usages)',
      'Déclinaisons utiles : réseaux sociaux, documents, supports de communication',
    ],
    forWhom: [
      'Nouvelles entreprises qui construisent leur marque',
      'Structures qui veulent moderniser une image devenue incohérente',
    ],
    faq: [
      { q: "Qu'est-ce qu'une charte graphique ?", a: "C'est le document qui fixe les règles d'utilisation de votre logo, de vos couleurs et de vos typographies, pour que tous vos supports restent cohérents." },
      { q: 'Peut-on faire refondre un logo existant ?', a: "Oui. Nous pouvons faire évoluer votre identité actuelle ou en créer une nouvelle, selon vos objectifs. Le devis précise le périmètre retenu." },
    ],
  },
  [PRESTATIONS.community]: {
    h1: 'Community management à Sfax et en Tunisie',
    summary: "Gestion de vos réseaux sociaux : stratégie éditoriale, contenus et animation de communauté, par IRIS Junior Entreprise (ENIS, Sfax). Devis personnalisé.",
    answer: "Le community management consiste à animer vos réseaux sociaux : définir une ligne éditoriale, créer des contenus réguliers et dialoguer avec votre communauté. IRIS Junior Entreprise prend en charge cette animation pour les entreprises, associations et startups, sur devis personnalisé.",
    deliverables: [
      'Ligne éditoriale et calendrier de publication',
      'Création des visuels et des textes',
      'Publication et animation de la communauté',
      "Bilan des résultats et pistes d'amélioration",
    ],
    forWhom: [
      'Entreprises qui manquent de temps pour animer leurs réseaux',
      'Associations et startups qui veulent gagner en visibilité',
    ],
    faq: [
      { q: "Quels réseaux sociaux peut-on confier à IRIS Junior Entreprise ?", a: "Les réseaux utiles à votre cible, par exemple Facebook, Instagram ou LinkedIn. Le choix se fait avec vous lors du cadrage." },
      { q: 'Quelle est la différence entre branding et community management ?', a: "Le branding définit l'identité de votre marque ; le community management l'anime au quotidien sur les réseaux sociaux. Les deux se complètent." },
    ],
  },
  [PRESTATIONS.etudeMarche]: {
    h1: 'Étude de marché en Tunisie',
    summary: "Étude de marché sur mesure : analyse de la demande, des concurrents et des opportunités, par IRIS Junior Entreprise (ENIS, Sfax). Devis personnalisé.",
    answer: "Une étude de marché analyse la demande, la concurrence et les attentes de vos futurs clients avant de lancer ou de développer une activité. IRIS Junior Entreprise réalise des études sur mesure, avec collecte de données, analyse et recommandations, sur devis personnalisé.",
    deliverables: [
      'Définition de la problématique et de la cible',
      'Collecte de données (enquêtes, entretiens, recherche documentaire)',
      'Analyse de la concurrence et du marché',
      'Rapport de synthèse avec recommandations',
    ],
    forWhom: [
      'Porteurs de projet qui veulent valider une idée avant de se lancer',
      "Entreprises qui préparent un nouveau produit ou l'entrée sur un nouveau marché",
    ],
    faq: [
      { q: "Pourquoi faire une étude de marché avant de lancer un projet ?", a: "Elle permet de vérifier qu'il existe une demande, de connaître les concurrents et d'ajuster l'offre, ce qui réduit les risques avant d'investir." },
      { q: "Quels livrables reçoit-on à la fin d'une étude de marché ?", a: "Un rapport de synthèse présentant les résultats de l'analyse et des recommandations concrètes. Le format exact est précisé dans le devis." },
    ],
  },
  [PRESTATIONS.etudeNotoriete]: {
    h1: 'Étude de notoriété de votre marque',
    summary: "Mesurez la connaissance et l'image de votre marque auprès de votre cible grâce à une étude de notoriété réalisée par IRIS Junior Entreprise (ENIS, Sfax).",
    answer: "Une étude de notoriété mesure dans quelle mesure votre marque est connue, reconnue et appréciée par votre public. IRIS Junior Entreprise conçoit l'enquête, collecte les réponses, analyse les résultats et propose des pistes pour renforcer votre visibilité, sur devis personnalisé.",
    deliverables: [
      "Conception du questionnaire d'enquête",
      'Collecte des réponses auprès de votre cible',
      "Analyse du niveau de connaissance et de l'image de la marque",
      "Rapport avec recommandations d'actions",
    ],
    forWhom: [
      'Marques qui veulent savoir si elles sont connues de leur public',
      'Entreprises qui évaluent l’effet de leurs actions de communication',
    ],
    faq: [
      { q: "Qu'est-ce qu'une étude de notoriété ?", a: "C'est une enquête qui mesure si votre marque est connue de votre cible, comment elle est perçue et par quels canaux les gens la découvrent." },
      { q: 'Quand faire une étude de notoriété ?', a: "Avant une campagne pour connaître votre point de départ, puis après pour mesurer l'évolution de la connaissance de votre marque." },
    ],
  },
  [PRESTATIONS.etudeSatisfaction]: {
    h1: 'Étude de satisfaction clients',
    summary: "Mesurez la satisfaction de vos clients et repérez les points à améliorer grâce à une étude réalisée par IRIS Junior Entreprise (ENIS, Sfax).",
    answer: "Une étude de satisfaction recueille l'avis de vos clients sur vos produits ou services pour identifier ce qui fonctionne et ce qu'il faut améliorer. IRIS Junior Entreprise conçoit l'enquête, analyse les réponses et formule des recommandations, sur devis personnalisé.",
    deliverables: [
      'Questionnaire adapté à vos clients et à votre activité',
      'Collecte et traitement des réponses',
      'Indicateurs de satisfaction et points de friction',
      "Recommandations d'amélioration",
    ],
    forWhom: [
      'Entreprises qui veulent fidéliser leurs clients',
      'Équipes qui lancent un nouveau service et veulent recueillir des retours',
    ],
    faq: [
      { q: 'Pourquoi mesurer la satisfaction de ses clients ?', a: "Pour repérer rapidement les irritants, améliorer votre offre et fidéliser vos clients, à partir de retours réels plutôt que d'impressions." },
      { q: "Comment est menée l'enquête ?", a: "Le questionnaire est construit avec vous, diffusé auprès de vos clients, puis les réponses sont analysées dans un rapport de synthèse." },
    ],
  },
  [PRESTATIONS.businessPlan]: {
    h1: 'Business plan : rédaction et modélisation financière',
    summary: "Business plan clair et argumenté pour convaincre partenaires, banques et investisseurs, rédigé avec IRIS Junior Entreprise (ENIS, Sfax). Devis personnalisé.",
    answer: "Un business plan présente votre projet, votre marché, votre modèle économique et vos prévisions financières. IRIS Junior Entreprise vous aide à le structurer et à le rédiger pour convaincre partenaires, banques ou investisseurs, sur la base d'un devis personnalisé.",
    deliverables: [
      "Structuration du projet (modèle économique, proposition de valeur)",
      'Analyse du marché et de la concurrence',
      'Prévisions financières',
      'Document final prêt à être présenté',
    ],
    forWhom: [
      'Porteurs de projet qui préparent un dossier de financement',
      'Startups qui préparent une présentation à des investisseurs',
    ],
    faq: [
      { q: "Que contient un business plan ?", a: "Une présentation du projet, l'analyse du marché, la stratégie commerciale, l'organisation et les prévisions financières, rédigés de façon claire et argumentée." },
      { q: "Peut-on être accompagné si l'on n'a qu'une idée ?", a: "Oui. Décrivez votre idée dans le formulaire de devis : nous vous aidons à la structurer, en commençant éventuellement par une étude de marché." },
    ],
  },
};

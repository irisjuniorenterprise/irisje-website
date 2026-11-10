// lib/data/guides.ts
//
// Guides éditoriaux (AEO / SEO) : chaque guide ouvre sur une RÉPONSE DIRECTE
// de 40 à 60 mots (extraite par Google et les assistants IA), puis détaille
// par sections et se termine par une FAQ balisée en JSON-LD.
//
// Règle d'or : n'écrire que des faits vérifiables sur IRIS (fondée en 2014,
// junior-entreprise de l'ENIS à Sfax). Aucun chiffre inventé.
// ⚠️ Contenu à relire et valider par l'équipe IRIS avant publication.
import type { Locale } from '../../i18n/config';
import type { GuideContent, GuideSlug, GuideUi } from './servicesIndex';
import { UI_AR } from './servicesContent.ar';
import { UI_EN } from './servicesContent.en';
import { UI_FR } from './servicesContent.fr';

// Le bandeau CTA des guides reprend EXACTEMENT les textes de celui des pages
// de service (UI_*) : même texte = même retour à la ligne = même hauteur de
// bandeau, à toutes les largeurs d'écran. Ne pas les dissocier.
export const GUIDE_UI: Record<Locale, GuideUi> = {
  fr: {
    indexTitle: 'Guides pratiques | IRIS Junior Entreprise',
    indexSummary: "Guides pratiques d'IRIS Junior Entreprise : comprendre une junior-entreprise, préparer un cahier des charges et réussir vos projets web, marketing et études.",
    indexIntro: "Des réponses claires et concrètes pour préparer vos projets web, marketing et études, rédigées par l'équipe d'IRIS Junior Entreprise.",
    readGuide: 'Lire le guide',
    updated: 'Mis à jour le',
    quickAnswer: 'En bref',
    faqTitle: 'Questions fréquentes',
    ctaTitle: UI_FR.ctaTitle,
    ctaText: UI_FR.ctaText,
    ctaButton: UI_FR.ctaButton,
    relatedServices: 'Prestations liées',
    titleSuffix: 'IRIS Junior Entreprise',
  },
  en: {
    indexTitle: 'Practical guides | IRIS Junior Entreprise',
    indexSummary: 'Practical guides by IRIS Junior Entreprise: understand a junior enterprise, prepare a requirements document and succeed in your web, marketing and research projects.',
    indexIntro: 'Clear, practical answers to help you prepare your web, marketing and research projects, written by the IRIS Junior Entreprise team.',
    readGuide: 'Read the guide',
    updated: 'Updated on',
    quickAnswer: 'In short',
    faqTitle: 'Frequently asked questions',
    ctaTitle: UI_EN.ctaTitle,
    ctaText: UI_EN.ctaText,
    ctaButton: UI_EN.ctaButton,
    relatedServices: 'Related services',
    titleSuffix: 'IRIS Junior Entreprise',
  },
  ar: {
    indexTitle: 'أدلة عملية | IRIS Junior Entreprise',
    indexSummary: 'أدلة عملية من IRIS Junior Entreprise: افهم المؤسسة الصغرى الطلابية، وحضّر كراس شروط، وانجح في مشاريعك الرقمية والتسويقية والدراسات.',
    indexIntro: 'إجابات واضحة وعملية لمساعدتك على تحضير مشاريعك الرقمية والتسويقية والدراسات، يكتبها فريق IRIS Junior Entreprise.',
    readGuide: 'قراءة الدليل',
    updated: 'آخر تحديث',
    quickAnswer: 'باختصار',
    faqTitle: 'الأسئلة الشائعة',
    ctaTitle: UI_AR.ctaTitle,
    ctaText: UI_AR.ctaText,
    ctaButton: UI_AR.ctaButton,
    relatedServices: 'خدمات ذات صلة',
    titleSuffix: 'IRIS Junior Entreprise',
  },
};

/** Services à recommander en fin de guide. */
export const GUIDE_RELATED: Record<GuideSlug, string[]> = {
  'qu-est-ce-qu-une-junior-entreprise': ['developpement-web', 'etude-marche', 'branding'],
  'cahier-des-charges-site-web': ['developpement-web', 'developpement-mobile', 'chatbot'],
};

export const GUIDES: Record<Locale, Record<GuideSlug, GuideContent>> = {
  /* ================================ FR ================================ */
  fr: {
    'qu-est-ce-qu-une-junior-entreprise': {
      h1: "Qu'est-ce qu'une junior-entreprise ? Définition et fonctionnement",
      summary: "Une junior-entreprise est une association d'étudiants qui réalise de vraies missions pour des entreprises. Définition, missions possibles et exemple : IRIS à Sfax.",
      answer: "Une junior-entreprise est une association à but non lucratif gérée par des étudiants. Elle fonctionne comme un cabinet de conseil : elle réalise de vraies missions (développement, marketing, études) pour des entreprises, tout en formant ses membres. En Tunisie, ces structures sont fédérées par la JET.",
      sections: [
        {
          h2: "Définition d'une junior-entreprise",
          paragraphs: [
            "Une junior-entreprise est une structure associative créée par des étudiants d'une école ou d'une université. Elle prospecte des clients, établit des devis, réalise les missions et les facture, comme le ferait un cabinet de conseil, avec un objectif double : rendre un service professionnel aux clients et permettre aux étudiants d'appliquer leurs cours à des cas réels.",
          ],
        },
        {
          h2: 'Quelles missions peut-on confier à une junior-entreprise ?',
          paragraphs: ['Selon les compétences de ses membres, une junior-entreprise propose par exemple :'],
          list: [
            'le développement de sites web et d\'applications mobiles ;',
            'la création de chatbots ;',
            'le branding et le community management ;',
            "des études de marché, de notoriété et de satisfaction ;",
            "la rédaction de business plans.",
          ],
        },
        {
          h2: 'Pourquoi faire appel à une junior-entreprise ?',
          list: [
            'Vous travaillez avec des étudiants-ingénieurs formés et motivés, au sein d\'une structure organisée.',
            'Chaque mission fait l\'objet d\'un devis personnalisé, avec un périmètre et un délai définis.',
            'Vous contribuez à la formation pratique des étudiants.',
          ],
        },
        {
          h2: 'IRIS Junior Entreprise en bref',
          paragraphs: [
            "Fondée en 2014, IRIS Junior Entreprise est la junior-entreprise de l'ENIS (École Nationale d'Ingénieurs de Sfax). Elle accompagne startups, PME, associations et porteurs de projets dans les domaines de l'IT, du marketing et des études.",
          ],
        },
      ],
      faq: [
        { q: 'Une junior-entreprise est-elle une entreprise classique ?', a: "Non. C'est une association à but non lucratif d'étudiants. Elle fonctionne cependant comme un cabinet de conseil, avec devis, suivi de mission et livrables." },
        { q: 'Comment confier une mission à IRIS Junior Entreprise ?', a: "Remplissez le formulaire de devis en décrivant votre projet, votre budget et votre délai souhaité. L'équipe vous répond par email avec une proposition personnalisée." },
      ],
    },
    'cahier-des-charges-site-web': {
      h1: "Cahier des charges d'un site web : les 8 points à préciser",
      summary: "Comment rédiger le cahier des charges de votre site web : objectifs, cible, pages, fonctionnalités, contenus, budget et délai. Checklist pratique.",
      answer: "Un cahier des charges de site web décrit votre objectif, votre public, les pages et fonctionnalités attendues, les contenus, le budget et le délai. Plus il est précis, plus le devis est fiable et plus le projet reste maîtrisé du début à la fin.",
      sections: [
        {
          h2: 'Pourquoi rédiger un cahier des charges ?',
          paragraphs: [
            "Il aligne tout le monde sur le même objectif, évite les malentendus et permet d'obtenir un devis comparable et réaliste. Il n'a pas besoin d'être long : quelques pages claires suffisent pour la plupart des projets.",
          ],
        },
        {
          h2: 'Les 8 points à préciser',
          ordered: true,
          list: [
            "L'objectif du site : présenter votre activité, générer des demandes, vendre en ligne, réserver…",
            'Votre public cible et ses attentes.',
            "Les pages et l'arborescence : accueil, services, contact, blog…",
            'Les fonctionnalités : formulaire, paiement, réservation, espace membre, multilingue…',
            "Les contenus : textes, images, vidéos, et qui les fournit.",
            'Le design : couleurs, logo, sites que vous aimez comme références.',
            'Le budget et le délai souhaités.',
            "L'hébergement, le nom de domaine et la maintenance après la mise en ligne.",
          ],
        },
        {
          h2: 'Erreurs fréquentes à éviter',
          list: [
            'Décrire des solutions techniques au lieu du besoin réel.',
            'Oublier de prévoir qui rédige les contenus.',
            'Ne pas anticiper les langues du site (français, anglais, arabe).',
            'Négliger la maintenance et les mises à jour après la livraison.',
          ],
        },
        {
          h2: 'Pas de cahier des charges complet ? Commencez par le devis',
          paragraphs: [
            "Le formulaire de devis d'IRIS Junior Entreprise suffit pour démarrer : indiquez votre projet, la prestation souhaitée, votre budget et votre délai. L'équipe vous aide ensuite à préciser le reste.",
          ],
        },
      ],
      faq: [
        { q: 'Un cahier des charges est-il obligatoire pour demander un devis ?', a: "Non. Une description claire de votre besoin suffit pour démarrer ; le cahier des charges se précise ensuite avec l'équipe." },
        { q: 'Quelle différence entre cahier des charges et devis ?', a: "Le cahier des charges décrit ce que vous voulez obtenir ; le devis chiffre la manière de le réaliser (périmètre, délai, coût)." },
      ],
    },
  },
  /* ================================ EN ================================ */
  en: {
    'qu-est-ce-qu-une-junior-entreprise': {
      h1: 'What is a junior enterprise? Definition and how it works',
      summary: 'A junior enterprise is a student-run association that carries out real projects for companies. Definition, possible missions and an example: IRIS in Sfax.',
      answer: 'A junior enterprise is a non-profit association run by students. It works like a consulting firm: it carries out real projects (development, marketing, research) for companies while training its members. In Tunisia, these structures are federated by JET.',
      sections: [
        {
          h2: 'Definition of a junior enterprise',
          paragraphs: [
            'A junior enterprise is an association created by students of a school or university. Like a consulting firm, it finds clients, prepares quotes, delivers the projects and invoices them, with a double goal: providing a professional service to clients and letting students apply their courses to real cases.',
          ],
        },
        {
          h2: 'What projects can you entrust to a junior enterprise?',
          paragraphs: ['Depending on its members’ skills, a junior enterprise may offer, for example:'],
          list: [
            'website and mobile app development;',
            'chatbot creation;',
            'branding and community management;',
            'market, brand awareness and satisfaction studies;',
            'business plan writing.',
          ],
        },
        {
          h2: 'Why work with a junior enterprise?',
          list: [
            'You work with trained, motivated engineering students within an organized structure.',
            'Each project comes with a tailored quote, a defined scope and a timeline.',
            'You contribute to the practical training of students.',
          ],
        },
        {
          h2: 'IRIS Junior Entreprise at a glance',
          paragraphs: [
            'Founded in 2014, IRIS Junior Entreprise is the junior enterprise of ENIS (National Engineering School of Sfax). It supports startups, SMEs, associations and project owners in IT, marketing and research.',
          ],
        },
      ],
      faq: [
        { q: 'Is a junior enterprise a regular company?', a: 'No. It is a non-profit student association. It does work like a consulting firm, with quotes, project follow-up and deliverables.' },
        { q: 'How do I entrust a project to IRIS Junior Entreprise?', a: 'Fill in the quote form describing your project, budget and desired timeline. The team replies by email with a tailored proposal.' },
      ],
    },
    'cahier-des-charges-site-web': {
      h1: 'Website requirements document: 8 points to define',
      summary: 'How to write the requirements document for your website: goals, audience, pages, features, content, budget and timeline. A practical checklist.',
      answer: 'A website requirements document describes your goal, audience, expected pages and features, content, budget and timeline. The more precise it is, the more reliable the quote and the better the project stays under control from start to finish.',
      sections: [
        {
          h2: 'Why write a requirements document?',
          paragraphs: [
            'It aligns everyone on the same goal, avoids misunderstandings and lets you get a realistic, comparable quote. It does not need to be long: a few clear pages are enough for most projects.',
          ],
        },
        {
          h2: 'The 8 points to define',
          ordered: true,
          list: [
            'The goal of the site: present your activity, generate leads, sell online, take bookings…',
            'Your target audience and its expectations.',
            'Pages and structure: home, services, contact, blog…',
            'Features: form, payment, booking, member area, multilingual…',
            'Content: text, images, videos, and who provides them.',
            'Design: colors, logo, and sites you like as references.',
            'The budget and timeline you have in mind.',
            'Hosting, domain name and maintenance after launch.',
          ],
        },
        {
          h2: 'Common mistakes to avoid',
          list: [
            'Describing technical solutions instead of the real need.',
            'Forgetting to plan who writes the content.',
            'Not anticipating the site languages (French, English, Arabic).',
            'Neglecting maintenance and updates after delivery.',
          ],
        },
        {
          h2: 'No full requirements document? Start with the quote',
          paragraphs: [
            'The IRIS Junior Entreprise quote form is enough to get started: state your project, the service you want, your budget and timeline. The team then helps you clarify the rest.',
          ],
        },
      ],
      faq: [
        { q: 'Is a requirements document mandatory to request a quote?', a: 'No. A clear description of your need is enough to start; the document is refined afterwards with the team.' },
        { q: 'What is the difference between a requirements document and a quote?', a: 'The requirements document describes what you want to achieve; the quote prices how it will be done (scope, timeline, cost).' },
      ],
    },
  },
  /* ================================ AR ================================ */
  ar: {
    'qu-est-ce-qu-une-junior-entreprise': {
      h1: 'ما هي المؤسسة الصغرى الطلابية (Junior Entreprise)؟ التعريف وطريقة العمل',
      summary: 'المؤسسة الصغرى الطلابية جمعية يديرها طلبة وتنجز مهامّ حقيقية لفائدة الشركات. التعريف والمهام الممكنة ومثال: IRIS بصفاقس.',
      answer: 'المؤسسة الصغرى الطلابية جمعية غير ربحية يديرها طلبة. تعمل مثل مكتب استشارات: تنجز مهامّ حقيقية (تطوير وتسويق ودراسات) لفائدة الشركات وتكوّن أعضاءها في الوقت نفسه. وفي تونس تنضوي هذه الهياكل تحت JET.',
      sections: [
        {
          h2: 'تعريف المؤسسة الصغرى الطلابية',
          paragraphs: [
            'هي هيكل جمعياتي ينشئه طلبة مدرسة أو جامعة. وعلى غرار مكتب الاستشارات، تبحث عن الحرفاء وتعدّ عروض الأسعار وتنجز المهامّ وتفوترها، بهدف مزدوج: تقديم خدمة مهنية للحرفاء وتمكين الطلبة من تطبيق دروسهم على حالات حقيقية.',
          ],
        },
        {
          h2: 'ما المهامّ التي يمكن إسنادها إلى مؤسسة صغرى طلابية؟',
          paragraphs: ['بحسب كفاءات أعضائها، يمكن أن تقدّم مثلًا:'],
          list: [
            'تطوير المواقع الإلكترونية وتطبيقات الجوال؛',
            'إنشاء روبوتات المحادثة؛',
            'العلامة التجارية وإدارة المجتمعات الرقمية؛',
            'دراسات السوق والشهرة والرضا؛',
            'إعداد خطط العمل (Business Plan).',
          ],
        },
        {
          h2: 'لماذا نتعامل مع مؤسسة صغرى طلابية؟',
          list: [
            'تعمل مع طلبة مهندسين مكوَّنين ومتحمسين داخل هيكل منظَّم.',
            'لكل مهمة عرض سعر مخصص ونطاق وأجل محددان.',
            'تساهم في التكوين التطبيقي للطلبة.',
          ],
        },
        {
          h2: 'IRIS Junior Entreprise باختصار',
          paragraphs: [
            'تأسست IRIS Junior Entreprise سنة 2014، وهي المؤسسة الصغرى الطلابية للمدرسة الوطنية للمهندسين بصفاقس (ENIS). ترافق الشركات الناشئة والمؤسسات الصغرى والمتوسطة والجمعيات وأصحاب المشاريع في مجالات المعلوماتية والتسويق والدراسات.',
          ],
        },
      ],
      faq: [
        { q: 'هل المؤسسة الصغرى الطلابية شركة عادية؟', a: 'لا، إنها جمعية طلابية غير ربحية. غير أنها تعمل مثل مكتب استشارات: عروض أسعار ومتابعة للمهام وإنتاجات تُسلَّم للحريف.' },
        { q: 'كيف أُسند مهمة إلى IRIS Junior Entreprise؟', a: 'املأ استمارة عرض السعر مع وصف مشروعك وميزانيتك والأجل المرغوب، وسيرد عليك الفريق عبر البريد الإلكتروني بمقترح مخصص.' },
      ],
    },
    'cahier-des-charges-site-web': {
      h1: 'كراس الشروط لموقع إلكتروني: 8 نقاط يجب تحديدها',
      summary: 'كيف تكتب كراس شروط موقعك الإلكتروني: الأهداف والجمهور والصفحات والوظائف والمحتوى والميزانية والأجل. قائمة تحقق عملية.',
      answer: 'يصف كراس الشروط لموقع إلكتروني هدفك وجمهورك والصفحات والوظائف المنتظرة والمحتوى والميزانية والأجل. وكلما كان أدقّ، كان عرض السعر أكثر موثوقية وبقي المشروع تحت السيطرة من البداية إلى النهاية.',
      sections: [
        {
          h2: 'لماذا نكتب كراس شروط؟',
          paragraphs: [
            'لأنه يوحّد الجميع حول الهدف نفسه ويتفادى سوء الفهم ويتيح الحصول على عرض سعر واقعي وقابل للمقارنة. ولا يلزم أن يكون طويلًا: بضع صفحات واضحة تكفي لأغلب المشاريع.',
          ],
        },
        {
          h2: 'النقاط الثماني التي يجب تحديدها',
          ordered: true,
          list: [
            'هدف الموقع: تقديم نشاطك أو جلب الطلبات أو البيع عبر الإنترنت أو الحجز…',
            'جمهورك المستهدف وانتظاراته.',
            'الصفحات وهيكلتها: الرئيسية والخدمات والاتصال والمدونة…',
            'الوظائف: استمارة ودفع وحجز وفضاء للأعضاء وتعدد اللغات…',
            'المحتوى: نصوص وصور وفيديوهات ومن يوفّرها.',
            'التصميم: الألوان والشعار ومواقع تعجبك كمراجع.',
            'الميزانية والأجل المرغوبان.',
            'الاستضافة واسم النطاق والصيانة بعد النشر.',
          ],
        },
        {
          h2: 'أخطاء شائعة يجب تجنبها',
          list: [
            'وصف حلول تقنية بدل الحاجة الفعلية.',
            'نسيان تحديد من يكتب المحتوى.',
            'عدم توقّع لغات الموقع (العربية والفرنسية والإنجليزية).',
            'إهمال الصيانة والتحديثات بعد التسليم.',
          ],
        },
        {
          h2: 'ليس لديك كراس شروط كامل؟ ابدأ بعرض السعر',
          paragraphs: [
            'تكفي استمارة عرض السعر في IRIS Junior Entreprise للبدء: اذكر مشروعك والخدمة المطلوبة وميزانيتك وأجلك، ثم يساعدك الفريق على توضيح الباقي.',
          ],
        },
      ],
      faq: [
        { q: 'هل كراس الشروط إجباري لطلب عرض سعر؟', a: 'لا، يكفي وصف واضح لحاجتك للبدء، ثم يُدقَّق الكراس لاحقًا مع الفريق.' },
        { q: 'ما الفرق بين كراس الشروط وعرض السعر؟', a: 'يصف كراس الشروط ما تريد الحصول عليه، بينما يحدد عرض السعر كيفية إنجازه (النطاق والأجل والكلفة).' },
      ],
    },
  },
};

// lib/data/servicesContent.en.ts
// English editorial content for the service detail pages.
// ⚠️ To be reviewed and validated by the IRIS team.
import { PRESTATIONS } from './prestations';
import type { ServiceContent, ServiceSlug, ServiceUi } from './servicesIndex';

export const UI_EN: ServiceUi = {
  quickAnswer: 'In short',
  whatYouGet: 'What you get',
  forWhomTitle: 'Who is it for?',
  processTitle: 'How a project works',
  processSteps: [
    { title: 'Discussion and scoping', text: 'You describe your need; we clarify goals, scope and timeline.' },
    { title: 'Tailored quote', text: 'You receive a priced proposal adapted to your project and budget.' },
    { title: 'Delivery of the work', text: 'The team carries out the project with checkpoints so you can validate each step.' },
    { title: 'Handover and follow-up', text: 'We deliver the results, walk you through them and stay available for adjustments.' },
  ],
  faqTitle: 'Frequently asked questions',
  ctaTitle: "Let's talk about your project",
  ctaText: 'Describe your need in a few lines: we reply with a tailored quote.',
  ctaButton: 'Request a quote',
  otherServices: 'Other services',
  allServices: 'See all services',
  guidesTitle: 'Practical guides',
  byline: 'IRIS Junior Entreprise, the junior enterprise of ENIS in Sfax',
  titleSuffix: 'IRIS Junior Entreprise',
};

export const SERVICES_EN: Record<ServiceSlug, ServiceContent> = {
  [PRESTATIONS.web]: {
    h1: 'Web development in Sfax and across Tunisia',
    summary: 'Showcase sites, online stores and custom web platforms built by the engineering students of IRIS Junior Entreprise (ENIS, Sfax). Tailored quote.',
    answer: 'IRIS Junior Entreprise designs and builds showcase websites, online stores, platforms and custom web applications for startups, SMEs and associations. Projects are carried out by engineering students from ENIS in Sfax, based on a tailored quote.',
    deliverables: [
      'Requirements and mockups validated with you',
      'Development of the website or web application',
      'Mobile-friendly version designed with search engine optimization (SEO) in mind',
      'Launch and handover of access credentials',
    ],
    forWhom: [
      'Startups launching their website or first product version',
      'SMEs and associations creating or redesigning their online presence',
    ],
    faq: [
      { q: 'What can IRIS Junior Entreprise build for me?', a: 'Showcase websites, e-commerce sites, booking or management platforms and custom web applications. Describe your need in the quote form and the team will reply with a suitable proposal.' },
      { q: 'How do I get a quote for a website?', a: 'Fill in the quote form with your project, budget and desired timeline. IRIS Junior Entreprise replies by email with a tailored proposal.' },
    ],
  },
  [PRESTATIONS.mobile]: {
    h1: 'Mobile app development in Sfax and across Tunisia',
    summary: 'Custom Android and iOS apps, from mockup to publication, by the engineering students of IRIS Junior Entreprise (ENIS, Sfax).',
    answer: 'IRIS Junior Entreprise develops custom mobile applications for Android and iOS: from defining features to mockups, development and publication. A tailored quote is prepared after studying your need.',
    deliverables: [
      'Definition of features and user journeys',
      'Interface mockups validated with you',
      'Development and testing of the application',
      'Support for publication on the app stores',
    ],
    forWhom: [
      'Startups that want to test an idea with a first app',
      'Companies that want to offer a mobile service to their customers',
    ],
    faq: [
      { q: 'Can you build an app for both Android and iOS?', a: 'Yes. The choice of technology depends on your need and budget; we define it together during the scoping discussion, before the quote.' },
      { q: 'What should I prepare before requesting a mobile app quote?', a: 'A description of the goal, the target users and the essential features is enough to start. The team helps you clarify the rest.' },
    ],
  },
  [PRESTATIONS.chatbot]: {
    h1: 'Chatbot development for your business',
    summary: 'Custom chatbots that answer your customers automatically on your website or messaging apps, built by IRIS Junior Entreprise, ENIS Sfax. Tailored quote.',
    answer: 'A chatbot answers your customers’ questions automatically, at any hour, on your website or messaging channels. IRIS Junior Entreprise builds custom chatbots: conversation scenarios, integration with your channels and testing, based on a tailored quote.',
    deliverables: [
      'Definition of questions and conversation scenarios',
      'Design and development of the chatbot',
      'Integration with your website or messaging channels',
      'Testing and adjustments before going live',
    ],
    forWhom: [
      'Businesses that receive many repetitive questions',
      'Teams that want to offer support outside office hours',
    ],
    faq: [
      { q: 'What is a chatbot useful for in a business?', a: 'It answers frequent questions automatically, directs visitors to the right service and collects requests, freeing up your team’s time.' },
      { q: 'On which channels can a chatbot be integrated?', a: 'Mainly on your website and messaging apps. The exact channels are defined with you when scoping the project.' },
    ],
  },
  [PRESTATIONS.branding]: {
    h1: 'Branding and visual identity in Sfax',
    summary: 'Logo, brand guidelines and a consistent visual identity for your business, by the branding team of IRIS Junior Entreprise (ENIS, Sfax).',
    answer: 'Branding defines your brand image: name, logo, colors, typography and tone. IRIS Junior Entreprise creates or evolves your visual identity and hands over brand guidelines so your communication stays consistent, based on a tailored quote.',
    deliverables: [
      'Analysis of your positioning and audience',
      'Logo creation or redesign',
      'Brand guidelines (colors, typography, usage rules)',
      'Useful variations: social media, documents, communication materials',
    ],
    forWhom: [
      'New businesses building their brand',
      'Organizations that want to modernize an inconsistent image',
    ],
    faq: [
      { q: 'What are brand guidelines?', a: 'The document that sets the rules for using your logo, colors and typography so that all your materials stay consistent.' },
      { q: 'Can you redesign an existing logo?', a: 'Yes. We can evolve your current identity or create a new one depending on your goals. The quote specifies the agreed scope.' },
    ],
  },
  [PRESTATIONS.community]: {
    h1: 'Community management in Sfax and across Tunisia',
    summary: 'Social media management: editorial strategy, content creation and community engagement by IRIS Junior Entreprise (ENIS, Sfax). Tailored quote.',
    answer: 'Community management means running your social media: defining an editorial line, creating regular content and engaging with your audience. IRIS Junior Entreprise handles this for businesses, associations and startups, based on a tailored quote.',
    deliverables: [
      'Editorial line and publishing calendar',
      'Creation of visuals and copy',
      'Publishing and community engagement',
      'Results review and improvement ideas',
    ],
    forWhom: [
      'Businesses short on time to run their social networks',
      'Associations and startups that want more visibility',
    ],
    faq: [
      { q: 'Which social networks can I entrust to IRIS Junior Entreprise?', a: 'The networks that matter for your audience, for example Facebook, Instagram or LinkedIn. The choice is made with you during scoping.' },
      { q: 'What is the difference between branding and community management?', a: 'Branding defines your brand identity; community management brings it to life every day on social media. The two complement each other.' },
    ],
  },
  [PRESTATIONS.etudeMarche]: {
    h1: 'Market research in Tunisia',
    summary: 'Custom market research: demand, competitors and opportunities analysis by IRIS Junior Entreprise (ENIS, Sfax). Tailored quote.',
    answer: 'Market research analyzes demand, competition and the expectations of your future customers before launching or growing an activity. IRIS Junior Entreprise carries out custom studies with data collection, analysis and recommendations, based on a tailored quote.',
    deliverables: [
      'Definition of the research question and target',
      'Data collection (surveys, interviews, desk research)',
      'Competitor and market analysis',
      'Summary report with recommendations',
    ],
    forWhom: [
      'Project owners who want to validate an idea before launching',
      'Companies preparing a new product or entry into a new market',
    ],
    faq: [
      { q: 'Why do market research before launching a project?', a: 'It confirms that demand exists, shows who the competitors are and helps adjust your offer, reducing risk before you invest.' },
      { q: 'What do I receive at the end of a market study?', a: 'A summary report presenting the analysis results and concrete recommendations. The exact format is specified in the quote.' },
    ],
  },
  [PRESTATIONS.etudeNotoriete]: {
    h1: 'Brand awareness study',
    summary: 'Measure how well your brand is known and perceived by your target audience with a brand awareness study by IRIS Junior Entreprise (ENIS, Sfax).',
    answer: 'A brand awareness study measures how well your brand is known, recognized and liked by your audience. IRIS Junior Entreprise designs the survey, collects responses, analyzes the results and suggests ways to strengthen your visibility, based on a tailored quote.',
    deliverables: [
      'Design of the survey questionnaire',
      'Collection of responses from your target audience',
      'Analysis of brand awareness and image',
      'Report with action recommendations',
    ],
    forWhom: [
      'Brands that want to know whether their audience knows them',
      'Companies assessing the impact of their communication actions',
    ],
    faq: [
      { q: 'What is a brand awareness study?', a: 'A survey that measures whether your target audience knows your brand, how it is perceived and through which channels people discover it.' },
      { q: 'When should I run a brand awareness study?', a: 'Before a campaign to establish your starting point, then afterwards to measure how awareness has changed.' },
    ],
  },
  [PRESTATIONS.etudeSatisfaction]: {
    h1: 'Customer satisfaction study',
    summary: 'Measure customer satisfaction and spot what to improve with a study carried out by IRIS Junior Entreprise (ENIS, Sfax).',
    answer: 'A satisfaction study collects your customers’ opinions on your products or services to identify what works and what should improve. IRIS Junior Entreprise designs the survey, analyzes responses and makes recommendations, based on a tailored quote.',
    deliverables: [
      'Questionnaire adapted to your customers and activity',
      'Collection and processing of responses',
      'Satisfaction indicators and pain points',
      'Improvement recommendations',
    ],
    forWhom: [
      'Businesses that want to retain their customers',
      'Teams launching a new service and seeking feedback',
    ],
    faq: [
      { q: 'Why measure customer satisfaction?', a: 'To quickly spot irritants, improve your offer and build loyalty, based on real feedback rather than impressions.' },
      { q: 'How is the survey carried out?', a: 'The questionnaire is built with you and sent to your customers, then the responses are analyzed in a summary report.' },
    ],
  },
  [PRESTATIONS.businessPlan]: {
    h1: 'Business plan: writing and financial modeling',
    summary: 'A clear, well-argued business plan to convince partners, banks and investors, written with IRIS Junior Entreprise (ENIS, Sfax). Tailored quote.',
    answer: 'A business plan presents your project, your market, your business model and your financial forecasts. IRIS Junior Entreprise helps you structure and write it to convince partners, banks or investors, based on a tailored quote.',
    deliverables: [
      'Structuring of the project (business model, value proposition)',
      'Market and competition analysis',
      'Financial forecasts',
      'Final document ready to present',
    ],
    forWhom: [
      'Project owners preparing a funding application',
      'Startups preparing an investor presentation',
    ],
    faq: [
      { q: 'What does a business plan contain?', a: 'A presentation of the project, market analysis, commercial strategy, organization and financial forecasts, written clearly and with solid arguments.' },
      { q: 'Can you help if I only have an idea?', a: 'Yes. Describe your idea in the quote form: we help you structure it, possibly starting with a market study.' },
    ],
  },
};

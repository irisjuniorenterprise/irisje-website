// app/llms.txt/route.ts
//
// /llms.txt : présentation du site en Markdown pour les assistants IA.
//
// Honnêteté sur l'effet : Google indique qu'il n'utilise PAS ce fichier pour
// ses réponses IA, et aucune étude sérieuse ne montre qu'il augmente les
// citations. Il est ici pour son faible coût (généré depuis les mêmes données
// que le site, donc toujours à jour) et parce que certains agents le lisent.
// Le vrai levier GEO reste le contenu : voir docs/SEO-GEO-AEO.md.
import { GUIDES } from '@/lib/data/guides';
import { getServiceContent } from '@/lib/data/servicesContent';
import { GUIDE_SLUGS, SERVICE_NAMES, SERVICE_SLUGS } from '@/lib/data/servicesIndex';
import { ORGANIZATION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} est la junior-entreprise de l'ENIS (École Nationale d'Ingénieurs de Sfax, Tunisie), fondée en ${ORGANIZATION.foundingDate}. Elle réalise, pour des startups, PME, associations et porteurs de projets, des missions de développement web et mobile, chatbots, branding, community management, études de marché, de notoriété et de satisfaction, et business plans. Chaque mission fait l'objet d'un devis personnalisé.`,
    '',
    '## Faits clés',
    '',
    `- Nom : ${SITE_NAME} (aussi : ${ORGANIZATION.alternateName.join(', ')})`,
    `- Statut : junior-entreprise (association d'étudiants) de l'ENIS`,
    `- Fondation : ${ORGANIZATION.foundingDate}`,
    `- Adresse : ${ORGANIZATION.address.streetAddress}, ${ORGANIZATION.address.postalCode} ${ORGANIZATION.address.addressLocality}, Tunisie`,
    `- Email : ${ORGANIZATION.email}`,
    `- Langues du site : français, anglais, arabe`,
    '',
    '## Services',
    '',
    ...SERVICE_SLUGS.map((slug) => {
      const content = getServiceContent('fr', slug);
      return `- [${SERVICE_NAMES.fr[slug]}](${absoluteUrl('fr', `/services/${slug}`)}) : ${content.summary}`;
    }),
    '',
    '## Guides',
    '',
    ...GUIDE_SLUGS.map(
      (slug) => `- [${GUIDES.fr[slug].h1}](${absoluteUrl('fr', `/guides/${slug}`)}) : ${GUIDES.fr[slug].summary}`,
    ),
    '',
    '## Pages principales',
    '',
    `- [Accueil](${absoluteUrl('fr', '/')})`,
    `- [Tous les services](${absoluteUrl('fr', '/services')})`,
    `- [À propos](${absoluteUrl('fr', '/a-propos')})`,
    `- [Demander un devis](${absoluteUrl('fr', '/devis')})`,
    `- [Contact](${absoluteUrl('fr', '/contact')})`,
    `- [FAQ](${absoluteUrl('fr', '/faq')})`,
    '',
    '## Autres langues',
    '',
    `- English : ${absoluteUrl('en', '/')}`,
    `- العربية : ${absoluteUrl('ar', '/')}`,
    '',
    `Site officiel : ${SITE_URL}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}

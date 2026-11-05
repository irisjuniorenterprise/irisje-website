// app/[locale]/guides/[slug]/page.tsx
//
// Guide éditorial : réponse directe → sections → FAQ → prestations liées.
// JSON-LD : Article + FAQPage. Contenu : lib/data/guides.ts.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import CtaBand from '@/components/ui/CtaBand';
import DetailHero from '@/components/detail/DetailHero';
import FaqDetails from '@/components/detail/FaqDetails';
import { articleNode, faqNode } from '@/components/detail/detailJsonLd';
import styles from '@/components/detail/Detail.module.css';
import JsonLd from '@/components/seo/JsonLd';
import { locales, type Locale } from '@/i18n/config';
import { GUIDES, GUIDE_RELATED, GUIDE_UI } from '@/lib/data/guides';
import {
  CONTENT_LAST_MODIFIED,
  GUIDE_SLUGS,
  SERVICE_NAMES,
  isGuideSlug,
  isServiceSlug,
} from '@/lib/data/servicesIndex';
import { buildMetadata } from '@/lib/metadata';
import { getRequestSite } from '@/lib/request-site';
import { absoluteUrl, isLocale } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => GUIDE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isGuideSlug(slug)) return {};
  const guide = GUIDES[locale][slug];
  return buildMetadata({
    locale,
    path: `/guides/${slug}`,
    title: `${guide.h1} | ${GUIDE_UI[locale].titleSuffix}`,
    description: guide.summary,
    type: 'article',
  });
}

export default async function GuidePage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || !isGuideSlug(slug)) notFound();
  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const guide = GUIDES[locale][slug];
  const ui = GUIDE_UI[locale];
  const isRtl = locale === 'ar';

  const { origin } = await getRequestSite();
  const pageUrl = absoluteUrl(locale, `/guides/${slug}`, origin);
  const graph = [
    articleNode({ origin, pageUrl, locale, headline: guide.h1, description: guide.summary }),
    faqNode(pageUrl, guide.faq),
  ];

  const updated = new Date(`${CONTENT_LAST_MODIFIED}T12:00:00Z`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const related = GUIDE_RELATED[slug].filter(isServiceSlug);

  return (
    <div className={isRtl ? styles.rtl : ''}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />

      <DetailHero id="guide-hero" title={guide.h1} answer={guide.answer} />

      <article className={styles.section} id="contenu">
        <div className="container">
          <div className={styles.narrow}>
            <p className={styles.byline}>
              {ui.updated} {updated}
            </p>
            {guide.sections.map((section) => {
              const List = section.ordered ? 'ol' : 'ul';
              return (
                <section key={section.h2} style={{ marginBottom: '1.8rem' }}>
                  <h2 className={styles.h2}>{section.h2}</h2>
                  {section.paragraphs?.map((p) => (
                    <p key={p} className={styles.text}>
                      {p}
                    </p>
                  ))}
                  {section.list && (
                    <List className={styles.list}>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </List>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </article>

      <section className={styles.section} id="faq">
        <div className="container">
          <div className={styles.narrow}>
            <h2 className={styles.h2}>{ui.faqTitle}</h2>
            <FaqDetails items={guide.faq} />
          </div>
        </div>
      </section>

      <section className={styles.section} id="prestations-liees">
        <div className="container">
          <div className={styles.narrow}>
            <h2 className={styles.h2}>{ui.relatedServices}</h2>
            <ul className={styles.links}>
              {related.map((service) => (
                <li key={service}>
                  <Link href={`/${locale}/services/${service}`} className={styles.link}>
                    {SERVICE_NAMES[locale][service]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand id="cta" title={ui.ctaTitle} description={ui.ctaText}>
        <Link href={`/${locale}/devis#formulaire-devis`} className="btn btn-cta">
          {ui.ctaButton}
        </Link>
      </CtaBand>
    </div>
  );
}

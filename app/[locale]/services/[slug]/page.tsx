// app/[locale]/services/[slug]/page.tsx
//
// Page de détail d'une prestation (une URL par service et par langue) :
//   réponse directe → livrables → public visé → déroulé → FAQ → devis.
// Contenu : lib/data/servicesContent.*.ts. JSON-LD : Service + FAQPage ici,
// fil d'Ariane via PageJsonLd (layout). Pages générées au build (SSG).
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import CtaBand from '@/components/ui/CtaBand';
import DetailHero from '@/components/detail/DetailHero';
import FaqDetails from '@/components/detail/FaqDetails';
import { faqNode, serviceNode } from '@/components/detail/detailJsonLd';
import styles from '@/components/detail/Detail.module.css';
import JsonLd from '@/components/seo/JsonLd';
import { locales, type Locale } from '@/i18n/config';
import { devisHref } from '@/lib/data/prestations';
import { getServiceContent, getServiceUi } from '@/lib/data/servicesContent';
import {
  GUIDE_SLUGS,
  GUIDE_TITLES,
  SERVICE_CATEGORY,
  SERVICE_NAMES,
  SERVICE_SLUGS,
  isServiceSlug,
} from '@/lib/data/servicesIndex';
import { buildMetadata } from '@/lib/metadata';
import { getRequestSite } from '@/lib/request-site';
import { absoluteUrl, isLocale } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

// Seuls les slugs connus existent : tout autre chemin est un vrai 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => SERVICE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isServiceSlug(slug)) return {};
  const content = getServiceContent(locale, slug);
  const ui = getServiceUi(locale);
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: `${content.h1} | ${ui.titleSuffix}`,
    description: content.summary,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || !isServiceSlug(slug)) notFound();
  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const content = getServiceContent(locale, slug);
  const ui = getServiceUi(locale);
  const names = SERVICE_NAMES[locale];
  const isRtl = locale === 'ar';

  const { origin } = await getRequestSite();
  const pageUrl = absoluteUrl(locale, `/services/${slug}`, origin);
  const graph = [
    serviceNode({
      origin,
      pageUrl,
      locale,
      name: names[slug],
      description: content.answer,
      category: SERVICE_CATEGORY[slug],
    }),
    faqNode(pageUrl, content.faq),
  ];

  // Autres prestations : celles de la même catégorie d'abord.
  const others = SERVICE_SLUGS.filter((s) => s !== slug).sort(
    (a, b) =>
      Number(SERVICE_CATEGORY[b] === SERVICE_CATEGORY[slug]) -
      Number(SERVICE_CATEGORY[a] === SERVICE_CATEGORY[slug]),
  );

  return (
    <div className={isRtl ? styles.rtl : ''}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />

      <DetailHero id="service-hero" title={content.h1} answer={content.answer} eyebrow={names[slug]} />

      <section className={styles.section} id="livrables">
        <div className="container">
          <div className={styles.narrow}>
            <h2 data-rv className={styles.h2}>{ui.whatYouGet}</h2>
            <ul className={styles.cards}>
              {content.deliverables.map((item) => (
                <li key={item} data-rv="zoom" className={styles.card}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section} id="public">
        <div className="container">
          <div className={styles.narrow}>
            <h2 data-rv className={styles.h2}>{ui.forWhomTitle}</h2>
            <ul className={styles.list}>
              {content.forWhom.map((item) => (
                <li key={item} data-rv>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section} id="deroule">
        <div className="container">
          <div className={styles.narrow}>
            <h2 data-rv className={styles.h2}>{ui.processTitle}</h2>
            <ol className={styles.steps}>
              {ui.processSteps.map((step) => (
                <li key={step.title} data-rv className={styles.step}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section} id="faq">
        <div className="container">
          <div className={styles.narrow}>
            <h2 data-rv className={styles.h2}>{ui.faqTitle}</h2>
            <FaqDetails items={content.faq} />
          </div>
        </div>
      </section>

      <CtaBand id="cta" title={ui.ctaTitle} description={ui.ctaText}>
        <Link href={devisHref(locale, slug)} className="btn btn-cta">
          {ui.ctaButton}
        </Link>
      </CtaBand>

      <section className={styles.section} id="autres-services">
        <div className="container">
          <div className={styles.narrow}>
            <h2 data-rv className={styles.h2}>{ui.otherServices}</h2>
            <ul className={styles.links}>
              {others.map((other) => (
                <li key={other} data-rv>
                  <Link href={`/${locale}/services/${other}`} className={styles.link}>
                    {names[other]}
                  </Link>
                </li>
              ))}
              <li data-rv>
                <Link href={`/${locale}/services`} className={styles.link}>
                  {ui.allServices}
                </Link>
              </li>
            </ul>
            <h2 data-rv className={styles.h2} style={{ marginTop: '2rem' }}>
              {ui.guidesTitle}
            </h2>
            <ul className={styles.links}>
              {GUIDE_SLUGS.map((guide) => (
                <li key={guide} data-rv>
                  <Link href={`/${locale}/guides/${guide}`} className={styles.link}>
                    {GUIDE_TITLES[locale][guide]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

// app/[locale]/guides/page.tsx
// Index des guides pratiques (contenu : lib/data/guides.ts).
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import DetailHero from '@/components/detail/DetailHero';
import styles from '@/components/detail/Detail.module.css';
import { locales, type Locale } from '@/i18n/config';
import { GUIDES, GUIDE_UI } from '@/lib/data/guides';
import { GUIDE_SLUGS } from '@/lib/data/servicesIndex';
import { buildMetadata } from '@/lib/metadata';
import { isLocale } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ui = GUIDE_UI[locale];
  return buildMetadata({
    locale,
    path: '/guides',
    title: ui.indexTitle,
    description: ui.indexSummary,
  });
}

export default async function GuidesIndexPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const ui = GUIDE_UI[locale];
  const isRtl = locale === 'ar';
  const h1 = ui.indexTitle.split('|')[0].trim();

  return (
    <div className={isRtl ? styles.rtl : ''}>
      <DetailHero id="guides-hero" title={h1} answer={ui.indexIntro} />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.guideGrid}>
            {GUIDE_SLUGS.map((slug) => {
              const guide = GUIDES[locale][slug];
              return (
                <article key={slug} data-rv="zoom" className={styles.guideCard}>
                  <h2>{guide.h1}</h2>
                  <p>{guide.summary}</p>
                  <Link href={`/${locale}/guides/${slug}`} className="btn btn-cta btn-sm">
                    {ui.readGuide}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

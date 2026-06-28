// app/[locale]/faq/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import { Icons } from '@/components/icons/Icons';
import FaqAccordion from '@/components/faq/FaqAccordion';
import styles from './page.module.css'; // ✅ import du module CSS
import { buildMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  return await buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    locale,
    path: '/faq',
  });
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FAQPage' });
  const tFaq = await getTranslations({ locale, namespace: 'FaqAccordion' });
  const isRtl = locale === 'ar';
  
  // Récupérer les items FAQ (tableau d'objets)
  const faqItems = tFaq.raw('items') as Array<{ id: number; question: string; answer: string }>;

  return (
    // ✅ Conteneur RTL
    <div className={isRtl ? styles.rtlPage : ''}>
      <section className="hero" id="faq-hero">
        <div className="hero-inner container">
          <div className="hero-visual" data-animate="visual">
            <div className="hero-glow"></div>
            <Image
              className="hero-logo"
              src={logoData}
              alt="IRIS Junior Entreprise"
              width={300}
              height={300}
              priority
            />
          </div>
          <div className="hero-content" data-animate="content">
            <h1 dangerouslySetInnerHTML={{ __html: t.raw('hero.title') }} />
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              {t('hero.description')}
            </p>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true">
          <Icons.ChevronDown size={22} />
        </span>
      </section>

      <section style={{ padding: '3rem 0 5rem', background: 'var(--background)' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="faq-card">
              {/* Le composant gère déjà son propre RTL via la prop locale */}
              <FaqAccordion items={faqItems} locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
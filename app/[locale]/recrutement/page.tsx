// app/[locale]/recrutement/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import RecruitmentForm from '@/components/forms/RecruitmentForm';
import RecruitmentClosed from '@/components/recruitment/RecruitmentClosed';
import { isRecruitmentOpen } from '@/lib/utils/date';
import styles from './page.module.css'; // ✅ import du module CSS

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RecruitmentPage' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: 'https://irisje.com/recrutement',
      languages: {
        fr: '/fr/recrutement',
        en: '/en/recrutement',
        ar: '/ar/recrutement',
      },
    },
  };
}

export default async function RecrutementPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RecruitmentPage' });
  const open = isRecruitmentOpen();
  const isRtl = locale === 'ar';

  return (
    // ✅ Conteneur RTL
    <div className={isRtl ? styles.rtlPage : ''}>
      <section className="hero" id="recrutement-hero">
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
            <h1
              dangerouslySetInnerHTML={{
                __html: open ? t.raw('hero.title_open') : t.raw('hero.title_closed'),
              }}
            />
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              {open ? t('hero.description_open') : t('hero.description_closed')}
            </p>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </section>

      <section style={{ padding: '3rem 0 5rem', background: 'var(--background)' }}>
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="contact-card">
              {/* Les composants gèrent leur propre RTL via la prop locale */}
              {open ? <RecruitmentForm locale={locale} /> : <RecruitmentClosed locale={locale} />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import logoData from '@/public/logo-s-no-bg.png';
import Slider from '@/components/ui/Slider';
import { getSliderSlides } from '@/lib/data/sliderData';
import { Icons } from '@/components/icons/Icons';
import styles from './page.module.css';

import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return buildMetadata('/', locale);
}

type Props = {
  params: Promise<{ locale: string }>;
};



export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const tSlider = await getTranslations({ locale, namespace: 'Slider' });

  const slides = getSliderSlides(locale, tSlider);
  const isRtl = locale === 'ar';

  return (
    <div className={isRtl ? styles.rtlPage : ''}>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="hero" id="accueil">
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
            <div className="hero-actions">
              <Link href={`/${locale}/contact`} className="btn btn-cta">
                {t('hero.cta_start')}
              </Link>
              <a href="#services" className="btn btn-outline">
                {t('hero.cta_services')}
              </a>
            </div>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </section>

      {/* ============================================================
          SLIDER
          ============================================================ */}
      <div className="container">
        <Slider slides={slides} autoplay={false} locale={locale} />
      </div>

      {/* ============================================================
          SECTION SERVICES
          ============================================================ */}
      <section className="placeholder" id="services">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              {t('services.title')}
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                maxWidth: '720px',
                margin: '0 auto',
              }}
            >
              {t('services.description')}
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href={`/${locale}/services`} className="btn btn-cta">
                {t('services.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION À PROPOS
          ============================================================ */}
      <section
        className="placeholder section-alt"
        id="a-propos"
        style={{
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              {t('about.title')}
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                maxWidth: '720px',
                margin: '0 auto',
              }}
            >
              {t('about.description_1')}
            </p>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                maxWidth: '720px',
                margin: '1.5rem auto 0',
              }}
            >
              {t('about.description_2')}
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href={`/${locale}/a-propos`} className="btn btn-cta">
                {t('about.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION DEVIS (CTA)
          ============================================================ */}
      <section
        className="placeholder"
        id="devis"
        style={{
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              background: 'var(--surface)',
              padding: '3rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 102, 51, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--secondary)',
                }}
              >
                <Icons.FileText size={32} stroke="var(--secondary)" strokeWidth={1.5} />
              </div>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}
            >
              {t('devis.title')}
            </h2>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 1.5rem',
              }}
            >
              {t('devis.description_1')}
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'var(--text-muted)',
                maxWidth: '550px',
                margin: '0 auto 1.5rem',
              }}
            >
              {t('devis.description_2')}
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <Link href={`/${locale}/devis`} className="btn btn-cta">
                {t('devis.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION CONTACT
          ============================================================ */}
      <section
        className="placeholder"
        id="contact"
        style={{
          borderBottom: 'none',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              {t('contact.title')}
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                maxWidth: '720px',
                margin: '0 auto',
              }}
            >
              {t('contact.description_1')}
            </p>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '1rem auto 0',
              }}
            >
              {t('contact.description_2')}
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'var(--text-muted)',
                maxWidth: '550px',
                margin: '0.75rem auto 0',
                fontStyle: 'italic',
              }}
            >
              {t('contact.description_3')}
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href={`/${locale}/contact`} className="btn btn-cta">
                {t('contact.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
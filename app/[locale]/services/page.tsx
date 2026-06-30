// app/[locale]/services/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import { Icons } from '@/components/icons/Icons';
import Link from 'next/link';
import styles from './page.module.css';
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
    path: '/services',
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  const isRtl = locale === 'ar';

  return (
    <div className={isRtl ? styles.rtlPage : ''}>
      {/* HERO SERVICES */}
      <section className="hero" id="services-hero">
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
            <h1>
              {t.rich('hero.title', {
                accent: (chunks) => <span className="accent-text">{chunks}</span>,
              })}
            </h1>
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

      {/* INTRODUCTION */}
      <section
        className="placeholder"
        id="introduction"
        style={{ minHeight: 'auto', padding: '4rem 0' }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">{t('introduction.title')}</h2>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: '1.7',
              color: 'var(--text-secondary)',
              textAlign: 'justify',
            }}
          >
            {t('introduction.description')}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {[
              { icon: <Icons.CodeSlash size={32} stroke="var(--primary)" />, label: t('it.title') },
              {
                icon: <Icons.MarketingMegaphone size={32} stroke="var(--primary)" />,
                label: t('marketing.title'),
              },
              {
                icon: <Icons.Business_dep size={32} stroke="var(--primary)" />,
                label: t('etudes.title'),
              },
            ].map((item, index) => (
              <div
                key={index}
                className={isRtl ? styles.valueCardRtl : styles.valueCard}
                style={{ padding: '1.25rem', maxWidth: '200px', margin: '0 auto' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    color: 'var(--primary)',
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  className={isRtl ? styles.valueTitleRtl : styles.valueTitle}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.label}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 1 : IT
          ============================================================ */}
      <section
        className="placeholder section-alt"
        id="it"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Icons.CodeSlash size={32} stroke="var(--primary)" />
              {t('it.title')}
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
              }}
            >
              {t('it.subtitle')}
            </p>

            {/* Prestation 1 : Développement Web */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.WebDevBrowser size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('it.web.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('it.web.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">React JS</span>
                <span className="tool-tag">FastAPI</span>
                <span className="tool-tag">WordPress</span>
                <span className="tool-tag">HTML/CSS/JS</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('it.web.cta')}
              </Link>
            </div>

            {/* Prestation 2 : Développement Mobile */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.MobileDev size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('it.mobile.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('it.mobile.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Flutter</span>
                <span className="tool-tag">Dart</span>
                <span className="tool-tag">Android Studio</span>
                <span className="tool-tag">Firebase</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('it.mobile.cta')}
              </Link>
            </div>

            {/* Prestation 3 : Création de chatbots */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.Chatbot size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('it.chatbot.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('it.chatbot.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Dialogflow</span>
                <span className="tool-tag">IA</span>
                <span className="tool-tag">API</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('it.chatbot.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 : MARKETING
          ============================================================ */}
      <section
        className="placeholder"
        id="marketing"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Icons.MarketingMegaphone size={32} stroke="var(--primary)" />
              {t('marketing.title')}
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
              }}
            >
              {t('marketing.subtitle')}
            </p>

            {/* Prestation 1 : Branding */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.Palette size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('marketing.branding.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('marketing.branding.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Adobe Illustrator</span>
                <span className="tool-tag">Photoshop</span>
                <span className="tool-tag">Figma</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('marketing.branding.cta')}
              </Link>
            </div>

            {/* Prestation 2 : Community Management */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.Share size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('marketing.community.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('marketing.community.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Meta Business Suite</span>
                <span className="tool-tag">CapCut</span>
                <span className="tool-tag">Hootsuite</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('marketing.community.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 : ÉTUDES
          ============================================================ */}
      <section
        className="placeholder section-alt"
        id="etudes"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: 'none',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Icons.Business_dep size={32} stroke="var(--primary)" />
              {t('etudes.title')}
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
              }}
            >
              {t('etudes.subtitle')}
            </p>

            {/* Prestation 1 : Étude de marché */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.Search size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('etudes.marche.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('etudes.marche.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Google Forms</span>
                <span className="tool-tag">SWOT</span>
                <span className="tool-tag">PESTEL</span>
                <span className="tool-tag">Google Sheets</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('etudes.marche.cta')}
              </Link>
            </div>

            {/* Prestation 2 : Étude de notoriété */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.VisibilitySurvey size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('etudes.notoriete.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('etudes.notoriete.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Google Forms</span>
                <span className="tool-tag">Google Sheets</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('etudes.notoriete.cta')}
              </Link>
            </div>

            {/* Prestation 3 : Étude de satisfaction */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.Heart size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('etudes.satisfaction.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('etudes.satisfaction.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Google Forms</span>
                <span className="tool-tag">Google Sheets</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('etudes.satisfaction.cta')}
              </Link>
            </div>

            {/* Prestation 4 : Plan d'affaires */}
            <div className={isRtl ? styles.serviceCardRtl : styles.serviceCard}>
              <div className={isRtl ? styles.serviceHeaderRtl : styles.serviceHeader}>
                <div className={isRtl ? styles.serviceIconRtl : styles.serviceIcon}>
                  <Icons.BusinessPlanDoc size={28} stroke="var(--primary)" />
                </div>
                <h3 className={isRtl ? styles.serviceTitleRtl : styles.serviceTitle}>
                  {t('etudes.business.title')}
                </h3>
              </div>
              <p className={isRtl ? styles.serviceDescRtl : styles.serviceDesc}>
                {t('etudes.business.desc')}
              </p>
              <div className={isRtl ? styles.serviceToolsRtl : styles.serviceTools}>
                <span className="tool-tag">Business Model Canvas</span>
                <span className="tool-tag">Google Sheets</span>
                <span className="tool-tag">Google Docs</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('etudes.business.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="placeholder"
        id="cta"
        style={{
          minHeight: 'auto',
          padding: '3rem 0',
          background: 'var(--background-hero)',
          borderBottom: 'none',
        }}
      >
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--text-inverse)',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            {t('cta.title')}
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1.05rem',
              marginBottom: '1.5rem',
            }}
          >
            {t('cta.description')}
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link href={`/${locale}/contact`} className="btn btn-cta">
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
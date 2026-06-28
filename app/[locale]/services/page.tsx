// app/[locale]/services/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import { Icons } from '@/components/icons/Icons';
import Link from 'next/link';
import styles from './page.module.css'; // ✅ import du module CSS
import { buildMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  return buildMetadata({
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
    // ✅ Conteneur RTL
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
              textAlign: 'center',
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
              { icon: <Icons.Code size={32} stroke="var(--primary)" />, label: t('it.title') },
              {
                icon: <Icons.Megaphone size={32} stroke="var(--primary)" />,
                label: t('marketing.title'),
              },
              {
                icon: <Icons.Chart size={32} stroke="var(--primary)" />,
                label: t('etudes.title'),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="value-card"
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
              <Icons.Code size={32} stroke="var(--primary)" />
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
            <div className="service-card">
              <div className="service-header">
                <Icons.Globe size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('it.web.title')}</h3>
              </div>
              <p className="service-desc">{t('it.web.desc')}</p>
              <div className="service-tools">
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
            <div className="service-card">
              <div className="service-header">
                <Icons.Smartphone size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('it.mobile.title')}</h3>
              </div>
              <p className="service-desc">{t('it.mobile.desc')}</p>
              <div className="service-tools">
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
            <div className="service-card">
              <div className="service-header">
                <Icons.Chatbot size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('it.chatbot.title')}</h3>
              </div>
              <p className="service-desc">{t('it.chatbot.desc')}</p>
              <div className="service-tools">
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
              <Icons.Megaphone size={32} stroke="var(--primary)" />
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
            <div className="service-card">
              <div className="service-header">
                <Icons.Palette size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('marketing.branding.title')}</h3>
              </div>
              <p className="service-desc">{t('marketing.branding.desc')}</p>
              <div className="service-tools">
                <span className="tool-tag">Adobe Illustrator</span>
                <span className="tool-tag">Photoshop</span>
                <span className="tool-tag">Figma</span>
                <span className="tool-tag">Canva</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('marketing.branding.cta')}
              </Link>
            </div>

            {/* Prestation 2 : Community Management */}
            <div className="service-card">
              <div className="service-header">
                <Icons.Share size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('marketing.community.title')}</h3>
              </div>
              <p className="service-desc">{t('marketing.community.desc')}</p>
              <div className="service-tools">
                <span className="tool-tag">Meta Business Suite</span>
                <span className="tool-tag">Canva</span>
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
              <Icons.Chart size={32} stroke="var(--primary)" />
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
            <div className="service-card">
              <div className="service-header">
                <Icons.Target size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('etudes.marche.title')}</h3>
              </div>
              <p className="service-desc">{t('etudes.marche.desc')}</p>
              <div className="service-tools">
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
            <div className="service-card">
              <div className="service-header">
                <Icons.BarChart size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('etudes.notoriete.title')}</h3>
              </div>
              <p className="service-desc">{t('etudes.notoriete.desc')}</p>
              <div className="service-tools">
                <span className="tool-tag">Google Forms</span>
                <span className="tool-tag">Google Sheets</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('etudes.notoriete.cta')}
              </Link>
            </div>

            {/* Prestation 3 : Étude de satisfaction */}
            <div className="service-card">
              <div className="service-header">
                <Icons.Heart size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('etudes.satisfaction.title')}</h3>
              </div>
              <p className="service-desc">{t('etudes.satisfaction.desc')}</p>
              <div className="service-tools">
                <span className="tool-tag">Google Forms</span>
                <span className="tool-tag">Google Sheets</span>
              </div>
              <Link href={`/${locale}/devis`} className="btn btn-cta btn-sm">
                {t('etudes.satisfaction.cta')}
              </Link>
            </div>

            {/* Prestation 4 : Plan d'affaires */}
            <div className="service-card">
              <div className="service-header">
                <Icons.Briefcase size={28} stroke="var(--primary)" />
                <h3 className="service-title">{t('etudes.business.title')}</h3>
              </div>
              <p className="service-desc">{t('etudes.business.desc')}</p>
              <div className="service-tools">
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
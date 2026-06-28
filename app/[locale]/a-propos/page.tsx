// app/[locale]/a-propos/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import { Icons } from '@/components/icons/Icons';
import Portfolio, { type Project } from '@/components/portfolio/Portfolio';
import styles from './page.module.css';
import { buildMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return buildMetadata('/a-propos', locale);
}

// ─────────────────────────────────────────────────────────────
// Projets — remplacer par un fetch CMS/API si besoin
// Chaque projet peut avoir un champ `url` optionnel (voir type Project)
// ─────────────────────────────────────────────────────────────
const projects: Project[] = [
  /* {
    id: 1,
    title: 'Site web pour Startup XYZ',
    description: "Développement d'un site vitrine moderne avec React et Next.js.",
    category: 'IT',
    tags: ['React', 'Next.js', 'Tailwind'],
    client: 'Startup XYZ',
    year: 2025,
    results: '+40% de visibilité',
    // url: 'https://example.com', // décommenter si disponible
  }, */
];

export default async function AProposPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  const isRtl = locale === 'ar';

  const values = [
    {
      icon: <Icons.Innovation size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.innovation.title'),
      desc: t('values.innovation.desc'),
    },
    {
      icon: <Icons.Resourcefulness size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.resourcefulness.title'),
      desc: t('values.resourcefulness.desc'),
    },
    {
      icon: <Icons.Inspiration size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.inspiration.title'),
      desc: t('values.inspiration.desc'),
    },
    {
      icon: <Icons.Strategy size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.strategy.title'),
      desc: t('values.strategy.desc'),
    },
    {
      icon: <Icons.Professionalism size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.professionalism.title'),
      desc: t('values.professionalism.desc'),
    },
    {
      icon: <Icons.Engagement size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.engagement.title'),
      desc: t('values.engagement.desc'),
    },
  ];

  return (
    <div className={isRtl ? styles.rtlPage : ''}>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="hero" id="apropos-hero">
        <div className="hero-inner container">
          <div className="hero-visual" data-animate="visual">
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

      {/* ============================================================
          SECTION 1 : QUI SOMMES-NOUS
          ============================================================ */}
      <section
        className="placeholder"
        id="qui-sommes-nous"
        style={{ minHeight: 'auto', padding: '4rem 0' }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">{t('who_we_are.title')}</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: t.raw('who_we_are.description_1') }}
            />
            <p
              style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: t.raw('who_we_are.description_2') }}
            />
            <div className="vocation-grid">
              {/* Carte Pédagogique */}
              <div className="value-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    color: 'var(--primary)',
                  }}
                >
                  <Icons.Education size={36} stroke="var(--primary)" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('who_we_are.vocation_pedagogique')}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {t('who_we_are.vocation_pedagogique_desc')}
                </p>
              </div>
              {/* Carte Économique */}
              <div className="value-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    color: 'var(--primary)',
                  }}
                >
                  <Icons.Business size={36} stroke="var(--primary)" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('who_we_are.vocation_economique')}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {t('who_we_are.vocation_economique_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 : NOTRE MISSION
          ============================================================ */}
      <section
        className="placeholder section-alt"
        id="notre-mission"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">{t('mission.title')}</h2>
          <div className="mission-block">
            <p
              style={{
                fontSize: '1.1rem',
                lineHeight: '1.8',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
              }}
            >
              {t('mission.quote')}
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                marginTop: '1rem',
              }}
            >
              {t('mission.description')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 : NOTRE VISION
          ============================================================ */}
      <section
        className="placeholder"
        id="notre-vision"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">{t('vision.title')}</h2>
          <div
            style={{
              background: 'var(--surface)',
              padding: '2rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: isRtl ? 'none' : '4px solid var(--primary)',
              borderRight: isRtl ? '4px solid var(--primary)' : 'none',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            }}
          >
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              {t('vision.description_1')}
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              {t('vision.description_2')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 : NOS VALEURS
          ============================================================ */}
      <section
        className="placeholder section-alt"
        id="nos-valeurs"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <h2 className="section-title">{t('values.title')}</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    color: 'var(--primary)',
                  }}
                >
                  {value.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {value.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 : PORTFOLIO
          Affiché uniquement si projects.length > 0.
          Fond blanc (var(--surface)) — alterne avec Nos Valeurs (section-alt).
          ============================================================ */}
      <Portfolio projects={projects} locale={locale} />
    </div>
  );
}
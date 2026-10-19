// app/[locale]/a-propos/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import { Icons } from '@/components/icons/Icons';
import Portfolio, { type Project } from '@/components/portfolio/Portfolio';
import ValueCards from '@/components/ui/ValueCards';
import Organigramme from '@/components/organigramme/Organigramme';
import IntroSection from '@/components/ui/IntroSection';
import TunisiaMapLoader from '@/components/map/TunisiaMapLoader';
import ItineraryButton from '@/components/map/ItineraryButton';
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
    path: '/a-propos',
  });
}

// ─────────────────────────────────────────────────────────────
// Projets — remplacer par un fetch CMS/API si besoin.
// Le projet d'exemple est localisé via le namespace `Portfolio`
// (clés `sample_project.*` dans messages/{fr,en,ar}.json).
// Chaque projet peut avoir un champ `url` optionnel (voir type Project),
// et `featured: true` pour la carte « à la une ».
// ─────────────────────────────────────────────────────────────

export default async function AProposPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  const tp = await getTranslations({ locale, namespace: 'Portfolio' });
  const isRtl = locale === 'ar';

  const projects: Project[] = [
    {
      id: 'sample-booking-platform',
      title: tp('sample_project.title'),
      description: tp('sample_project.description'),
      category: 'IT',
      image: '/portfolio/booking-platform.svg',
      tags: ['Next.js', 'React', 'UI/UX', 'SEO'],
      client: tp('sample_project.client'),
      year: 2025,
      results: tp('sample_project.results'),
      featured: true,
    },
  ];

  const values = [
    {
      key: 'innovation',
      icon: <Icons.Innovation size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.innovation.title'),
      desc: t('values.innovation.desc'),
    },
    {
      key: 'resourcefulness',
      icon: <Icons.Resourcefulness size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.resourcefulness.title'),
      desc: t('values.resourcefulness.desc'),
    },
    {
      key: 'inspiration',
      icon: <Icons.Inspiration size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.inspiration.title'),
      desc: t('values.inspiration.desc'),
    },
    {
      key: 'strategy',
      icon: <Icons.Strategy size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.strategy.title'),
      desc: t('values.strategy.desc'),
    },
    {
      key: 'professionalism',
      icon: <Icons.Professionalism size={32} stroke="var(--primary)" strokeWidth={1.8} />,
      title: t('values.professionalism.title'),
      desc: t('values.professionalism.desc'),
    },
    {
      key: 'engagement',
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
      <IntroSection
        id="qui-sommes-nous"
        title={t('who_we_are.title')}
        paragraphs={[t.raw('who_we_are.description_1') as string]}
        allowHtml
      >
        {/* Cartes « double vocation » désactivées (conservées telles quelles) :
            pour les réactiver, les entourer de <div className="vocation-grid">. */}
        {/* Carte Pédagogique */}
        {/* <div className="value-card">
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
        </div> */}
        {/* Carte Économique */}
        {/* <div className="value-card">
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
        </div> */}
      </IntroSection>

      {/* ============================================================
          SECTION 2 : NOTRE MISSION
          ============================================================ */}
      <section
        className="placeholder section-alt"
        suppressHydrationWarning
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
                textAlign: 'justify',
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
                textAlign: 'justify',
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
        suppressHydrationWarning
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
            className={styles.visionBlock}
            style={{
              borderLeft: isRtl ? 'none' : '4px solid var(--primary)',
              borderRight: isRtl ? '4px solid var(--primary)' : 'none',
            }}
          >
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                textAlign: 'justify',
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
                textAlign: 'justify',
              }}
            >
              {t('vision.description_2')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 : NOS VALEURS - CARTES À RETOURNEMENT
          ============================================================ */}
      <section
        className="placeholder section-alt"
        suppressHydrationWarning
        id="nos-valeurs"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <h2 className="section-title">{t('values.title')}</h2>
          {/* Cartes à retournement : nom de la valeur devant, description derrière */}
          <ValueCards
            items={values}
            hintHover={t('values.hint_hover')}
            hintTouch={t('values.hint_touch')}
            revealLabel={t('values.reveal')}
          />
        </div>
      </section>

      {/* ============================================================
          SECTION 5 : ORGANIGRAMME
          Fond blanc (placeholder) — alterne avec Nos Valeurs (section-alt).
          Structure et noms : lib/data/organigramme.ts
          Intitulés des postes : namespace `Organigramme` des messages.
          ============================================================ */}
      <section
        className="placeholder"
        suppressHydrationWarning
        id="organigramme"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Organigramme locale={locale} />
        </div>
      </section>

      {/* ============================================================
          SECTION 6 : NOUS TROUVER - CARTE DE LA TUNISIE
          Fond alterné (section-alt) — alterne avec l'Organigramme (blanc).
          Rendu client uniquement (Leaflet) via TunisiaMapLoader (ssr: false).
          ============================================================ */}
      <section
        className="placeholder section-alt"
        suppressHydrationWarning
        id="nous-trouver"
        style={{
          minHeight: 'auto',
          padding: '4rem 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 className="section-title">{t('map.title')}</h2>
          <div className={styles.mapWrapper}>
            {/* Carte d'information */}
            <div className={styles.mapInfo}>
              <div className={styles.mapInfoLabel}>{t('map.label')}</div>
              <p className={styles.mapInfoDescription}>{t('map.description')}</p>

              <div className={styles.locationList}>
                <div className={styles.locationItem}>
                  <div className={styles.locationIcon} aria-hidden="true">
                    <Icons.MapPin size={20} />
                  </div>
                  <div className={styles.locationContent}>
                    <div className={styles.locationLabel}>{t('map.address_label')}</div>
                    <div className={styles.locationValue}>{t('map.address')}</div>
                  </div>
                </div>

                <div className={styles.locationItem}>
                  <div className={styles.locationIcon} aria-hidden="true">
                    <Icons.GraduationCap size={20} />
                  </div>
                  <div className={styles.locationContent}>
                    <div className={styles.locationLabel}>{t('map.institution_label')}</div>
                    <div className={styles.locationValue}>{t('map.institution')}</div>
                  </div>
                </div>

                <div className={styles.locationItem}>
                  <div className={styles.locationIcon} aria-hidden="true">
                    <Icons.Target size={20} />
                  </div>
                  <div className={styles.locationContent}>
                    <div className={styles.locationLabel}>{t('map.coordinates_label')}</div>
                    <div className={styles.locationValue}>{t('map.coordinates')}</div>
                  </div>
                </div>
              </div>

              {/* Itinéraire temps réel : ouvre Google Maps dans une petite
                  fenêtre, depuis la position de l'utilisateur (geolocation)
                  jusqu'aux coordonnées affichées sur la carte. */}
              <ItineraryButton
                destination="34.72732618156304,10.717072094398517"
                className={styles.mapItineraryBtn}
              />
            </div>

            {/* Carte Leaflet (chargée côté client, marqueur orange IRIS JE) */}
            <div className={styles.mapColumn}>
              <TunisiaMapLoader
                markerLabel="IRIS Junior Entreprise"
                countryLabel={t('map.country_label')}
                attribution={t('map.attribution')}
                errorLabel={t('map.error')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7 : PORTFOLIO
          Affiché uniquement si projects.length > 0.
          Fond blanc (var(--surface)) — alterne avec Nos Valeurs (section-alt).
          ============================================================ */}
      <Portfolio projects={projects} locale={locale} />
    </div>
  );
}
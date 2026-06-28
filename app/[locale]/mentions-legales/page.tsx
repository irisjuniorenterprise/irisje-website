// app/[locale]/mentions-legales/page.tsx
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import { Icons } from '@/components/icons/Icons';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MentionsLegalesPage' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: 'https://irisje.com/mentions-legales',
      languages: {
        fr: '/fr/mentions-legales',
        en: '/en/mentions-legales',
        ar: '/ar/mentions-legales',
      },
    },
  };
}

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MentionsLegalesPage' });
  const isRtl = locale === 'ar';

  const sections = [
    { id: 'editeur', icon: Icons.FileText, titleKey: 'editeur.title', descKey: 'editeur.desc' },
    { id: 'adresse', icon: Icons.MapPin, titleKey: 'adresse.title', descKey: 'adresse.desc' },
    { id: 'telephone', icon: Icons.Phone, titleKey: 'telephone.title', descKey: 'telephone.desc' },
    { id: 'email', icon: Icons.Mail, titleKey: 'email.title', descKey: 'email.desc' },
    { id: 'responsable', icon: Icons.User, titleKey: 'responsable.title', descKey: 'responsable.desc' },
  ];

  return (
    // ✅ Conteneur RTL
    <div className={isRtl ? styles.rtlPage : ''}>
      <section className="hero" id="mentions-legales-hero">
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="legal-card">
              {sections.map((section, index) => (
                <div key={section.id}>
                  <div className="legal-section">
                    <div className="legal-icon">
                      <section.icon size={28} stroke="var(--primary)" />
                    </div>
                    <div className="legal-content">
                      <h2 className="legal-title">{t(section.titleKey)}</h2>
                      <p dangerouslySetInnerHTML={{ __html: t.raw(section.descKey) }} />
                    </div>
                  </div>
                  {index < sections.length - 1 && <div className="legal-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
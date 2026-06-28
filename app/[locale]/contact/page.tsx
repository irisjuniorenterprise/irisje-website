// app/[locale]/contact/page.tsx
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import ContactForm from '@/components/forms/ContactForm';
import { Icons } from '@/components/icons/Icons';
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
    path: '/contact',
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ContactPage' });

  return (
    <>
      {/* HERO CONTACT */}
      <section className="hero" id="contact-hero">
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

      {/* SECTION FORMULAIRE */}
      <section style={{ padding: '3rem 0 5rem', background: 'var(--background)' }}>
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="contact-card">
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
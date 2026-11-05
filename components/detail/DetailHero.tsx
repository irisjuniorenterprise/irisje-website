// components/detail/DetailHero.tsx
//
// Hero des pages de détail (services, guides) : même habillage que les autres
// pages (classes globales `.hero`), avec le titre H1 et, juste dessous, la
// RÉPONSE DIRECTE de 40 à 60 mots — le passage que Google (extraits en
// vedette, AI Overviews) et les assistants IA (ChatGPT, Gemini, Perplexity,
// Claude) citent en priorité. Composant serveur, aucun JavaScript client.
import Image from 'next/image';
import logoData from '@/public/logo-s-no-bg.png';
import styles from './Detail.module.css';

type DetailHeroProps = {
  id: string;
  title: string;
  /** Réponse directe sous le titre. */
  answer: string;
  /** Petit libellé au-dessus du titre (ex. « Services »). */
  eyebrow?: string;
};

export default function DetailHero({ id, title, answer, eyebrow }: DetailHeroProps) {
  return (
    <section className="hero" id={id}>
      <div className="hero-inner container">
        <div className="hero-visual" data-animate="visual">
          <div className="hero-glow"></div>
          <Image className="hero-logo" src={logoData} alt="" width={300} height={300} priority />
        </div>
        <div className="hero-content" data-animate="content">
          {eyebrow && <div className={styles.heroLabel}>{eyebrow}</div>}
          <h1>{title}</h1>
          <p className={styles.heroLead}>{answer}</p>
        </div>
      </div>
    </section>
  );
}

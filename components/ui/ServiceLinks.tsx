// components/ui/ServiceLinks.tsx
//
// Liens internes vers les pages de détail de chaque prestation et vers les
// guides. Maillage interne = chemin de crawl direct pour Google et signal
// de structure thématique pour les assistants IA. Composant serveur.
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import {
  GUIDE_SLUGS,
  GUIDE_TITLES,
  SERVICE_NAMES,
  SERVICE_SLUGS,
} from '@/lib/data/servicesIndex';
import styles from '@/components/detail/Detail.module.css';

const TITLES: Record<Locale, { services: string; guides: string }> = {
  fr: { services: 'Découvrez chaque prestation en détail', guides: 'Guides pratiques' },
  en: { services: 'Explore each service in detail', guides: 'Practical guides' },
  ar: { services: 'اكتشف كل خدمة بالتفصيل', guides: 'أدلة عملية' },
};

export default function ServiceLinks({ locale }: { locale: Locale }) {
  const titles = TITLES[locale];
  return (
    <section className={styles.section} id="detail-services">
      <div className="container">
        <div className={styles.narrow}>
          <h2 className={styles.h2}>{titles.services}</h2>
          <ul className={styles.links}>
            {SERVICE_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/${locale}/services/${slug}`} className={styles.link}>
                  {SERVICE_NAMES[locale][slug]}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className={styles.h2} style={{ marginTop: '2rem' }}>
            {titles.guides}
          </h2>
          <ul className={styles.links}>
            {GUIDE_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/${locale}/guides/${slug}`} className={styles.link}>
                  {GUIDE_TITLES[locale][slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

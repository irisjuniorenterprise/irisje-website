// components/detail/FaqDetails.tsx
//
// FAQ en <details>/<summary> natifs : le texte des réponses est dans le HTML
// (indexable, citable par les IA), l'ouverture fonctionne sans JavaScript et
// au clavier. Le JSON-LD FAQPage correspondant est émis par la page.
import type { FaqItem } from '@/lib/data/servicesIndex';
import styles from './Detail.module.css';

export default function FaqDetails({ items }: { items: FaqItem[] }) {
  return (
    <div className={styles.faq}>
      {items.map((item) => (
        <details key={item.q} data-rv className={styles.faqItem}>
          <summary className={styles.faqQuestion}>{item.q}</summary>
          <p className={styles.faqAnswer}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

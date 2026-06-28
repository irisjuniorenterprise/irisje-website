// components/ui/Slogan.tsx
'use client';

import { usePathname } from 'next/navigation';
import styles from './Slogan.module.css';

export default function Slogan() {
  const pathname = usePathname();
  // Extraire la locale depuis l'URL (ex: /fr/... => fr)
  const locale = pathname?.split('/')[1] || 'fr';
  const isRtl = locale === 'ar';

  return (
    <div className={styles.sloganWrapper}>
      <div className="container">
        <div className={`${styles.sloganContent} ${isRtl ? styles.rtl : ''}`}>
          <span className={styles.hashtag}>#</span>
          <span className={styles.text}>ToTheNEXTLevel</span>
        </div>
      </div>
    </div>
  );
}
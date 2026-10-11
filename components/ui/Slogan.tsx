// components/ui/Slogan.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Slogan.module.css';

export default function Slogan() {
  const pathname = usePathname();
  // Extraire la locale depuis l'URL (ex: /fr/... => fr)
  const locale = pathname?.split('/')[1] || 'fr';
  const isRtl = locale === 'ar';

  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Déclenche l'animation quand le slogan apparaît à l'écran
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.sloganWrapper}>
      <div className="container">
        <div
          ref={contentRef}
          className={`${styles.sloganContent} ${isRtl ? styles.rtl : ''} ${visible ? styles.visible : ''}`}
        >
          {/* Décor : un trait fin qui mène au slogan, terminé par un point orange */}
          <div className={styles.decor} aria-hidden="true">
            <span className={styles.line} />
            <span className={styles.dot} />
          </div>

          {/* Le slogan reste toujours lu de gauche à droite, même en arabe */}
          <div className={styles.textGroup} dir="ltr">
            <span className={styles.hashtag}>#</span>
            <span className={styles.text}>ToTheNEXTLevel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
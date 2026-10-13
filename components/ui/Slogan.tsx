// components/ui/Slogan.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Slogan.module.css';

type Ring = { id: number; x: number; y: number; scale: number };

export default function Slogan() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  const isRtl = locale === 'ar';

  const contentRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [rings, setRings] = useState<Ring[]>([]);
  const [flash, setFlash] = useState(false);

  /* Apparition au scroll */
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

  /* Clic : anneaux qui se propagent bien au-delà des extrémités */
  const handleClick = useCallback(() => {
    const contentEl = contentRef.current;
    const dotEl = dotRef.current;
    if (!contentEl || !dotEl) return;

    const contentRect = contentEl.getBoundingClientRect();
    const dotRect = dotEl.getBoundingClientRect();

    // Position du point orange, relative au composant slogan
    const x = dotRect.left - contentRect.left + dotRect.width / 2;
    const y = dotRect.top - contentRect.top + dotRect.height / 2;

    // Distance max à parcourir depuis le point orange (vers le coin le plus éloigné)
    const distLeft = x;
    const distRight = contentRect.width - x;
    const distTop = y;
    const distBottom = contentRect.height - y;
    const maxDist = Math.max(distLeft, distRight, distTop, distBottom);

    // Rayon de base du ring = 8px (16px / 2)
    const RING_BASE_RADIUS = 8;
    // Facteur de dépassement : >1 = les anneaux vont au-delà des bords
    const OVERSHOOT = 1.6;
    const scale = (maxDist / RING_BASE_RADIUS) * OVERSHOOT;

    const groupId = Date.now();
    const newRings: Ring[] = [
      { id: groupId,     x, y, scale },
      { id: groupId + 1, x, y, scale },
      { id: groupId + 2, x, y, scale },
    ];

    setRings((prev) => [...prev, ...newRings]);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 260);
    window.setTimeout(() => {
      setRings((prev) => prev.filter((r) => !newRings.some((n) => n.id === r.id)));
    }, 1600);
  }, []);

  return (
    <div className={styles.sloganWrapper}>
      <div className="container">
        <div
          ref={contentRef}
          className={`${styles.sloganContent} ${isRtl ? styles.rtl : ''} ${
            visible ? styles.visible : ''
          } ${flash ? styles.cornerFlash : ''}`}
          onClick={handleClick}
        >
          {/* Décor : trait dégradé + point orange */}
          <div className={styles.decor} aria-hidden="true">
            <div className={styles.lineWrap}>
              <span className={styles.lineGlow} />
              <span className={styles.line} />
            </div>
            <span ref={dotRef} className={styles.dot} />
          </div>

          {/* Cadre autour du slogan — le mot n'est jamais stylé */}
          <div className={styles.textFrame}>
            <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
            <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
            <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
            <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />

            {/* Slogan inchangé, toujours LTR */}
            <div className={styles.textGroup} dir="ltr">
              <span className={styles.hashtag}>#</span>
              <span className={styles.text}>ToTheNEXTLevel</span>
            </div>
          </div>

          {/* Anneaux au clic — se propagent jusqu'aux extrémités (et au-delà) */}
          {rings.map((r) => (
            <span
              key={r.id}
              className={styles.ring}
              style={
                {
                  '--rx': `${r.x}px`,
                  '--ry': `${r.y}px`,
                  '--ringScale': r.scale,
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
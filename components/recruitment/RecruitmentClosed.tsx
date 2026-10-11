// components/recruitment/RecruitmentClosed.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import { getNextRecruitmentDate, formatRecruitmentDate } from '@/lib/utils/date';
import styles from './RecruitmentClosed.module.css';

type RecruitmentClosedProps = {
  locale: string;
};

export default function RecruitmentClosed({ locale }: RecruitmentClosedProps) {
  const t = useTranslations('RecruitmentClosed');
  const isRtl = locale === 'ar';

  // Prochaine ouverture : logique centralisée dans lib/utils/date.ts
  const formattedDate = formatRecruitmentDate(getNextRecruitmentDate(), locale);

  return (
    <div
      className={`${styles.closedContainer} ${isRtl ? styles.rtl : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className={styles.iconWrapper}>
        <Icons.Calendar size={48} stroke="var(--text-muted)" strokeWidth={1.5} />
      </div>
      <h2 className={styles.title}>{t('title')}</h2>
      {/* ✅ Utilisation de t.raw() + dangerouslySetInnerHTML pour le HTML */}
      <p
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: t.raw('description') }}
      />
      <p className={styles.note}>
        {t('note')} <strong>{formattedDate}</strong>
      </p>
      <div className={styles.actions}>
        <a href={`/${locale}`} className="btn btn-cta">
          {t('actions.home')}
        </a>
        <a
          href={`/${locale}/contact`}
          className="btn btn-outline"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        >
          {t('actions.contact')}
        </a>
      </div>
    </div>
  );
}
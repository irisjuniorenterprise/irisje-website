// components/faq/FaqAccordion.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './FaqAccordion.module.css';

export type FaqItem = {
  id: string | number;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  locale: string;
};

export default function FaqAccordion({ items, locale }: FaqAccordionProps) {
  const t = useTranslations('FaqAccordion');
  const isRtl = locale === 'ar';
  const [openId, setOpenId] = useState<string | number | null>(null);

  const toggle = (id: string | number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={`${styles.accordion} ${isRtl ? styles.rtl : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Icons.HelpCircle size={32} stroke="var(--primary)" strokeWidth={1.8} />
          {t('title')}
        </h2>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={styles.list}>
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className={styles.item}>
              <button
                className={styles.question}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
              >
                <span className={styles.questionText}>{item.question}</span>
                <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}>
                  <Icons.ChevronDown size={20} stroke="currentColor" />
                </span>
              </button>
              <div
                id={`faq-answer-${item.id}`}
                className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}
                role="region"
                aria-labelledby={`faq-question-${item.id}`}
              >
                <div className={styles.answerContent}>
                  {item.answer.split('\n').map((line, index) => (
                    <p key={index} className={styles.answerText}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
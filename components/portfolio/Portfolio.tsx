// components/portfolio/Portfolio.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './Portfolio.module.css';

export type Project = {
  id: string | number;
  title: string;
  description: string;
  category: string;
  image?: string;
  tags?: string[];
  results?: string;
  client?: string;
  year?: number;
  /** URL optionnel vers le projet (site, repo, étude de cas…) */
  url?: string;
};

type PortfolioProps = {
  projects: Project[];
  locale: string;
};

export default function Portfolio({ projects, locale }: PortfolioProps) {
  const t = useTranslations('Portfolio');
  const isRtl = locale === 'ar';

  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!projects || projects.length === 0) return null;

  const categories = ['all', ...new Set(projects.map((p) => p.category))];

  const filteredProjects =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  const openModal  = (project: Project) => setSelectedProject(project);
  const closeModal = () => setSelectedProject(null);

  return (
    <section className={`${styles.portfolioSection} ${isRtl ? styles.rtl : ''}`}>
      <div className="container">

        {/* ── En-tête ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Icons.Briefcase size={32} stroke="var(--primary)" strokeWidth={1.8} />
            <h2 className={styles.title}>{t('title')}</h2>
          </div>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        {/* ── Filtres ── */}
        {categories.length > 2 && (
          <div className={styles.filters}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? t('filter_all') : cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Grille ── */}
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              onClick={() => openModal(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal(project)}
              aria-label={t('aria_label', { title: project.title })}
            >
              <div className={styles.cardImage}>
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image} alt={project.title} loading="lazy" />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <Icons.Code size={48} stroke="var(--text-muted)" strokeWidth={1.5} />
                  </div>
                )}
                <div className={styles.cardOverlay}>
                  <span className={styles.cardCategory}>{project.category}</span>
                  <Icons.ChevronRight size={24} stroke="var(--on-primary)" />
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{project.title}</h3>
                <p className={styles.cardDesc}>{project.description}</p>
                {project.tags && project.tags.length > 0 && (
                  <div className={styles.cardTags}>
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.cardTag}>{tag}</span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className={styles.cardTag}>+{project.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Modal de détail ── */}
        {selectedProject && (
          <div
            className={styles.modalOverlay}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

              <button
                className={styles.modalClose}
                onClick={closeModal}
                aria-label={t('close_modal')}
              >
                <Icons.X size={24} stroke="currentColor" />
              </button>

              {/* Image */}
              <div className={styles.modalImage}>
                {selectedProject.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedProject.image} alt={selectedProject.title} />
                ) : (
                  <div className={styles.modalPlaceholder}>
                    <Icons.Code size={64} stroke="var(--text-muted)" strokeWidth={1.5} />
                  </div>
                )}
                <span className={styles.modalCategory}>{selectedProject.category}</span>
              </div>

              {/* Corps */}
              <div className={styles.modalBody}>
                <h3 className={styles.modalTitle}>{selectedProject.title}</h3>
                <p className={styles.modalDesc}>{selectedProject.description}</p>

                {/* Méta */}
                {(selectedProject.client || selectedProject.year || selectedProject.results) && (
                  <div className={styles.modalMeta}>
                    {selectedProject.client && (
                      <div className={styles.metaItem}>
                        <Icons.User size={16} stroke="var(--text-muted)" />
                        <span>{t('client_label')} {selectedProject.client}</span>
                      </div>
                    )}
                    {selectedProject.year && (
                      <div className={styles.metaItem}>
                        <Icons.Calendar size={16} stroke="var(--text-muted)" />
                        <span>{selectedProject.year}</span>
                      </div>
                    )}
                    {selectedProject.results && (
                      <div className={styles.metaItem}>
                        <Icons.Chart size={16} stroke="var(--text-muted)" />
                        <span>{selectedProject.results}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className={styles.modalTags}>
                    {selectedProject.tags.map((tag) => (
                      <span key={tag} className={styles.modalTag}>{tag}</span>
                    ))}
                  </div>
                )}

                {/* CTA lien externe */}
                {selectedProject.url && (
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.modalLink}
                  >
                    {t('view_project')}
                    <Icons.ChevronRight size={16} stroke="currentColor" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
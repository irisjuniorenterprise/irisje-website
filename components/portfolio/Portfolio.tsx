// components/portfolio/Portfolio.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
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
  /**
   * Projet « à la une » : affiché en carte large (texte + image côte à
   * côte) au-dessus de la grille. Un seul projet devrait porter ce drapeau.
   */
  featured?: boolean;
};

type PortfolioProps = {
  projects: Project[];
  locale: string;
};

/** Éléments tabulables piégeables dans la modale (focal piège) */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Portfolio({ projects, locale }: PortfolioProps) {
  const t = useTranslations('Portfolio');
  const isRtl = locale === 'ar';

  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // ── Révélation au scroll (fondu + glissement) ──
  // `prefers-reduced-motion` est neutralisé EN CSS : la section reste alors
  // visible même si l'observateur n'ajoute jamais la classe.
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // Sans IntersectionObserver : montée immédiate (via rAF, jamais synchrone).
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ── Modale : Échap, blocage du scroll, focal piège, retour du focal ──
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** Élément qui a ouvert la modale : le focal lui est rendu à la fermeture */
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProject(null);
        return;
      }
      if (event.key !== 'Tab') return;

      // Focal piège : Tab circule uniquement dans la modale ouverte.
      const modal = modalRef.current;
      if (!modal) return;
      const focusables = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // Rend le focal à l'élément d'origine (carte ou bouton CTA).
      openerRef.current?.focus();
    };
  }, [selectedProject]);

  if (!projects || projects.length === 0) return null;

  const categories = ['all', ...new Set(projects.map((p) => p.category))];

  const filteredProjects =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  // Le projet « à la une » n'est mis en avant que s'il survit au filtre actif.
  const featuredProject = filteredProjects.find((p) => p.featured);

  const openModal = (project: Project, trigger: HTMLElement | null) => {
    openerRef.current = trigger;
    setSelectedProject(project);
  };
  const closeModal = () => setSelectedProject(null);

  const countFor = (cat: string) =>
    cat === 'all'
      ? projects.length
      : projects.filter((p) => p.category === cat).length;

  return (
    <section
      ref={sectionRef}
      className={`${styles.portfolioSection} ${inView ? styles.inView : ''} ${isRtl ? styles.rtl : ''}`}
      id="portfolio"
    >
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
          <div className={styles.filters} role="group" aria-label={t('filters_label')}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ''}`}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
              >
                {cat === 'all' ? t('filter_all') : cat}
                <span className={styles.filterCount}>{countFor(cat)}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Projet à la une ── */}
        {featuredProject && (
          <article className={styles.featuredCard}>
            <div className={styles.featuredMedia}>
              {featuredProject.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredProject.image} alt={featuredProject.title} loading="lazy" />
              ) : (
                <div className={styles.cardPlaceholder}>
                  <Icons.Code size={64} stroke="var(--text-muted)" strokeWidth={1.5} />
                </div>
              )}
              <span className={styles.featuredBadge}>{t('featured_badge')}</span>
            </div>

            <div className={styles.featuredBody}>
              <span className={styles.cardCategoryStatic}>{featuredProject.category}</span>
              <h3 className={styles.featuredTitle}>{featuredProject.title}</h3>
              <p className={styles.featuredDesc}>{featuredProject.description}</p>

              {(featuredProject.client || featuredProject.year || featuredProject.results) && (
                <div className={styles.featuredMeta}>
                  {featuredProject.client && (
                    <div className={styles.metaItem}>
                      <Icons.User size={16} stroke="var(--text-muted)" />
                      <span>{t('client_label')} {featuredProject.client}</span>
                    </div>
                  )}
                  {featuredProject.year && (
                    <div className={styles.metaItem}>
                      <Icons.Calendar size={16} stroke="var(--text-muted)" />
                      <span>{featuredProject.year}</span>
                    </div>
                  )}
                  {featuredProject.results && (
                    <div className={styles.metaItem}>
                      <Icons.Chart size={16} stroke="var(--text-muted)" />
                      <span>{featuredProject.results}</span>
                    </div>
                  )}
                </div>
              )}

              {featuredProject.tags && featuredProject.tags.length > 0 && (
                <div className={styles.cardTags}>
                  {featuredProject.tags.map((tag) => (
                    <span key={tag} className={styles.cardTag}>
                      <span className={styles.tagStar} aria-hidden="true">✦</span>
                      <span className={styles.tagLabel}>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className={styles.featuredCta}
                onClick={(e) => openModal(featuredProject, e.currentTarget)}
                aria-label={t('aria_label', { title: featuredProject.title })}
              >
                {t('view_project')}
                <Icons.ChevronRight size={16} stroke="currentColor" />
              </button>
            </div>
          </article>
        )}

        {/* ── Grille ── */}
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              onClick={(e) => openModal(project, e.currentTarget)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(project, e.currentTarget);
                }
              }}
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
                {project.year && (
                  <span className={styles.cardYear}>{project.year}</span>
                )}
                <div className={styles.cardOverlay}>
                  <span className={styles.cardCategory}>{project.category}</span>
                  <span className={styles.cardCta}>
                    {t('view_project')}
                    <Icons.ChevronRight size={16} stroke="currentColor" />
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{project.title}</h3>
                <p className={styles.cardDesc}>{project.description}</p>
                {project.tags && project.tags.length > 0 && (
                  <div className={styles.cardTags}>
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.cardTag}>
                        <span className={styles.tagStar} aria-hidden="true">✦</span>
                        <span className={styles.tagLabel}>{tag}</span>
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className={styles.cardTag}>
                        <span className={styles.tagStar} aria-hidden="true">✦</span>
                        <span className={styles.tagLabel}>
                          +{project.tags.length - 3}
                        </span>
                      </span>
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
            role="presentation"
          >
            <div
              ref={modalRef}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-modal-title"
            >

              <button
                ref={closeButtonRef}
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
                <h3 className={styles.modalTitle} id="portfolio-modal-title">
                  {selectedProject.title}
                </h3>
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
                      <span key={tag} className={styles.modalTag}>
                        <span className={styles.tagStar} aria-hidden="true">✦</span>
                        <span className={styles.tagLabel}>{tag}</span>
                      </span>
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

// components/portfolio/Portfolio.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import ComingSoon from './ComingSoon';
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

  // ── Aucun projet publié : état « Bientôt disponible » ──
  // La section (et son ancre #portfolio) reste en place : elle prépare
  // l'arrivée des projets au lieu de disparaître de la page. Dès que
  // `projects` contient au moins un élément, la grille habituelle prend le relais.
  if (!projects || projects.length === 0) {
    return (
      <section
        ref={sectionRef}
        className={`${styles.portfolioSection} ${inView ? styles.inView : ''} ${isRtl ? styles.rtl : ''}`}
        id="portfolio"
        aria-labelledby="portfolio-title"
      >
        <div className="container">
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Icons.Briefcase size={32} stroke="var(--primary)" strokeWidth={1.8} />
              <h2 className={styles.title} id="portfolio-title">{t('title')}</h2>
            </div>
          </div>
          <ComingSoon locale={locale} active={inView} />
        </div>
      </section>
    );
  }

  const categories = ['all', ...new Set(projects.map((p) => p.category))];

  const filteredProjects =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  // Le projet « à la une » n'est mis en avant que s'il survit au filtre actif.
  const featuredProject = filteredProjects.find((p) => p.featured);

  const openModal = (project: Project, trigger: HTMLElement | null) => {
    // Le déclencheur est parfois un raccourci non focalisable (clic direct sur
    // la carte) : on mémorise un VRAI contrôle, sinon le retour de focal à la
    // fermeture tomberait sur <body>.
    if (trigger && !trigger.matches(FOCUSABLE_SELECTOR)) {
      trigger = trigger.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    }
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

        {/* Contenu de fond : rendu `inert` pendant l'ouverture de la modale.
            Le lecteur d'écran n'entrevoit plus le fond (titre, grilles, filtres)
            et le clavier ne peut pas y revenir par accident, en plus du piège
            de focal et de aria-modal. La modale, elle, reste hors de ce bloc. */}
        <div inert={selectedProject !== null}>

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

        {/* Annonce (polie) du nombre de projets affichés : sans elle, un
            lecteur d'écran ne saurait pas que le filtre a changé la grille. */}
        <p className="sr-only" role="status">
          {t('results_count', { count: filteredProjects.length })}
        </p>

        {/* ── Projet à la une ──
            <article> nommé par son titre (aria-labelledby) : les lecteurs
            d'écran annoncent « article : <titre> » et peuvent naviguer
            directement jusqu'à ce titre. Le contrôle reste le <button> du CTA. */}
        {featuredProject && (
          <article
            className={styles.featuredCard}
            aria-labelledby="portfolio-featured-title"
          >
            <div className={styles.featuredMedia}>
              {featuredProject.image ? (
                // alt="" : illustration redondante avec le titre à côté.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredProject.image} alt="" loading="lazy" />
              ) : (
                <div className={styles.cardPlaceholder} aria-hidden="true">
                  <Icons.Code size={64} stroke="var(--text-muted)" strokeWidth={1.5} />
                </div>
              )}
              <span className={styles.featuredBadge}>{t('featured_badge')}</span>
            </div>

            <div className={styles.featuredBody}>
              <span className={styles.cardCategoryStatic}>{featuredProject.category}</span>
              <h3 className={styles.featuredTitle} id="portfolio-featured-title">
                {featuredProject.title}
              </h3>
              <p className={styles.featuredDesc}>{featuredProject.description}</p>

              {(featuredProject.client || featuredProject.year || featuredProject.results) && (
                <div className={styles.featuredMeta}>
                  {featuredProject.client && (
                    <div className={styles.metaItem}>
                      <Icons.User size={16} stroke="var(--text-muted)" aria-hidden="true" />
                      <span>{t('client_label')} {featuredProject.client}</span>
                    </div>
                  )}
                  {featuredProject.year && (
                    <div className={styles.metaItem}>
                      <Icons.Calendar size={16} stroke="var(--text-muted)" aria-hidden="true" />
                      <span>{t('year_label')} {featuredProject.year}</span>
                    </div>
                  )}
                  {featuredProject.results && (
                    <div className={styles.metaItem}>
                      <Icons.Chart size={16} stroke="var(--text-muted)" aria-hidden="true" />
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
                aria-haspopup="dialog"
              >
                {t('view_project')}
                <Icons.ChevronRight size={16} stroke="currentColor" aria-hidden="true" />
              </button>
            </div>
          </article>
        )}

        {/* ── Grille ──
            Sémantique : une LISTE de projets (<ul>/<li>), annoncée comme
            telle par les lecteurs d'écran (« liste de 3 éléments »).
            La carte n'est plus un div[role=button] : ce rôle écrasait tout le
            contenu (titre, description, tags) en un seul nom accessible et
            cassait la navigation par titre. Le vrai contrôle clavier est le
            <button> du CTA ; le clic direct sur la carte reste possible pour
            la souris (confort d'usage, sans rôle ARIA). */}
        <ul className={styles.grid}>
          {filteredProjects.map((project) => (
            // Raccourci pointeur sur toute la carte : le contrôle accessible
            // est le <button> « Voir le projet » qu'elle contient, rendu
            // visible par :focus-within (l'overlay est à opacity:0 au repos,
            // ce qui fait du clic sur la carte le seul chemin tactile).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <li
              key={project.id}
              className={styles.projectCard}
              onClick={(e) => openModal(project, e.currentTarget)}
            >
              <div className={styles.cardImage}>
                {project.image ? (
                  // alt="" : l'image est une illustration du projet dont le
                  // titre est juste à côté — la nommer dupliquerait l'info.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image} alt="" loading="lazy" />
                ) : (
                  <div className={styles.cardPlaceholder} aria-hidden="true">
                    <Icons.Code size={48} stroke="var(--text-muted)" strokeWidth={1.5} />
                  </div>
                )}
                {project.year && (
                  <span className={styles.cardYear}>
                    <span className="sr-only">{t('year_label')} </span>
                    {project.year}
                  </span>
                )}
                <div className={styles.cardOverlay}>
                  <span className={styles.cardCategory}>{project.category}</span>
                  <button
                    type="button"
                    className={styles.cardCta}
                    onClick={(e) => {
                      // La carte <li> est déjà cliquable : on n'ouvre qu'une fois.
                      e.stopPropagation();
                      openModal(project, e.currentTarget);
                    }}
                    aria-label={t('aria_label', { title: project.title })}
                    aria-haspopup="dialog"
                  >
                    {t('view_project')}
                    <Icons.ChevronRight size={16} stroke="currentColor" aria-hidden="true" />
                  </button>
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
                          {/* « +2 » seul est ambigu à l'oral : on donne le sens */}
                          <span aria-hidden="true">+{project.tags.length - 3}</span>
                          <span className="sr-only">
                            {t('more_tags', { count: project.tags.length - 3 })}
                          </span>
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        </div>{/* fin du contenu de fond (inert pendant la modale) */}

        {/* ── Modal de détail ──
            Structure : bouton de fermeture fixe (hors zone défilante) · zone
            défilante (visuel, introduction, informations clés, résultats,
            technologies) · pied de page fixe avec les actions. */}
        {/* Rendue dans un PORTAIL (document.body) : la section Portfolio porte un
            `transform` (animation de révélation au scroll), et un ancêtre avec
            transform devient le repère de ses descendants `position: fixed`.
            L'overlay se centrait alors sur la SECTION (donc « en bas, au
            milieu de la page ») au lieu de l'écran. Hors de la section, il se
            centre toujours sur la fenêtre, quel que soit le défilement.
            La classe `rtl` est reportée sur l'overlay : les règles `.rtl …`
            de la modale ne dépendent plus de la section. */}
        {selectedProject &&
          createPortal(
          <div
            className={`${styles.modalOverlay} ${isRtl ? styles.rtl : ''}`}
            // Fermeture sur le fond seulement : `currentTarget` évite de
            // devoir stopper la propagation depuis la boîte de dialogue,
            // laquelle n'est pas un élément interactif.
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            role="presentation"
          >
            <div
              ref={modalRef}
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-modal-title"
              aria-describedby={
                selectedProject.description ? 'portfolio-modal-desc' : undefined
              }
            >
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                aria-label={t('close_modal')}
              >
                <Icons.X size={20} stroke="currentColor" aria-hidden="true" />
              </button>

              <div className={styles.modalScroll}
                tabIndex={0}>
                {/* Visuel : dégradé en bas pour la lisibilité de la pastille */}
                <div className={styles.modalImage}>
                  {selectedProject.image ? (
                    // alt="" : le titre du projet est juste en dessous — nommer
                    // l'image annoncerait deux fois le même texte.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedProject.image} alt="" />
                  ) : (
                    <div className={styles.modalPlaceholder} aria-hidden="true">
                      <Icons.Code size={64} stroke="var(--text-muted)" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className={styles.modalImageShade} aria-hidden="true" />
                  <div className={styles.modalBadges}>
                    <span className={styles.modalCategory}>{selectedProject.category}</span>
                  </div>
                </div>

                <div className={styles.modalBody}>
                  {/* Introduction */}
                  <div className={styles.modalIntro}>
                    <h3 className={styles.modalTitle} id="portfolio-modal-title">
                      {selectedProject.title}
                    </h3>
                    <p className={styles.modalDesc} id="portfolio-modal-desc">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Informations clés */}
                  {(selectedProject.client || selectedProject.year) && (
                    <dl className={styles.modalFacts}>
                      {selectedProject.client && (
                        <div className={styles.modalFact}>
                          <dt>{t('details_client')}</dt>
                          <dd>{selectedProject.client}</dd>
                        </div>
                      )}
                      {selectedProject.year && (
                        <div className={styles.modalFact}>
                          <dt>{t('details_year')}</dt>
                          <dd>{selectedProject.year}</dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {/* Résultats : la chaîne « A · B » devient une liste lisible */}
                  {selectedProject.results && (
                    <section aria-labelledby="portfolio-modal-results">
                      <h4 className={styles.modalSectionTitle} id="portfolio-modal-results">
                        {t('results_title')}
                      </h4>
                      <ul className={styles.modalResults}>
                        {selectedProject.results
                          .split(/\s*[·•|]\s*/)
                          .filter(Boolean)
                          .map((result) => (
                            <li key={result}>
                              <div className={styles.resultIcon} aria-hidden="true">
                                <Icons.Check size={14} stroke="currentColor" strokeWidth={2.5} />
                              </div>
                              {result}
                            </li>
                          ))}
                      </ul>
                    </section>
                  )}

                  {/* Technologies */}
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <section aria-labelledby="portfolio-modal-stack">
                      <h4 className={styles.modalSectionTitle} id="portfolio-modal-stack">
                        {t('technologies_title')}
                      </h4>
                      <div className={styles.modalTags}>
                        {selectedProject.tags.map((tag) => (
                          <span key={tag} className={styles.modalTag}>
                            <span className={styles.tagStar} aria-hidden="true">✦</span>
                            <span className={styles.tagLabel}>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Pied de page fixe : les actions restent visibles pendant le défilement */}
              <div className={styles.modalFooter}>
                <button type="button" className={styles.modalCloseText} onClick={closeModal}>
                  {t('close_modal')}
                </button>
                {selectedProject.url && (
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.modalLink}
                  >
                    {t('view_project')}
                    <Icons.ChevronRight size={16} stroke="currentColor" aria-hidden="true" />
                    {/* target=_blank n'est pas annoncé : on précise la nouvelle fenêtre */}
                    <span className="sr-only">{t('new_tab')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      </div>
    </section>
  );
}

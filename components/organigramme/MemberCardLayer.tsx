// components/organigramme/MemberCardLayer.tsx
//
// Enveloppe client des fiches membres de l'organigramme.
//
// L'arbre (composants serveur) reste rendu côté serveur : chaque carte porte
// seulement un <button data-member="<id>"> transparent (voir Organigramme.tsx).
// Ce composant écoute les événements par délégation sur l'arbre et affiche la
// fiche correspondante dans un portail (<body>), donc sans être rognée par le
// défilement de l'organigramme ni par les transform des sections.
//
// Comportement
//   • Souris (fenêtre ≥ 640px, hauteur ≥ 520px) : le SURVOL ouvre un aperçu
//     ancré à la carte (délai d'intention de 90 ms, fermeture différée de 170 ms
//     pour pouvoir passer de la carte à la fiche) ; le CLIC l'ÉPINGLE (bouton
//     fermer, clic extérieur, Échap).
//   • Clavier : le focus ouvre l'aperçu ; Entrée / Espace l'épingle et place le
//     focus dans la fiche (Tab y reste piégé) ; Échap la ferme et rend le focus.
//   • Tactile ou petit écran : un tap ouvre une bottom-sheet modale, que l'on
//     ferme en glissant la poignée vers le bas, en touchant le fond ou avec Échap.
//   • Mouvement réduit : plus d'inclinaison ni d'animations (CSS).
//
// Positionnement du popover : en dessous de la carte si la place suffit, sinon
// au-dessus ; centré sur la carte puis borné à l'écran (la flèche garde le cap
// sur la carte). Recalculé au redimensionnement ; au défilement, l'aperçu se
// ferme et la fiche épinglée suit sa carte.

'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import EagleLogoInverted from '@/components/icons/EagleLogoInverted';
import type { MemberContact, MemberInfo, MemberLabels } from './memberCard.types';
import styles from './MemberCard.module.css';

type Props = {
  members: Record<string, MemberInfo>;
  labels: MemberLabels;
  /** L'arbre de l'organigramme (composants serveur). */
  children: ReactNode;
};

type Mode = 'pop' | 'sheet';
type OpenState = { id: string; pinned: boolean; mode: Mode };
type Position = { left: number; top: number; placement: 'top' | 'bottom'; arrowX: number };

const OPEN_DELAY = 90; // ms : délai d'intention avant d'afficher l'aperçu
const CLOSE_DELAY = 170; // ms : temps laissé pour passer de la carte à la fiche
const GAP = 14; // px : écart entre la carte et la fiche (flèche comprise)
const MARGIN = 12; // px : marge minimale avec les bords de l'écran
const ARROW_INSET = 30; // px : la flèche ne s'approche pas des coins arrondis
const DISMISS_DRAG = 90; // px : glissement qui ferme la bottom-sheet
const MAX_STARS = 5;
const BRAND = 'IRIS Junior Entreprise';

/** Bottom-sheet si l'appareil ne survole pas (tactile) ou si l'écran est petit. */
function preferSheet(): boolean {
  return (
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
    window.innerWidth < 640 ||
    window.innerHeight < 520
  );
}

function findTrigger(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>('[data-member]') : null;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z';
const LINKEDIN_PATH =
  'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z';
const GITHUB_PATH =
  'M12 2.2c-5.52 0-10 4.48-10 10 0 4.42 2.87 8.17 6.84 9.5.5.1.68-.22.68-.48 0-.24-.01-.86-.01-1.69-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.96 0-1.1.39-1.99 1.03-2.7-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.4 9.4 0 0 1 5 0c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.65.64.71 1.03 1.6 1.03 2.7 0 3.86-2.34 4.71-4.57 4.96.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .26.18.58.69.48A10.01 10.01 0 0 0 22 12.2c0-5.52-4.48-10-10-10z';

function ContactIcon({ kind }: { kind: MemberContact['kind'] }) {
  if (kind === 'linkedin' || kind === 'github') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d={kind === 'linkedin' ? LINKEDIN_PATH : GITHUB_PATH} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'email' ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 8.5 8 5.5 8-5.5" />
        </>
      ) : (
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
      )}
    </svg>
  );
}

function Silhouette() {
  return (
    <svg className={styles.silhouette} viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <rect width="96" height="96" fill="#e2e8f0" />
      <circle cx="48" cy="38" r="17" fill="#cbd5e1" />
      <path d="M14 96c0-19 15-32 34-32s34 13 34 32z" fill="#cbd5e1" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Contenu de la fiche                                                 */
/* ------------------------------------------------------------------ */

function CardBody({
  member,
  labels,
  pinned,
  mode,
  onClose,
  grabHandlers,
}: {
  member: MemberInfo;
  labels: MemberLabels;
  pinned: boolean;
  mode: Mode;
  onClose: () => void;
  grabHandlers: {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLDivElement>) => void;
  };
}) {
  const hasFacts = Boolean(member.reportsTo || member.team);
  let block = 0; // ordre d'apparition des blocs de la moitié basse

  return (
    <>
      <div className={styles.top}>
        <div className={styles.banner}>
          <EagleLogoInverted className={styles.eagle} fill="#ffffff" aria-hidden="true" />
          <span className={styles.tier}>{member.tierLabel}</span>
          {mode === 'sheet' && <div className={styles.grab} {...grabHandlers} aria-hidden="true" />}
          <button type="button" className={styles.close} onClick={onClose} aria-label={labels.close}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className={styles.avatarRing}>
          <div className={styles.avatar}>
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.hasName ? member.name : member.role}
                fill
                sizes="112px"
                className={styles.photo}
              />
            ) : (
              <Silhouette />
            )}
          </div>
        </div>

        <div className={styles.identity}>
          <h3 className={`${styles.name} ${member.hasName ? '' : styles.nameEmpty}`}>
            {member.name}
          </h3>
          <p className={styles.role}>{member.role}</p>
          {member.since && <p className={styles.since}>{member.since}</p>}
        </div>
      </div>

      <div className={styles.perf} aria-hidden="true" />

      <div className={styles.bottom}>
        {member.text && (
          <div className={styles.block} style={{ '--i': block++ } as CSSProperties}>
            <p className={styles.label}>{member.textLabel}</p>
            <p className={styles.text}>{member.text}</p>
          </div>
        )}

        {hasFacts && (
          <div className={`${styles.facts} ${styles.block}`} style={{ '--i': block++ } as CSSProperties}>
            {member.reportsTo && (
              <div className={styles.fact}>
                <span className={styles.factLabel}>{labels.reportsTo}</span>
                <span className={styles.factValue}>{member.reportsTo}</span>
              </div>
            )}
            {member.team && (
              <div className={styles.fact}>
                <span className={styles.factLabel}>{labels.team}</span>
                <span className={styles.factValue}>{member.team}</span>
              </div>
            )}
          </div>
        )}

        {member.tags.length > 0 && (
          <ul className={`${styles.tags} ${styles.block}`} style={{ '--i': block++ } as CSSProperties}>
            {member.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}

        {member.stars !== undefined && (
          <div className={styles.block} style={{ '--i': block++ } as CSSProperties}>
            <span className={styles.stars} role="img" aria-label={member.starsLabel}>
              {Array.from({ length: MAX_STARS }, (_, i) => (
                <svg
                  key={i}
                  className={i < (member.stars ?? 0) ? styles.starOn : styles.starOff}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d={STAR_PATH} />
                </svg>
              ))}
            </span>
          </div>
        )}

        {member.contacts.length > 0 && (
          <div className={`${styles.contacts} ${styles.block}`} style={{ '--i': block++ } as CSSProperties}>
            {member.contacts.map((contact) => (
              <a
                key={contact.kind}
                className={styles.contact}
                href={contact.href}
                aria-label={contact.label}
                title={contact.label}
                {...(contact.kind === 'linkedin' || contact.kind === 'github'
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <ContactIcon kind={contact.kind} />
              </a>
            ))}
          </div>
        )}

        <div className={styles.foot} aria-hidden={pinned ? 'true' : undefined}>
          <span className={styles.footText}>{pinned || mode === 'sheet' ? BRAND : labels.pinHint}</span>
          <span className={styles.barcode} aria-hidden="true" />
        </div>
      </div>

      <span className={styles.glare} aria-hidden="true" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export default function MemberCardLayer({ members, labels, children }: Props) {
  const [open, setOpen] = useState<OpenState | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  const openRef = useRef<OpenState | null>(null); // miroir synchrone pour les gestionnaires
  const triggerRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const tiltFrame = useRef(0);
  const drag = useRef<{ startY: number; dy: number } | null>(null);
  const skipFocusOpen = useRef(false); // vrai pendant un focus() rendu par programme

  const commit = useCallback((next: OpenState | null) => {
    const prev = openRef.current;
    if (prev === next) return;
    if (prev && next && prev.id === next.id && prev.pinned === next.pinned && prev.mode === next.mode) {
      return;
    }
    openRef.current = next;
    setOpen(next);
  }, []);

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  const close = useCallback(
    (restoreFocus = false) => {
      clearTimers();
      const trigger = triggerRef.current;
      trigger?.setAttribute('aria-expanded', 'false');
      commit(null);
      setPos(null);
      if (restoreFocus && trigger) {
        // Sans ce drapeau, rendre le focus au clavier rouvrirait aussitôt l'aperçu
        skipFocusOpen.current = true;
        trigger.focus({ preventScroll: true });
        skipFocusOpen.current = false;
      }
    },
    [clearTimers, commit],
  );

  const scheduleClose = useCallback(
    (delay = CLOSE_DELAY) => {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => {
        const current = openRef.current;
        if (current && !current.pinned) close();
      }, delay);
    },
    [close],
  );

  const show = useCallback(
    (trigger: HTMLElement, pinned: boolean) => {
      const id = trigger.dataset.member;
      if (!id || !members[id]) return;
      clearTimers();
      const mode: Mode = preferSheet() ? 'sheet' : 'pop';
      const previous = triggerRef.current;
      if (previous && previous !== trigger) previous.setAttribute('aria-expanded', 'false');
      triggerRef.current = trigger;
      trigger.setAttribute('aria-expanded', 'true');
      commit({ id, pinned: pinned || mode === 'sheet', mode });
    },
    [clearTimers, commit, members],
  );

  /* ---------------- Délégation d'événements sur l'arbre ---------------- */

  const onPointerOver = (e: PointerEvent<HTMLDivElement>) => {
    const trigger = findTrigger(e.target);
    if (!trigger || (e.pointerType !== 'mouse' && e.pointerType !== 'pen')) return;
    if (preferSheet()) return; // petit écran : ouverture au clic uniquement
    const id = trigger.dataset.member;
    const current = openRef.current;
    window.clearTimeout(closeTimer.current);
    if (current?.id === id) return;
    if (current?.pinned) return; // une fiche épinglée n'est pas remplacée au survol
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => show(trigger, false), OPEN_DELAY);
  };

  const onPointerOut = (e: PointerEvent<HTMLDivElement>) => {
    const trigger = findTrigger(e.target);
    if (!trigger) return;
    if (e.relatedTarget instanceof Node && trigger.contains(e.relatedTarget)) return;
    window.clearTimeout(openTimer.current);
    if (openRef.current && !openRef.current.pinned) scheduleClose();
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const trigger = findTrigger(e.target);
    if (!trigger) return;
    const current = openRef.current;
    if (current?.pinned && current.id === trigger.dataset.member) close();
    else show(trigger, true);
  };

  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    const trigger = findTrigger(e.target);
    // Aperçu au focus CLAVIER seulement (pas au clic) ; jamais de sheet qui s'ouvre en tabulant
    if (!trigger || skipFocusOpen.current) return;
    if (!trigger.matches(':focus-visible') || preferSheet()) return;
    const current = openRef.current;
    if (current?.pinned || current?.id === trigger.dataset.member) return;
    show(trigger, false);
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    const trigger = findTrigger(e.target);
    if (!trigger) return;
    if (e.relatedTarget instanceof Node && cardRef.current?.contains(e.relatedTarget)) return;
    if (openRef.current && !openRef.current.pinned) scheduleClose(120);
  };

  /* ---------------- Positionnement du popover ---------------- */

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const card = cardRef.current;
    const current = openRef.current;
    if (!trigger || !card || !current || current.mode !== 'pop') return;

    const r = trigger.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    const below = vh - r.bottom - MARGIN;
    const above = r.top - MARGIN;
    const placement: Position['placement'] =
      below >= h + GAP || below >= above ? 'bottom' : 'top';

    const left = clamp(r.left + r.width / 2 - w / 2, MARGIN, vw - w - MARGIN);
    const rawTop = placement === 'bottom' ? r.bottom + GAP : r.top - GAP - h;
    const top = clamp(rawTop, MARGIN, vh - h - MARGIN);
    const arrowX = clamp(r.left + r.width / 2 - left, ARROW_INSET, w - ARROW_INSET);

    setPos((prev) =>
      prev &&
      prev.left === left &&
      prev.top === top &&
      prev.placement === placement &&
      prev.arrowX === arrowX
        ? prev
        : { left, top, placement, arrowX },
    );
  }, []);

  // Mesure avant l'affichage (la fiche est masquée tant que `pos` est vide)
  useLayoutEffect(() => {
    if (open?.mode === 'pop') place();
  }, [open, place]);

  /* ---------------- Écouteurs globaux tant qu'une fiche est ouverte ---------------- */

  const isOpen = open !== null;
  const mode = open?.mode;
  const pinned = open?.pinned ?? false;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close(openRef.current?.pinned ?? false);
        return;
      }
      if (e.key !== 'Tab' || !openRef.current?.pinned) return;

      // Fiche épinglée : Tab reste dans la fiche
      const card = cardRef.current;
      if (!card) return;
      const focusable = Array.from(
        card.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.getClientRects().length > 0);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && card.contains(active);
      if (!inside) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === card)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (e: globalThis.PointerEvent) => {
      if (!openRef.current?.pinned) return;
      const target = e.target as Node | null;
      if (target && cardRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('[data-member]')) return;
      close();
    };

    const onScroll = () => {
      if (openRef.current?.mode !== 'pop') return;
      if (openRef.current.pinned) place();
      else close();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', place);
    };
  }, [isOpen, close, place]);

  // Bottom-sheet : le fond ne défile plus
  useEffect(() => {
    if (mode !== 'sheet') return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [mode]);

  // Fiche épinglée : le focus entre dans la fiche
  useEffect(() => {
    if (pinned) cardRef.current?.focus({ preventScroll: true });
  }, [pinned, open?.id]);

  // Nettoyage au démontage
  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
      window.cancelAnimationFrame(tiltFrame.current);
      triggerRef.current?.setAttribute('aria-expanded', 'false');
    },
    [],
  );

  /* ---------------- Interactions sur la fiche ---------------- */

  // Inclinaison 3D + reflet qui suit le pointeur (popover à la souris uniquement)
  const onTilt = (e: PointerEvent<HTMLDivElement>) => {
    if (mode !== 'pop' || e.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    const y = clamp((e.clientY - r.top) / r.height, 0, 1);
    window.cancelAnimationFrame(tiltFrame.current);
    tiltFrame.current = window.requestAnimationFrame(() => {
      const el = tiltRef.current;
      if (!el) return;
      el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      el.dataset.tilt = 'on';
    });
  };

  const resetTilt = () => {
    window.cancelAnimationFrame(tiltFrame.current);
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    delete el.dataset.tilt;
  };

  const onCardPointerEnter = () => window.clearTimeout(closeTimer.current);

  const onCardPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    resetTilt();
    if (e.pointerType === 'mouse' && openRef.current && !openRef.current.pinned) scheduleClose();
  };

  // Bottom-sheet : glisser la poignée vers le bas pour fermer
  const grabHandlers = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      drag.current = { startY: e.clientY, dy: 0 };
      e.currentTarget.setPointerCapture(e.pointerId);
      if (tiltRef.current) tiltRef.current.style.transition = 'none';
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      if (!state || !tiltRef.current) return;
      state.dy = Math.max(0, e.clientY - state.startY);
      tiltRef.current.style.transform = `translateY(${state.dy}px)`;
    },
    onPointerUp: () => {
      const state = drag.current;
      drag.current = null;
      const el = tiltRef.current;
      if (el) {
        el.style.transition = '';
        el.style.transform = '';
      }
      if (state && state.dy > DISMISS_DRAG) close(true);
    },
    onPointerCancel: () => {
      drag.current = null;
      const el = tiltRef.current;
      if (el) {
        el.style.transition = '';
        el.style.transform = '';
      }
    },
  };

  /* ---------------- Rendu ---------------- */

  const member = open ? members[open.id] : undefined;

  const card =
    open && member ? (
      <div
        key={open.id}
        ref={cardRef}
        className={styles.mc}
        role="dialog"
        aria-modal={open.mode === 'sheet' ? 'true' : undefined}
        aria-label={member.dialogLabel}
        tabIndex={-1}
        data-tier={member.tier}
        data-level={member.level}
        data-pinned={open.pinned ? 'true' : 'false'}
        onPointerEnter={onCardPointerEnter}
        onPointerLeave={onCardPointerLeave}
        onPointerMove={onTilt}
        style={
          open.mode === 'pop' && pos ? ({ '--arrow-x': `${pos.arrowX}px` } as CSSProperties) : undefined
        }
      >
        <div ref={tiltRef} className={styles.tilt}>
          <CardBody
            member={member}
            labels={labels}
            pinned={open.pinned}
            mode={open.mode}
            onClose={() => close(true)}
            grabHandlers={grabHandlers}
          />
        </div>
        {open.mode === 'pop' && <span className={styles.arrow} aria-hidden="true" />}
      </div>
    ) : null;

  return (
    <div
      role="presentation"
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}

      {open &&
        card &&
        createPortal(
          open.mode === 'sheet' ? (
            <div className={`${styles.root} ${styles.sheet}`}>
              <div
                className={styles.backdrop}
                role="presentation"
                onClick={() => close(true)}
              />
              {card}
            </div>
          ) : (
            <div
              className={`${styles.root} ${styles.pop}`}
              data-placement={pos?.placement ?? 'bottom'}
              style={{
                left: pos?.left ?? 0,
                top: pos?.top ?? 0,
                visibility: pos ? 'visible' : 'hidden',
              }}
            >
              {card}
            </div>
          ),
          document.body,
        )}
    </div>
  );
}
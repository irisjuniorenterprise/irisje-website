// components/ClientSideEffects.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientSideEffects() {
  const pathname = usePathname();

  useEffect(() => {
    // Fonction qui exécute les effets
    const runEffects = () => {
      // --- Scrollspy ---
      const navLinks = document.querySelectorAll<HTMLAnchorElement>(
        '.nav-link, .mobile-link'
      );
      const sections = document.querySelectorAll<HTMLElement>('main section[id]');

      // Nettoyer les anciens observateurs en les stockant globalement
      if ((window as any).__spyObserver) {
        (window as any).__spyObserver.disconnect();
      }
      if ((window as any).__revealObserver) {
        (window as any).__revealObserver.disconnect();
      }

      if ('IntersectionObserver' in window) {
        // --- Scrollspy ---
        const spy = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach((link) => {
                  link.classList.toggle('active', link.dataset.target === id);
                });
              }
            });
          },
          { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        );
        sections.forEach((s) => spy.observe(s));
        (window as any).__spyObserver = spy;

        // --- Reveal placeholder + footer ---
        const reveal = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );

        const elements = document.querySelectorAll('.placeholder, .site-footer');
        // Réinitialiser les classes in-view avant de réobserver
        elements.forEach((el) => {
          el.classList.remove('in-view');
          reveal.observe(el);
        });

        (window as any).__revealObserver = reveal;

        // Si aucun élément n'est trouvé, on force l'affichage
        if (elements.length === 0) {
          document.querySelectorAll('.placeholder, .site-footer').forEach((el) => {
            el.classList.add('in-view');
          });
        }
      } else {
        // Fallback
        document.querySelectorAll('.placeholder, .site-footer').forEach((el) => {
          el.classList.add('in-view');
        });
      }
    };

    // Exécuter après un court délai pour laisser le DOM se stabiliser
    const timer = setTimeout(() => {
      runEffects();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Nettoyer les observateurs
      if ((window as any).__spyObserver) {
        (window as any).__spyObserver.disconnect();
        delete (window as any).__spyObserver;
      }
      if ((window as any).__revealObserver) {
        (window as any).__revealObserver.disconnect();
        delete (window as any).__revealObserver;
      }
    };
  }, [pathname]); // Déclenché à chaque changement de route

  return null;
}
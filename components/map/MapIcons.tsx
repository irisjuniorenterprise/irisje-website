// components/map/MapIcons.tsx
// Petites icônes propres à la carte / à l'itinéraire (même style que Icons.tsx :
// trait 2px, currentColor).

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export function CarIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M5 17H3v-5l2-5.5A2 2 0 0 1 6.9 5h10.2a2 2 0 0 1 1.9 1.5L21 12v5h-2" />
      <path d="M3 12h18" />
      <path d="M9 17h6" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

/** Flèche « ouvre dans un nouvel onglet » (miroir automatique en RTL via CSS). */
export function ExternalIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IRIS Junior Entreprise — Propulsez votre potentiel',
  description: 'IRIS Junior Entreprise : propulsez votre potentiel.',
};

export const viewport: Viewport = {
  themeColor: '#1a3969',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Pas de <html> ni <body> ici —
  // app/[locale]/layout.tsx s'en charge avec lang, dir et les providers
  return children as React.ReactElement;
}
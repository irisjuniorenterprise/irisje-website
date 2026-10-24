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
  title: 'IRIS Junior Entreprise — Services web, marketing et études à Sfax',
  description: 'IRIS Junior Entreprise, junior-entreprise de l\'ENIS à Sfax : web, mobile, branding, marketing et études de marché.',
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
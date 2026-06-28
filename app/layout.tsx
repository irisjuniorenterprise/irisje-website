// app/layout.tsx
import { Metadata } from 'next';
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
// ✅ Ajouter cette exportation
export const viewport = {
  themeColor: '#1a3969', // Bleu IRIS JE
  width: 'device-width',
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <>{children}</>
    
  );
}
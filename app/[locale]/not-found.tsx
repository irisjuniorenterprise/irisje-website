import NotFoundContent from '@/components/NotFoundContent';
import type { Metadata } from 'next';




export const metadata: Metadata = {
  title: 'Page non trouvée | IRIS Junior Entreprise',
  description: "La page que vous recherchez n'existe pas.",
  openGraph: {
    title: 'Page non trouvée | IRIS Junior Entreprise',
    description: "La page que vous recherchez n'existe pas.",
    images: ['/logo-iris.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page non trouvée | IRIS Junior Entreprise',
    description: "La page que vous recherchez n'existe pas.",
    images: ['/logo-iris.png'],
  },
}; 

export default function NotFound() {
  return <NotFoundContent />;
}
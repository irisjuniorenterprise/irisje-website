// app/[locale]/loading.tsx
import LoadingScreen from '@/components/layout/LoadingScreen';

// Frontière de chargement du segment [locale] : affichée pendant les
// navigations entre pages (le fallback est prefetché → perçu instantané).
// L'écran lui-même est un composant SYNCHRONE partagé — aucun await ne
// doit retarder son affichage.
export default LoadingScreen;

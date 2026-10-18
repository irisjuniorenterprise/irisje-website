// app/[locale]/recrutement/page.tsx
//
// La page de recrutement n'est plus servie : les candidatures vivent
// désormais sur IRIS JOIN, la plateforme dédiée (sous-domaine « join. »).
//
// Le fichier est CONSERVÉ à dessein — il ne fait que rediriger — pour
// préserver le référencement déjà acquis sur /recrutement : un visiteur
// arrivant d'un ancien lien, d'un favori ou des résultats de recherche
// atterrit sur la plateforme JOIN plutôt que sur une page morte.
//
// permanentRedirect sert un 308 (redirection permanente), que Google
// traite comme un signal de mise à jour d'URL. Voir aussi : la retirer du
// sitemap (lib/seo.ts) pour ne pas annoncer une URL qui ne rend pas.
import { permanentRedirect } from 'next/navigation';
import { getRequestSite } from '@/lib/request-site';
import { joinUrlFromHostname } from '@/lib/join';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RecrutementPage({ params }: Props) {
  // params doit être résolu même si on n'en lit pas la valeur : c'est lui
  // qui déclenche le rendu de la route dynamique [locale].
  await params;

  // Origine réellement visitée (.com ou .tn) : la redirection cible le
  // sous-domaine join. DU MÊME domaine, jamais l'autre. Hôte inconnu
  // (localhost, preview *.vercel.app) → repli sur le domaine principal.
  const { origin } = await getRequestSite();

  permanentRedirect(joinUrlFromHostname(new URL(origin).hostname));
}

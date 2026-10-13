// components/seo/JsonLd.tsx
//
// Injecte un bloc de données structurées JSON-LD (schema.org).
// Les caractères « < » et les séparateurs de ligne Unicode sont échappés :
// impossible de fermer la balise <script> depuis une valeur du JSON.
type JsonLdProps = {
  data: Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
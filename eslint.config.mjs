import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

// Ajustements ciblés du preset `jsx-a11y/recommended`, justifiés par le code :
//  - no-noninteractive-tabindex : une région défilable (role="region") DOIT
//    être focalisable au clavier (HTML spec / technique WCAG C27). C'est le
//    seul cas non interactif où tabindex="0" est requis.
//  - no-redundant-roles : `role="list"` est rétabli volontairement sur les
//    <ul> dont CSS retire `list-style` (VoiceOver abandonne sinon la sémantique
//    de liste). Cf. components/organigramme/Organigramme.module.css.
const a11yRuleTweaks = {
  "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["region"] }],
  "jsx-a11y/no-redundant-roles": ["error", { ul: ["list"] }],
};

// eslint-config-next enregistre déjà le plugin `jsx-a11y` (6 règles seulement,
// en warning). On enrichit CE même objet de configuration avec l'ensemble des
// règles recommandées : redéclarer le plugin ailleurs ferait échouer ESLint
// (« Cannot redefine plugin »).
const withA11yRules = nextVitals.map((config) =>
  config.plugins?.["jsx-a11y"]
    ? {
        ...config,
        rules: { ...config.rules, ...jsxA11y.configs.recommended.rules, ...a11yRuleTweaks },
      }
    : config,
);

const eslintConfig = defineConfig([
  ...withA11yRules,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

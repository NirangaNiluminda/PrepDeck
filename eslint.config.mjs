import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Cross-module imports go through index.ts only. Without this rule the layering
// in ARCHITECTURE.md is a convention; with it, it is a build failure.
const moduleBoundaries = {
  files: ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/modules/*/*"],
            message:
              "Import a module through its public API ('@/modules/questions'), never its internals.",
          },
          {
            group: [
              "../../*/domain/*",
              "../../*/adapters/*",
              "../../*/ports/*",
              "../../*/use-cases/*",
            ],
            message:
              "Reaching into a sibling module by relative path bypasses its index.ts. Import '@/modules/<name>' instead.",
          },
        ],
      },
    ],
  },
};

// The composition root is the one place allowed to wire concrete adapters, and
// each module's own index.ts must of course reach its internals.
const boundaryExemptions = {
  files: ["src/composition/**/*.ts", "src/modules/*/index.ts"],
  rules: {
    "no-restricted-imports": "off",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  moduleBoundaries,
  boundaryExemptions,
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

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  {
    ignores: [
      ".next/**", "node_modules/**", "public/**", "scratch/**", "raw_css/**",
      "raw_pages/**", "tools/**", "scripts/**", "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Existing code has many of these; keep them visible as warnings so the
    // build can still fail on real problems (hooks rules, Next.js rules).
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

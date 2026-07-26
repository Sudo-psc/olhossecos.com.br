import tsParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
  {
    ignores: [".astro/**", "dist/**", "docs/**", "node_modules/**"],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
  },
];

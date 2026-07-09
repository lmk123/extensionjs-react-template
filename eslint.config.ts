import globals from "globals";
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

// @eslint/json's rules are typed against its own JSONSourceCode, which is not
// structurally assignable to ESLint's core Plugin type. Casting keeps the
// documented `plugins: { json }` usage while satisfying the type checker.
const jsonPlugin = json as unknown as ESLint.Plugin;

export default defineConfig([
  { ignores: ["dist/**"] },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    extends: [
      tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
    ],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: "detect" } },
  },
  { files: ["**/*.json"], plugins: { json: jsonPlugin }, language: "json/json" },
  { files: ["**/*.jsonc"], plugins: { json: jsonPlugin }, language: "json/jsonc" },
  { files: ["**/*.json5"], plugins: { json: jsonPlugin }, language: "json/json5" },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm" },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    languageOptions: { tolerant: true },
  },
]);

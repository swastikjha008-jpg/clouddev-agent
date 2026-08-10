// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // apps/web has its own Next-flavored flat config (apps/web/eslint.config.mjs)
  // — this config is for the plain-Node packages (shared, backend,
  // sandbox-agent) and must never touch apps/web's files or its generated
  // .next/ output, or type-aware linting fails on files outside any tsconfig.
  { ignores: ["**/dist/**", "**/node_modules/**", "**/*.js", "apps/web/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Fire-and-forget is a deliberate pattern for the agent loop (kicked
      // off from an HTTP handler that shouldn't block on it) — require an
      // explicit `void` or `.catch()` instead of banning it outright.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["error"] }],
    },
  },
);

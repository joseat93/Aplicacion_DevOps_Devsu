// eslint.config.cjs
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  // Reglas generales para todos los .js
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "dev.sqlite", "coverage/**", "dist/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      // Reglas recomendadas de ESLint
      ...js.configs.recommended.rules
    }
  },
  // Config especial para tests con Jest
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        afterAll: "readonly",
        jest: "readonly"
      }
    }
  }
];


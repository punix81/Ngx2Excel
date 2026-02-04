module.exports = [
  // Minimal TypeScript configuration for all .ts files so they match a config
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    rules: {
      // Minimal sensible defaults can be added here if desired
    }
  },

  // HTML files configuration using @html-eslint
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: require("@html-eslint/parser")
    },
    plugins: {
      "@html-eslint": require("@html-eslint/eslint-plugin")
    },
    rules: {
      "@html-eslint/require-doctype": "error",
      "@html-eslint/no-trailing-spaces": "error"
    }
  }
];

module.exports = [
  // Global ignore
  { ignores: ["projects/**/*"] },

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

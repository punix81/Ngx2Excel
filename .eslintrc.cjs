module.exports = {
  // Ignore other projects but allow the ngx2excel project explicitly
  ignorePatterns: ["projects/**/*", "!projects/ngx2excel/**"],
  overrides: [
    {
      // Apply to all TypeScript files in the repo
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tsconfig.json"],
        createDefaultProgram: true
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "prettier"
      ],
      rules: {}
    },
    {
      files: ["*.html"],
      extends: ["plugin:@angular-eslint/template/recommended"],
      rules: {}
    },
    {
      files: ["**/*.html"],
      parser: "@html-eslint/parser",
      plugins: ["@html-eslint"],
      rules: {
        "@html-eslint/attr-spacing": "error",
        "@html-eslint/require-doctype": "error"
      }
    }
  ]
};

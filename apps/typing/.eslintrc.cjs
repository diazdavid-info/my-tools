module.exports = {
  extends: [
    "plugin:astro/recommended",
  ],
  overrides: [
    {
      files: ["*.astro"],
      processor: "astro/client-side-ts",
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        project: "./tsconfig.json"
      },
      rules: {},
    },
  ],
};

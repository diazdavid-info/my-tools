/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
        trailingComma: 'none',
        singleQuote: true,
        printWidth: 120,
        semi: false,
        tabWidth: 2
      },
    },
  ],
};

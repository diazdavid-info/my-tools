import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  prettierConfig,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,jsx,tsx}"],
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": [
        "error",
        {
          singleQuote: true,
          printWidth: 120,
          semi: false,
          trailingComma: "all",
        },
      ],
    },
  },
];

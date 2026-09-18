import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";

export default [...astro.configs.recommended, prettier];

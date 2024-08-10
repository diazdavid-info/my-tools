/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'primary': '#fff',
				'secondary': '#f4f4f5',
				'accent': '#6e6e77',
				'primary-dark': '#1e1e1e',
				'secondary-dark': '#000',
			}
		},
	},
	darkMode: 'selector',
	plugins: [],
}

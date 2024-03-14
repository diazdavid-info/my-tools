/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				'open-sans': ['"Open Sans Variable"', 'sans-serif', 'ui-sans-serif', 'system-ui'],
			},
		},
	},
	plugins: [],
}

import { defineConfig, presetIcons } from 'unocss';

export default defineConfig({
	content: {
		pipeline: {
			include: [
				/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
				// include js/ts files
				'src/**/*.{js,ts}'
			]
		}
	},
	presets: [
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
				'font-size': '1em'
			}
		})
	]
});

import { defineConfig } from 'astro/config';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	vite: {
		minify: 'terser',
		target: browserslistToEsbuild(),
		cssMinify: 'lightningcss',
		cssTarget: browserslistToEsbuild(),

		plugins: [tailwindcss()],

		build: {
			rollupOptions: {
				output: {
					manualChunks: id => {
						if (typeof id !== 'string') {
							return;
						}
						if (id.includes('@fontsource')) {
							return 'font_source';
						}
					},
				},
			},
		},
	},
	adapter: vercel(),
});

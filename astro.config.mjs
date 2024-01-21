import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';
import browserslistToEsbuild from 'browserslist-to-esbuild';

export default defineConfig({
	integrations: [tailwindcss()],
	vite: {
		minify: 'terser',
		target: browserslistToEsbuild(),
		cssMinify: 'lightningcss',
		cssTarget: browserslistToEsbuild(),
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
});

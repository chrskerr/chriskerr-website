import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
	integrations: [tailwindcss()],
	vite: {
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

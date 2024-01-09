import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';
import purgecss from 'astro-purgecss';

export default defineConfig({
	integrations: [tailwindcss(), purgecss()],
});

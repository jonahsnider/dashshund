import tailwindcss from '@tailwindcss/vite';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
	},
	renderer: {
		plugins: [tailwindcss(), solidPlugin()],
	},
});

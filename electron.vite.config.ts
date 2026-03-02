import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import solidPlugin from 'vite-plugin-solid';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
	},
	renderer: {
		define: {
			__APP_VERSION__: JSON.stringify(pkg.version),
		},
		plugins: [tailwindcss(), solidPlugin()],
	},
});

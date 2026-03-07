import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

export default defineConfig({
	root: 'src/renderer',
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	plugins: [tailwindcss(), solidPlugin()],
	build: {
		outDir: '../../dist-renderer',
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
});

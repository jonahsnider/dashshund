import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import pkg from './package.json' with { type: 'json' };

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

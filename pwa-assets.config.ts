import { defineConfig } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	preset: {
		transparent: {
			sizes: [1024],
			favicons: [[48, 'favicon.ico']],
			padding: 0.05,
		},
		maskable: {
			sizes: [],
		},
		apple: {
			sizes: [],
		},
		assetName: (_type, size) => {
			return `icon-${size.width}x${size.height}.png`;
		},
	},
	images: ['build/logo.svg'],
});

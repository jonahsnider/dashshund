import { defineConfig } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	preset: {
		transparent: {
			sizes: [256, 1024],
			padding: 0,
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

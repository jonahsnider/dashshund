import type { Configuration } from 'electron-builder';

const config: Configuration = {
	appId: 'com.team581.dashshund',
	productName: 'Dashshund',
	icon: 'build/icon-1024x1024.png',
	directories: {
		output: 'dist',
	},
	mac: {
		icon: 'build/icon-1024x1024.png',
		target: [
			{
				target: 'dmg',
				arch: ['arm64', 'x64'],
			},
		],
	},
	win: {
		icon: 'build/icon-256x256.png',
		target: [
			{
				target: 'nsis',
				arch: ['x64', 'arm64'],
			},
		],
	},
};

export default config;

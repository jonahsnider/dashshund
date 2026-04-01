import { getCurrentWindow } from '@tauri-apps/api/window';
import { type } from '@tauri-apps/plugin-os';
import { render } from 'solid-js/web';
import './App.css';
import App from './App.tsx';
import { checkForUpdates } from './lib/updater.ts';

if (type() === 'windows') {
	checkForUpdates();

	getCurrentWindow().listen('check-for-updates', () => {
		checkForUpdates();
	});
}

// biome-ignore lint/style/noNonNullAssertion: root element always exists
render(() => <App />, document.getElementById('root')!);

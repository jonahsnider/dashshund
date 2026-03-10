import { getCurrentWindow } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { render } from 'solid-js/web';
import App from './App.tsx';
import './App.css';

check()
	.then(async (update) => {
		if (update) {
			console.log(`Update available: ${update.version}, downloading...`);
			await update.download();
			console.log('Update downloaded, will install on close');
			getCurrentWindow().onCloseRequested(async () => {
				await update.install();
			});
		}
	})
	.catch((error) => {
		console.error('Failed to check for updates:', error);
	});

// biome-ignore lint/style/noNonNullAssertion: root element always exists
render(() => <App />, document.getElementById('root')!);

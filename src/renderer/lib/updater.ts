import { getCurrentWindow } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { createSignal } from 'solid-js';

type UpdateState =
	| { status: 'idle' }
	| { status: 'checking' }
	| { status: 'downloading'; version: string }
	| { status: 'ready'; version: string; install: () => Promise<void> }
	| { status: 'error'; message: string }
	| { status: 'up-to-date' };

const [updateState, setUpdateState] = createSignal<UpdateState>({ status: 'idle' });

export { updateState };

export async function checkForUpdates(): Promise<void> {
	if (updateState().status === 'checking' || updateState().status === 'downloading') {
		return;
	}

	setUpdateState({ status: 'checking' });

	try {
		const update = await check();

		if (update) {
			setUpdateState({ status: 'downloading', version: update.version });
			await update.download();

			const install = async () => {
				await update.install();
			};

			setUpdateState({ status: 'ready', version: update.version, install });

			getCurrentWindow().onCloseRequested(async () => {
				await update.install();
			});
		} else {
			setUpdateState({ status: 'up-to-date' });
		}
	} catch (error) {
		console.error('Failed to check for updates:', error);
		setUpdateState({ status: 'error', message: String(error) });
	}
}

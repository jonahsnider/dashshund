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

type AvailableUpdate = NonNullable<Awaited<ReturnType<typeof check>>>;

function isUpdateInProgress(state: UpdateState): boolean {
	return state.status === 'checking' || state.status === 'downloading';
}

async function downloadUpdate(update: AvailableUpdate): Promise<void> {
	setUpdateState({ status: 'downloading', version: update.version });
	await update.download();

	const install = async () => {
		await update.install();
	};

	setUpdateState({ status: 'ready', version: update.version, install });

	getCurrentWindow().onCloseRequested(async () => {
		await update.install();
	});
}

export async function checkForUpdates(): Promise<void> {
	if (isUpdateInProgress(updateState())) return;

	setUpdateState({ status: 'checking' });

	try {
		const update = await check();

		if (!update) {
			setUpdateState({ status: 'up-to-date' });
			return;
		}

		await downloadUpdate(update);
	} catch (error) {
		console.error('Failed to check for updates:', error);
		setUpdateState({ status: 'error', message: String(error) });
	}
}

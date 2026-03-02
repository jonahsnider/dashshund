import { type Component, createEffect, createSignal, For, Show } from 'solid-js';
import type { CameraInfo } from '../lib/cameras.ts';

interface CameraSelectProps {
	cameras: CameraInfo[];
	onSelect: (url: string | undefined) => void;
}

const STORAGE_KEY = 'dashshund-camera-selection';

function loadSelection(): { camera: string; urlIndex: number; manualUrl: string } {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return { camera: '', urlIndex: 0, manualUrl: '' };
}

function saveSelection(camera: string, urlIndex: number, manualUrl: string) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ camera, urlIndex, manualUrl }));
}

const CameraSelect: Component<CameraSelectProps> = (props) => {
	const saved = loadSelection();
	const [selectedCamera, setSelectedCamera] = createSignal(saved.camera);
	const [urlIndex, setUrlIndex] = createSignal(saved.urlIndex);
	const [manualUrl, setManualUrl] = createSignal(saved.manualUrl);
	const [useManual, setUseManual] = createSignal(saved.camera === '__manual__');

	// Emit URL when selection changes
	createEffect(() => {
		let url: string | undefined;

		if (useManual()) {
			url = manualUrl() || undefined;
			saveSelection('__manual__', 0, manualUrl());
		} else {
			const cam = props.cameras.find((c) => c.name === selectedCamera());
			url = cam?.urls[urlIndex()] ?? cam?.urls[0];
			saveSelection(selectedCamera(), urlIndex(), manualUrl());
		}

		props.onSelect(url);
	});

	// Reset selection when the saved camera doesn't exist in the available list
	createEffect(() => {
		if (useManual() || !props.cameras.length) return;

		const name = selectedCamera();
		if (!name) {
			// No selection — auto-select the first camera
			setSelectedCamera(props.cameras[0]?.name);
		} else if (!props.cameras.some((c) => c.name === name)) {
			// Stale selection — reset to placeholder
			setSelectedCamera('');
		}
	});

	return (
		<div class='flex flex-col gap-3'>
			<span class='text-[10px] uppercase tracking-wider text-on-surface-variant'>Stream Source</span>

			<div class='flex'>
				<button
					type='button'
					class='flex-1 cursor-pointer py-2 text-sm uppercase tracking-wider border border-outline transition-colors rounded-l'
					classList={{
						'bg-secondary-container text-on-secondary-container': !useManual(),
						'bg-transparent text-on-surface': useManual(),
					}}
					onClick={() => setUseManual(false)}
				>
					Hostname
				</button>

				<button
					type='button'
					class='flex-1 cursor-pointer py-2 text-sm uppercase tracking-wider border border-outline border-l-0 transition-colors rounded-r'
					classList={{
						'bg-secondary-container text-on-secondary-container': useManual(),
						'bg-transparent text-on-surface': !useManual(),
					}}
					onClick={() => setUseManual(true)}
				>
					Manual IP
				</button>
			</div>

			<Show
				when={!useManual()}
				fallback={
					<input
						type='text'
						placeholder='http://10.5.81.11:5800/stream.mjpg'
						value={manualUrl()}
						onInput={(e) => setManualUrl(e.currentTarget.value)}
						class='w-full bg-transparent border-b border-outline py-2 text-sm text-on-surface outline-none focus:opacity-60 transition-opacity'
					/>
				}
			>
				<select
					value={selectedCamera()}
					onChange={(e) => {
						setSelectedCamera(e.currentTarget.value);
						setUrlIndex(0);
					}}
					class='w-full bg-surface-container border-b border-outline py-2 text-sm text-on-surface outline-none appearance-none cursor-pointer'
				>
					<option value='' disabled selected>
						Select camera...
					</option>
					<For each={props.cameras}>{(cam) => <option value={cam.name}>{cam.name}</option>}</For>
				</select>

				<Show when={props.cameras.find((c) => c.name === selectedCamera())}>
					{(cam) => (
						<Show when={cam().urls.length > 1}>
							<select
								value={urlIndex()}
								onChange={(e) => setUrlIndex(Number(e.currentTarget.value))}
								class='w-full bg-surface-container border-b border-outline py-2 text-sm text-on-surface outline-none appearance-none cursor-pointer'
							>
								<For each={cam().urls}>{(url, i) => <option value={i()}>{url}</option>}</For>
							</select>
						</Show>
					)}
				</Show>
			</Show>
		</div>
	);
};

export default CameraSelect;

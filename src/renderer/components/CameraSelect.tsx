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

	// Auto-select the first camera if none is selected
	createEffect(() => {
		if (!useManual() && !selectedCamera() && props.cameras.length > 0) {
			setSelectedCamera(props.cameras[0]?.name);
		}
	});

	return (
		<div class='flex flex-col gap-2 text-sm'>
			<label class='flex items-center gap-1 whitespace-nowrap'>
				<input type='checkbox' checked={useManual()} onChange={(e) => setUseManual(e.currentTarget.checked)} /> Manual
				URL
			</label>

			<Show
				when={!useManual()}
				fallback={
					<input
						type='text'
						placeholder='http://10.5.81.11:5800/stream.mjpg'
						value={manualUrl()}
						onInput={(e) => setManualUrl(e.currentTarget.value)}
						class='w-full px-1.5 py-1 bg-surface-container-highest border border-outline rounded text-on-surface text-sm'
					/>
				}
			>
				<select
					value={selectedCamera()}
					onChange={(e) => {
						setSelectedCamera(e.currentTarget.value);
						setUrlIndex(0);
					}}
					class='w-full px-1.5 py-1 bg-surface-container-highest border border-outline rounded text-on-surface text-sm'
				>
					<option value='' disabled>
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
								class='w-full px-1.5 py-1 bg-surface-container-highest border border-outline rounded text-on-surface text-sm'
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

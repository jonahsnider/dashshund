import { makePersisted } from '@solid-primitives/storage';
import { MdFillCheck } from 'solid-icons/md';
import { type Component, createEffect, createSignal, For, Show } from 'solid-js';
import urlParseLax from 'url-parse-lax';
import type { CameraInfo } from '../lib/cameras.ts';

interface CameraSelectProps {
	cameras: CameraInfo[];
	onSelect: (url: string | undefined) => void;
}

function parseManualUrl(value: string): string | undefined {
	const raw = value.trim();
	if (!raw) return undefined;

	const url = urlParseLax(raw, { https: false });
	if (!url.port) url.port = '5801';
	if (url.pathname === '/') url.pathname = '/stream.mjpg';
	return url.href;
}

function getCameraUrl(cameras: CameraInfo[], name: string, index: number): string | undefined {
	const camera = cameras.find((candidate) => candidate.name === name);
	if (!camera) return undefined;
	return camera.urls[index] ?? camera.urls[0];
}

function shouldSelectFirstCamera(useManual: boolean, cameras: CameraInfo[], selectedCamera: string): boolean {
	return !useManual && cameras.length > 0 && !selectedCamera;
}

const CameraSelect: Component<CameraSelectProps> = (props) => {
	const [selectedCamera, setSelectedCamera] = makePersisted(createSignal(''), { name: 'dashshund-camera' });
	const [urlIndex, setUrlIndex] = makePersisted(createSignal(0), { name: 'dashshund-camera-url-index' });
	const [manualUrl, setManualUrl] = makePersisted(createSignal(''), { name: 'dashshund-camera-manual-url' });
	const [useManual, setUseManual] = makePersisted(createSignal(false), { name: 'dashshund-camera-use-manual' });

	// Emit URL when selection changes
	createEffect(() => {
		const url = useManual() ? parseManualUrl(manualUrl()) : getCameraUrl(props.cameras, selectedCamera(), urlIndex());
		props.onSelect(url);
	});

	// Reset selection when the saved camera doesn't exist in the available list
	createEffect(() => {
		if (shouldSelectFirstCamera(useManual(), props.cameras, selectedCamera())) {
			setSelectedCamera(props.cameras[0]?.name);
		}
	});

	return (
		<div class='flex flex-col gap-3'>
			<span class='text-sm uppercase tracking-wider text-on-surface-variant'>Stream Source</span>

			<div class='flex'>
				<button
					type='button'
					class='flex-1 cursor-pointer py-2 text-base uppercase tracking-wider border border-outline transition-colors'
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
					class='flex-1 cursor-pointer py-2 text-sm uppercase tracking-wider border border-outline border-l-0 transition-colors'
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
						placeholder='10.5.81.11'
						value={manualUrl()}
						onInput={(e) => setManualUrl(e.currentTarget.value)}
						class='w-full bg-transparent border-b border-outline py-2 text-lg text-on-surface outline-none focus:opacity-60 transition-opacity'
					/>
				}
			>
				<div class='flex flex-col gap-1'>
					<Show when={selectedCamera() && !props.cameras.some((c) => c.name === selectedCamera())}>
						<button
							type='button'
							disabled
							class='w-full py-2 px-3 text-lg text-left border border-outline flex items-center gap-2 bg-secondary-container text-on-secondary-container opacity-50'
						>
							<MdFillCheck class='size-5 shrink-0' />
							{selectedCamera()}
						</button>
					</Show>
					<For each={props.cameras}>
						{(cam) => (
							<button
								type='button'
								class='w-full cursor-pointer py-2 px-3 text-lg text-left border border-outline transition-colors flex items-center gap-2'
								classList={{
									'bg-secondary-container text-on-secondary-container': selectedCamera() === cam.name,
									'bg-transparent text-on-surface': selectedCamera() !== cam.name,
								}}
								onClick={() => {
									setSelectedCamera(cam.name);
									setUrlIndex(0);
								}}
							>
								<MdFillCheck
									class='size-5 shrink-0 transition-opacity'
									classList={{
										'opacity-100': selectedCamera() === cam.name,
										'opacity-0': selectedCamera() !== cam.name,
									}}
								/>
								{cam.name}
							</button>
						)}
					</For>
				</div>

				<Show when={props.cameras.find((c) => c.name === selectedCamera())}>
					{(cam) => (
						<Show when={cam().urls.length > 1}>
							<select
								value={urlIndex()}
								onChange={(e) => setUrlIndex(Number(e.currentTarget.value))}
								class='w-full bg-surface-container border-b border-outline py-2 text-lg text-on-surface outline-none appearance-none cursor-pointer'
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

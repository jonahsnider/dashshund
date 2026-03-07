import { makePersisted } from '@solid-primitives/storage';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { NetworkTables } from 'ntcore-ts-client';
import { type Component, createEffect, createSignal, on, Show } from 'solid-js';
import CameraSelect from './components/CameraSelect.tsx';
import CameraStream, { type StreamStatus } from './components/CameraStream.tsx';
import ConnectionStatus from './components/ConnectionStatus.tsx';
import Settings from './components/Settings.tsx';
import { createCameraDiscovery } from './lib/cameras.ts';
import { createNTConnection } from './lib/nt.ts';

declare const __APP_VERSION__: string;

const App: Component = () => {
	const [teamNumber, setTeamNumber] = makePersisted(createSignal(581), { name: 'dashshund-team-number' });
	const [nt, setNt] = createSignal<NetworkTables>(NetworkTables.getInstanceByTeam(teamNumber()));
	const [streamUrl, setStreamUrl] = createSignal<string | undefined>();
	const [streamStatus, setStreamStatus] = createSignal<StreamStatus>('disconnected');
	const [sidebarOpen, setSidebarOpen] = makePersisted(createSignal(true), { name: 'dashshund-sidebar-open' });
	const [fullscreen, setFullscreen] = createSignal(false);
	const appWindow = getCurrentWindow();
	appWindow.onResized(async () => {
		setFullscreen(await appWindow.isFullscreen());
	});

	const ntConnected = createNTConnection(nt());
	const cameras = createCameraDiscovery(nt());

	// Reconnect NT4 when team number changes
	createEffect(
		on(teamNumber, (team, prevTeam) => {
			if (prevTeam !== undefined && team !== prevTeam) {
				const instance = NetworkTables.getInstanceByTeam(team);
				setNt(instance);
			}
		}),
	);

	return (
		<div class='flex h-full'>
			<aside
				class='flex flex-col justify-between bg-surface-container border-r border-outline-variant shrink-0'
				classList={{ 'w-80': sidebarOpen() }}
			>
				<div class='flex flex-col'>
					<ConnectionStatus ntConnected={ntConnected()} streamStatus={streamStatus()} />

					<Show when={sidebarOpen()}>
						<div class='flex flex-col gap-5 p-4'>
							<div class='flex justify-between items-baseline uppercase tracking-wider font-bold text-lg'>
								<span>Dashshund</span>
								<span class='text-sm text-on-surface-variant font-normal'>v{__APP_VERSION__}</span>
							</div>

							<Settings onTeamChange={setTeamNumber} />
							<CameraSelect cameras={cameras()} onSelect={setStreamUrl} />
						</div>
					</Show>
				</div>

				<div class='flex flex-col mt-auto'>
					<Show when={sidebarOpen()}>
						<button
							type='button'
							class='p-3 text-base uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors border-t border-outline-variant cursor-pointer'
							onClick={async () => {
								const newFullscreen = !(await appWindow.isFullscreen());
								await appWindow.setFullscreen(newFullscreen);
								setFullscreen(newFullscreen);
							}}
						>
							{fullscreen() ? 'Exit fullscreen' : 'Fullscreen'}
						</button>
					</Show>
					<button
						type='button'
						class='p-3 text-base uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors border-t border-outline-variant cursor-pointer'
						onClick={() => setSidebarOpen(!sidebarOpen())}
					>
						{sidebarOpen() ? 'Close' : 'Open'} sidebar
					</button>
				</div>
			</aside>

			<main class='relative flex-1 flex items-center justify-center overflow-hidden'>
				<CameraStream url={streamUrl()} ntConnected={ntConnected()} onStatusChange={setStreamStatus} />
			</main>
		</div>
	);
};

export default App;

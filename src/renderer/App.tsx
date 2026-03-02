import { makePersisted } from '@solid-primitives/storage';
import { NetworkTables } from 'ntcore-ts-client';
import { type Component, createEffect, createSignal, on } from 'solid-js';
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
			<aside class='w-80 flex flex-col justify-between bg-surface-container border-r border-outline-variant shrink-0'>
				<div class='flex flex-col gap-8 p-6'>
					<div class='flex justify-between items-baseline uppercase tracking-wider font-bold text-sm'>
						<span>Dashshund</span>
						<span class='text-xs text-on-surface-variant font-normal'>v{__APP_VERSION__}</span>
					</div>

					<Settings onTeamChange={setTeamNumber} />
					<CameraSelect cameras={cameras()} onSelect={setStreamUrl} />
				</div>

				<ConnectionStatus ntConnected={ntConnected()} streamStatus={streamStatus()} />
			</aside>

			<main class='flex-1 flex items-center justify-center overflow-hidden'>
				<CameraStream url={streamUrl()} ntConnected={ntConnected()} onStatusChange={setStreamStatus} />
			</main>
		</div>
	);
};

export default App;

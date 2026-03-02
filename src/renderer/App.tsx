import { NetworkTables } from 'ntcore-ts-client';
import { type Component, createEffect, createSignal, on } from 'solid-js';
import CameraSelect from './components/CameraSelect.tsx';
import CameraStream, { type StreamStatus } from './components/CameraStream.tsx';
import ConnectionStatus from './components/ConnectionStatus.tsx';
import Settings, { loadTeamNumber } from './components/Settings.tsx';
import { createCameraDiscovery } from './lib/cameras.ts';
import { createNTConnection } from './lib/nt.ts';

const App: Component = () => {
	const [teamNumber, setTeamNumber] = createSignal(loadTeamNumber());
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
			<aside class='flex flex-col gap-3 px-3 py-2 bg-surface-container border-r border-outline-variant shrink-0'>
				<Settings onTeamChange={setTeamNumber} />
				<ConnectionStatus ntConnected={ntConnected()} streamStatus={streamStatus()} />
				<CameraSelect cameras={cameras()} onSelect={setStreamUrl} />
			</aside>

			<main class='flex-1 flex items-center justify-center overflow-hidden'>
				<CameraStream url={streamUrl()} ntConnected={ntConnected()} onStatusChange={setStreamStatus} />
			</main>
		</div>
	);
};

export default App;

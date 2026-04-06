import type { NetworkTables } from 'ntcore-ts-client';
import { type Accessor, createSignal, onCleanup } from 'solid-js';

/** Reactive signal tracking NT4 robot connection state. */
export function createNTConnection(nt: NetworkTables): Accessor<boolean> {
	const [connected, setConnected] = createSignal(nt.isRobotConnected());
	const remove = nt.addRobotConnectionListener(setConnected, true);
	onCleanup(remove);
	return connected;
}

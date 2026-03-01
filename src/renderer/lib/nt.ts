import type { NetworkTablesTypeInfo } from 'ntcore-ts-client';
import { NetworkTables, NetworkTablesTypeInfos } from 'ntcore-ts-client';
import { type Accessor, createSignal, onCleanup } from 'solid-js';

export { NetworkTables, NetworkTablesTypeInfos };

/** Reactive signal tracking NT4 robot connection state. */
export function createNTConnection(nt: NetworkTables): Accessor<boolean> {
	const [connected, setConnected] = createSignal(nt.isRobotConnected());
	const remove = nt.addRobotConnectionListener(setConnected, true);
	onCleanup(remove);
	return connected;
}

/** Read-only reactive signal for an NT4 topic value. */
export function createNTValue<T>(
	nt: NetworkTables,
	key: string,
	typeInfo: NetworkTablesTypeInfo,
	defaultValue?: T,
): Accessor<T | undefined> {
	const topic = nt.createTopic<T>(key, typeInfo, defaultValue);
	const [value, setValue] = createSignal<T | undefined>(topic.getValue() ?? defaultValue);
	const subId = topic.subscribe((v) => {
		setValue(() => (v ?? undefined) as T | undefined);
	});
	onCleanup(() => topic.unsubscribe(subId));
	return value;
}

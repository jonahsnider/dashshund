import type { NetworkTables } from 'ntcore-ts-client';
import { type Accessor, createSignal, onCleanup } from 'solid-js';

export interface CameraInfo {
	name: string;
	urls: string[];
}

/**
 * Subscribe to /CameraPublisher/ prefix and expose discovered cameras as a signal.
 * Each camera publishes a string array at /CameraPublisher/<name>/streams
 * with entries like "mjpg:http://...".
 */
export function createCameraDiscovery(nt: NetworkTables): Accessor<CameraInfo[]> {
	const [cameras, setCameras] = createSignal<CameraInfo[]>([]);
	const cameraMap = new Map<string, string[]>();

	const prefixTopic = nt.createPrefixTopic('/CameraPublisher/');
	const subId = prefixTopic.subscribe((value, params) => {
		if (!params.name.endsWith('/streams')) return;

		// Extract camera name from /CameraPublisher/<name>/streams
		const parts = params.name.split('/');
		const cameraName = parts[2];
		if (!cameraName) return;

		// Value is a string array like ["mjpg:http://...", "mjpg:http://..."]
		const rawUrls = Array.isArray(value) ? (value as string[]) : [];
		const urls = rawUrls
			.filter((u) => typeof u === 'string')
			.map((u) => {
				// Strip protocol prefixes like "mjpg:" or "mjpeg:"
				const colonIndex = u.indexOf(':');
				if (colonIndex > 0 && colonIndex < 6) {
					return u.slice(colonIndex + 1);
				}
				return u;
			});

		cameraMap.set(cameraName, urls);

		setCameras([...cameraMap.entries()].map(([name, urls]) => ({ name, urls })));
	});

	onCleanup(() => prefixTopic.unsubscribe(subId));

	return cameras;
}

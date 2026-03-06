import { type Component, createEffect, createSignal, on, onCleanup } from 'solid-js';

export type StreamStatus = 'connected' | 'disconnected' | 'reconnecting';

interface CameraStreamProps {
	url: string | undefined;
	ntConnected: boolean;
	onStatusChange?: (status: StreamStatus) => void;
}

const INITIAL_RETRY_MS = 500;
const MAX_RETRY_MS = 5000;
/** How often to probe the camera while connected. */
const HEALTH_CHECK_INTERVAL_MS = 5_000;
/** How long a health-check probe may take before we consider it failed. */
const HEALTH_CHECK_TIMEOUT_MS = 3_000;

function appendTimestamp(url: string): string {
	return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
}

const CameraStream: Component<CameraStreamProps> = (props) => {
	const [status, setStatus] = createSignal<StreamStatus>('disconnected');
	const [imgSrc, setImgSrc] = createSignal<string>();
	let retryMs = INITIAL_RETRY_MS;
	let retryTimeout: ReturnType<typeof setTimeout> | undefined;
	let healthInterval: ReturnType<typeof setInterval> | undefined;

	function updateStatus(s: StreamStatus) {
		setStatus(s);
		props.onStatusChange?.(s);
	}

	function stopTimers() {
		clearTimeout(retryTimeout);
		retryTimeout = undefined;
		clearInterval(healthInterval);
		healthInterval = undefined;
	}

	function connect(url: string) {
		stopTimers();
		updateStatus('reconnecting');
		setImgSrc(appendTimestamp(url));
	}

	function retry(url: string) {
		stopTimers();
		updateStatus('reconnecting');
		retryTimeout = setTimeout(() => {
			setImgSrc(appendTimestamp(url));
			retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
		}, retryMs);
	}

	/**
	 * Periodically load the camera URL in a hidden Image to detect stale MJPEG
	 * streams. The visible `<img>` never fires `onerror` when an MJPEG stream
	 * stalls — it just shows the last received frame forever. This probe catches
	 * that by independently testing whether the camera is reachable.
	 */
	function startHealthCheck(url: string) {
		clearInterval(healthInterval);
		healthInterval = setInterval(() => {
			const probe = new Image();
			const timeout = setTimeout(() => {
				probe.onload = null;
				probe.onerror = null;
				probe.src = '';
				onHealthFailure();
			}, HEALTH_CHECK_TIMEOUT_MS);

			probe.onload = () => {
				clearTimeout(timeout);
				probe.onload = null;
				probe.onerror = null;
				probe.src = ''; // stop the MJPEG data
			};
			probe.onerror = () => {
				clearTimeout(timeout);
				probe.onload = null;
				probe.onerror = null;
				onHealthFailure();
			};

			probe.src = appendTimestamp(url);
		}, HEALTH_CHECK_INTERVAL_MS);
	}

	function onHealthFailure() {
		if (props.url) {
			connect(props.url);
		}
	}

	// React to URL changes
	createEffect(
		on(
			() => props.url,
			(url) => {
				stopTimers();
				retryMs = INITIAL_RETRY_MS;

				if (url) {
					connect(url);
				} else {
					setImgSrc(undefined);
					updateStatus('disconnected');
				}
			},
		),
	);

	// When NT4 connection state changes, reconnect the stream immediately.
	// This catches network drops faster than the health-check interval.
	createEffect(
		on(
			() => props.ntConnected,
			(_connected, wasConnected) => {
				if (wasConnected === undefined) return; // skip initial run
				if (!props.url) return;

				retryMs = INITIAL_RETRY_MS;
				connect(props.url);
			},
		),
	);

	onCleanup(stopTimers);

	return (
		<div class='relative w-full h-full flex items-center justify-center'>
			{imgSrc() ? (
				<img
					src={imgSrc()}
					alt='Camera stream'
					class='w-full h-full object-contain'
					classList={{ invisible: status() !== 'connected' }}
					onLoad={() => {
						retryMs = INITIAL_RETRY_MS;
						updateStatus('connected');
						if (props.url) {
							startHealthCheck(props.url);
						}
					}}
					onError={() => {
						stopTimers();
						updateStatus('disconnected');
						if (props.url) {
							retry(props.url);
						}
					}}
				/>
			) : (
				<div class='text-on-surface-variant text-2xl'>No camera URL</div>
			)}
			{status() !== 'connected' && imgSrc() && (
				<div class='absolute inset-0 flex items-center justify-center'>
					<div class='text-on-surface-variant text-2xl capitalize'>{status()}</div>
				</div>
			)}
		</div>
	);
};

export default CameraStream;

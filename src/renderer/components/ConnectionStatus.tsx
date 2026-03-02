import type { Component } from 'solid-js';
import type { StreamStatus } from './CameraStream.tsx';

interface ConnectionStatusProps {
	ntConnected: boolean;
	streamStatus: StreamStatus;
}

function ntLabel(connected: boolean) {
	return connected ? 'Connected' : 'Disconnected';
}

function streamLabel(status: StreamStatus) {
	if (status === 'connected') return 'Connected';
	if (status === 'reconnecting') return 'Reconnecting';
	return 'Disconnected';
}

const baseStyle = 'p-4 text-center uppercase tracking-wider text-sm font-bold';

const ConnectionStatus: Component<ConnectionStatusProps> = (props) => {
	return (
		<div class='flex flex-col border-t border-outline-variant'>
			<div class={baseStyle} classList={{ 'bg-error-container text-white': !props.ntConnected }}>
				NT4: {ntLabel(props.ntConnected)}
			</div>
			<div
				class={baseStyle}
				classList={{
					'bg-yellow-600 text-white animate-pulse': props.streamStatus === 'reconnecting',
					'bg-error-container text-white': props.streamStatus === 'disconnected',
				}}
			>
				Stream: {streamLabel(props.streamStatus)}
			</div>
		</div>
	);
};

export default ConnectionStatus;

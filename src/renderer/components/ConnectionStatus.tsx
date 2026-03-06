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

function StatusRow(props: { label: string; value: string; state: 'ok' | 'warn' | 'error' }) {
	return (
		<div
			class='flex items-center gap-3 px-4 py-3 border-l-2'
			classList={{
				'border-l-status-ok bg-status-ok/5': props.state === 'ok',
				'border-l-status-warn bg-status-warn/5 warning-tape-warn': props.state === 'warn',
				'border-l-error bg-error-container/20 warning-tape-error': props.state === 'error',
			}}
		>
			<span
				class='w-3 h-3 shrink-0 rounded-full'
				classList={{
					'bg-status-ok shadow-[0_0_6px_var(--color-status-ok)]': props.state === 'ok',
					'bg-status-warn shadow-[0_0_6px_var(--color-status-warn)] animate-pulse': props.state === 'warn',
					'bg-error shadow-[0_0_6px_var(--color-error)]': props.state === 'error',
				}}
			/>
			<span class='uppercase tracking-wider text-base text-on-surface-variant'>{props.label}</span>
			<span
				class='ml-auto uppercase tracking-wider text-base font-bold'
				classList={{
					'text-status-ok': props.state === 'ok',
					'text-status-warn': props.state === 'warn',
					'text-error': props.state === 'error',
				}}
			>
				{props.value}
			</span>
		</div>
	);
}

const ConnectionStatus: Component<ConnectionStatusProps> = (props) => {
	const ntState = () => (props.ntConnected ? 'ok' : 'error') as const;
	const streamState = () => {
		if (props.streamStatus === 'connected') return 'ok' as const;
		if (props.streamStatus === 'reconnecting') return 'warn' as const;
		return 'error' as const;
	};

	return (
		<div class='flex flex-col border-b border-outline-variant'>
			<StatusRow label='NT4' value={ntLabel(props.ntConnected)} state={ntState()} />
			<StatusRow label='Stream' value={streamLabel(props.streamStatus)} state={streamState()} />
		</div>
	);
};

export default ConnectionStatus;

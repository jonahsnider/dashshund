interface Window {
	electron: {
		toggleFullscreen: () => Promise<void>;
		onFullscreenChange: (callback: (isFullscreen: boolean) => void) => void;
	};
}

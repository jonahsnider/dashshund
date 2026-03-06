interface Window {
	electron: {
		toggleFullscreen: () => Promise<boolean>;
		isFullscreen: () => Promise<boolean>;
	};
}

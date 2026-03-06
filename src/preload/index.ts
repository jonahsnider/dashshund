import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
	onFullscreenChange: (callback: (isFullscreen: boolean) => void) => {
		ipcRenderer.on('fullscreen-changed', (_event, isFullscreen: boolean) => callback(isFullscreen));
	},
});

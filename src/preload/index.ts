import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
	isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
});

import { join } from 'node:path';
import { is } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, shell } from 'electron';

function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		show: false,
		backgroundColor: '#1a1111',
		title: 'Dashshund',
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
		},
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow.maximize();
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}
}

app.whenReady().then(() => {
	createWindow();

	ipcMain.handle('toggle-fullscreen', () => {
		const win = BrowserWindow.getFocusedWindow();
		if (win) {
			win.setFullScreen(!win.isFullScreen());
			return win.isFullScreen();
		}
		return false;
	});

	ipcMain.handle('is-fullscreen', () => {
		const win = BrowserWindow.getFocusedWindow();
		return win?.isFullScreen() ?? false;
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

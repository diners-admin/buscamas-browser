const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let updateReady = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'Buscamas',
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  });
  mainWindow.loadFile('index.html');

  ipcMain.removeHandler('navigate-in-app');
  ipcMain.handle('navigate-in-app', (_event, url) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'buscamas.es' || parsed.hostname === 'www.buscamas.es') return mainWindow.loadURL(parsed.toString());
    } catch {}
    return false;
  });
}

function configureAutoUpdates() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => mainWindow?.webContents.send('update-status', { state: 'checking' }));
  autoUpdater.on('update-available', info => mainWindow?.webContents.send('update-status', { state: 'available', version: info.version }));
  autoUpdater.on('download-progress', progress => mainWindow?.webContents.send('update-status', { state: 'downloading', percent: Math.round(progress.percent) }));
  autoUpdater.on('update-downloaded', info => {
    updateReady = true;
    mainWindow?.webContents.send('update-status', { state: 'ready', version: info.version });
  });
  autoUpdater.on('error', error => mainWindow?.webContents.send('update-status', { state: 'error', message: error.message }));
  if (app.isPackaged) setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
}

app.whenReady().then(() => {
  ipcMain.handle('open-external', (_event, url) => {
    try {
      const parsed = new URL(url);
      if (['http:', 'https:'].includes(parsed.protocol)) return shell.openExternal(parsed.toString());
    } catch {}
    return false;
  });
  ipcMain.on('restart-and-update', () => {
    if (updateReady) autoUpdater.quitAndInstall(false, true);
    else app.quit();
  });
  createWindow();
  configureAutoUpdates();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

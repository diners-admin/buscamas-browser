const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('buscamas', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  navigateInApp: (url) => ipcRenderer.invoke('navigate-in-app', url),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, status) => callback(status)),
  restartAndUpdate: () => ipcRenderer.send('restart-and-update')
});

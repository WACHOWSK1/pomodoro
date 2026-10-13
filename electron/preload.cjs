const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  enterMiniMode: (size) => ipcRenderer.invoke('enter-mini-mode', size),
  exitMiniMode: () => ipcRenderer.invoke('exit-mini-mode'),
  hideMiniMode: () => ipcRenderer.invoke('hide-mini-mode'),
  toggleMiniMode: () => ipcRenderer.invoke('toggle-mini-mode'),
  setAutoMiniOnMinimize: (val) => ipcRenderer.invoke('set-auto-mini-on-minimize', val),
  setMiniSize: (size) => ipcRenderer.invoke('set-mini-size', size),
  updateTrayTimer: (text) => ipcRenderer.invoke('update-tray-timer', text),
  onMiniModeChanged: (callback) => {
    ipcRenderer.on('mini-mode-changed', (_event, isMini) => callback(isMini));
  }
});


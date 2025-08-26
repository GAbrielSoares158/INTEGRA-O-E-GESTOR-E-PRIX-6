const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  testBalanca: (config) => ipcRenderer.invoke('test-balanca', config),
  testEGestor: (config) => ipcRenderer.invoke('test-egestor', config),
  sincronizarPeso: (config, codigoProduto) => ipcRenderer.invoke('sincronizar-peso', config, codigoProduto),
  selectDirectory: () => ipcRenderer.invoke('select-directory')
});
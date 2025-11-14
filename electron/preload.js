const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
  readPdfFile: (filePath) => ipcRenderer.invoke('fs:readPdfFile', filePath),
  fileExists: (filePath) => ipcRenderer.invoke('fs:fileExists', filePath)
})

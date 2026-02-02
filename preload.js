const { contextBridge, ipcRenderer } = require('electron');
const mammoth = require('mammoth');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  saveFileDialog: () => ipcRenderer.invoke('save-file-dialog'),
  
  // Menu events
  onFileNew: (callback) => ipcRenderer.on('file-new', callback),
  onFileSave: (callback) => ipcRenderer.on('file-save', callback),
  onFileSaveAs: (callback) => ipcRenderer.on('file-save-as', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  
  // Send events
  openFileDialog: () => ipcRenderer.send('open-file-dialog')
});

// Expose mammoth for document processing
contextBridge.exposeInMainWorld('mammoth', mammoth);

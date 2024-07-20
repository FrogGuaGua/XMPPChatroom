// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
// This is the electron defaut 
import { contextBridge,ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// Real p2p
const api = {startP2P: (filePath) => ipcRenderer.invoke('start-p2p', filePath)}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}


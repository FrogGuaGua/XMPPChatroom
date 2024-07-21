// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
// This is the electron defaut 
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const net = require('net');
const WebSocket = require('ws');
const os = require('os');
const fs = require('fs');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contentSecurityPolicy: '*',
      backgroundThrottling:false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Real p2p
// Nerver used
// Cuz it is peer to peer not point to pint
class P2PPort {
  constructor() {
      this.port = null;
      this.server = null;
  }
  getRandomPort(min, max) {
      return new Promise((resolve, reject) => {
          const port = Math.floor(Math.random() * (max - min + 1)) + min;
          const server = net.createServer();
  
          server.on('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                  resolve(this.getRandomPort(min, max));
              } else {
                  reject(err);
              }
          });
          server.listen(port, '127.0.0.1', () => {
              server.close(() => {
                  resolve(port);
              });
          });
      });
  }
  getServerIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface in interfaces) {
      for (const alias of interfaces[iface]) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
    return '127.0.0.1'; 
  }
  async onload(file) {
      this.port = await this.getRandomPort(1024,65535)
      this.server = new WebSocket.Server({ port: this.port });
      this.server.on('connection', (websocket) => {
          console.log('Client connected');
          fs.readFile(file, async (err, data) => {
              if (err) {
                  console.error('Error reading file:', err);
                  websocket.close();
                  return;
              }
              console.log(file)
              await websocket.send(data);
          });
          websocket.on('close', () => {
              console.log('Client disconnected');
          });
          websocket.on('error', () => {
            console.log('Download error');
            websocket.close();
        });
      });
      return await this.port
  } catch(error) {
      console.error('Error setting up server:', error);
      return false;
  }
}

ipcMain.handle('start-p2p', async (event, filePath) => {
  const p2p = new P2PPort();
  const port = await p2p.onload(filePath);
  return port;
});


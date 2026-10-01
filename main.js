const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // 🔓 Bypasses CORS restrictions natively inside Electron!
    }
  });

  // 🚴 Native Bluetooth Auto-Pairing Interceptor
  // Electron intercepts Chrome's popup event and picks the first device it finds
  win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    const pairable = deviceList.find(device => true);
    if (pairable) {
      callback(pairable.deviceId);
    } else {
      callback('');
    }
  });

  // Direct Electron to look at your local Vite development engine server
  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Ensure proper taskbar grouping and notifications in Windows
app.setAppUserModelId('br.com.focusmestrado.pomodoro');

let mainWindow = null;

function createWindow() {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../build/icon.ico')
    : path.join(__dirname, '../build/icon.png');

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 880,
    minWidth: 880,
    minHeight: 620,
    backgroundColor: '#090d16',
    icon: iconPath,
    show: false, // Wait until ready-to-show to prevent white flash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true
  });

  // Remove default menu bar for clean modern app look
  Menu.setApplicationMenu(null);

  // Check if running in dev mode
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Graceful show once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

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

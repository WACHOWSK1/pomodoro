const { app, BrowserWindow, Menu, Tray, ipcMain, screen, Notification } = require('electron');
const path = require('path');

// Ensure proper taskbar grouping and notifications in Windows
app.setAppUserModelId('br.com.focusmestrado.pomodoro');

let mainWindow = null;
let tray = null;
let isMiniMode = false;
let previousBounds = null;
let autoMiniOnMinimize = true;
let isQuitting = false;

function getIconPath() {
  return process.platform === 'win32'
    ? path.join(__dirname, '../build/icon.ico')
    : path.join(__dirname, '../build/icon.png');
}

function createWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 880,
    minWidth: 880,
    minHeight: 620,
    backgroundColor: '#090d16',
    icon: iconPath,
    show: false, // Wait until ready-to-show to prevent white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
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

  // Intercept window minimize to enter mini floating mode if configured
  mainWindow.on('minimize', (event) => {
    if (autoMiniOnMinimize && !isMiniMode) {
      event.preventDefault();
      enterMiniMode('medium');
      mainWindow.webContents.send('mini-mode-changed', true);
    }
  });

  // When in mini mode, closing the mini window hides to tray instead of killing the app
  mainWindow.on('close', (event) => {
    if (!isQuitting && isMiniMode) {
      event.preventDefault();
      mainWindow.hide();

      if (Notification.isSupported()) {
        try {
          new Notification({
            title: 'Focus Mestrado Ativo',
            body: 'O cronômetro continua rodando em segundo plano. Clique no ícone da bandeja para reabrir a qualquer momento.',
            icon: iconPath
          }).show();
        } catch (_) {}
      }
      return;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = getIconPath();
  tray = new Tray(iconPath);
  tray.setToolTip('Focus Mestrado - Pomodoro de Alta Performance');

  const updateContextMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Abrir Focus Mestrado (Janela Completa)',
        click: () => {
          if (!mainWindow) {
            createWindow();
          } else {
            exitMiniMode();
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Modo Janela Flutuante (Mini Relógio)',
        click: () => {
          if (!mainWindow) {
            createWindow();
          }
          mainWindow.show();
          enterMiniMode('medium');
          mainWindow.webContents.send('mini-mode-changed', true);
        }
      },
      { type: 'separator' },
      {
        label: 'Fechar Programa por Completo',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateContextMenu();

  tray.on('double-click', () => {
    if (!mainWindow) {
      createWindow();
      return;
    }
    if (mainWindow.isVisible()) {
      if (isMiniMode) {
        exitMiniMode();
      } else {
        mainWindow.hide();
      }
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  tray.on('click', () => {
    if (!mainWindow) {
      createWindow();
      return;
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function enterMiniMode(presetSize = 'medium') {
  if (!mainWindow) return;

  if (!isMiniMode) {
    previousBounds = mainWindow.getBounds();
  }

  isMiniMode = true;

  // Calculate target dimensions
  let targetWidth = 280;
  let targetHeight = 330;
  if (presetSize === 'small') {
    targetWidth = 220;
    targetHeight = 260;
  } else if (presetSize === 'large') {
    targetWidth = 360;
    targetHeight = 420;
  }

  // Position at bottom-right corner of screen by default if opening for first time
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;

  const currentBounds = mainWindow.getBounds();
  let targetX = currentBounds.x;
  let targetY = currentBounds.y;

  // If outside bounds or on first switch, dock to bottom-right
  if (!previousBounds) {
    targetX = workArea.x + workArea.width - targetWidth - 24;
    targetY = workArea.y + workArea.height - targetHeight - 24;
  } else {
    targetX = Math.min(workArea.x + workArea.width - targetWidth - 20, Math.max(workArea.x, currentBounds.x));
    targetY = Math.min(workArea.y + workArea.height - targetHeight - 20, Math.max(workArea.y, currentBounds.y));
  }

  mainWindow.setMinimumSize(180, 200);
  mainWindow.setBounds({
    x: targetX,
    y: targetY,
    width: targetWidth,
    height: targetHeight
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);
}

function exitMiniMode() {
  if (!mainWindow) return;

  isMiniMode = false;
  mainWindow.setAlwaysOnTop(false);
  mainWindow.setVisibleOnAllWorkspaces(false);
  mainWindow.setMinimumSize(880, 620);

  if (previousBounds) {
    mainWindow.setBounds(previousBounds);
  } else {
    mainWindow.setSize(1240, 880);
    mainWindow.center();
  }

  mainWindow.show();
}

function hideMiniMode() {
  if (!mainWindow) return;
  mainWindow.hide();

  const iconPath = getIconPath();
  if (Notification.isSupported()) {
    try {
      new Notification({
        title: 'Focus Mestrado Ativo',
        body: 'O cronômetro continua rodando em segundo plano. Clique no ícone da bandeja para reabrir.',
        icon: iconPath
      }).show();
    } catch (_) {}
  }
}

// IPC Handlers
ipcMain.handle('enter-mini-mode', (_event, size) => {
  enterMiniMode(size || 'medium');
  return { success: true, isMiniMode: true };
});

ipcMain.handle('exit-mini-mode', () => {
  exitMiniMode();
  return { success: true, isMiniMode: false };
});

ipcMain.handle('hide-mini-mode', () => {
  hideMiniMode();
  return { success: true };
});

ipcMain.handle('toggle-mini-mode', () => {
  if (isMiniMode) {
    exitMiniMode();
  } else {
    enterMiniMode('medium');
  }
  return { success: true, isMiniMode };
});

ipcMain.handle('set-mini-size', (_event, size) => {
  if (isMiniMode) {
    enterMiniMode(size);
  }
  return { success: true, size };
});

ipcMain.handle('set-auto-mini-on-minimize', (_event, val) => {
  autoMiniOnMinimize = !!val;
  return { success: true, autoMiniOnMinimize };
});

ipcMain.handle('update-tray-timer', (_event, text) => {
  if (tray) {
    tray.setToolTip(`Focus Mestrado: ${text}`);
  }
  return { success: true };
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

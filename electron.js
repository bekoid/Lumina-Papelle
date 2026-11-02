import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly register Windows Application User Model ID for crisp taskbar icon & grouping
if (process.platform === 'win32') {
  app.setAppUserModelId('com.luminapapelle.desktop');
}

// Performance optimizations for 60/120 FPS fluid canvas & glassmorphic UI
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow = null;

function createWindow() {
  const isWin = process.platform === 'win32';
  const iconPath = isWin
    ? (fs.existsSync(path.join(__dirname, 'build', 'icon.ico'))
        ? path.join(__dirname, 'build', 'icon.ico')
        : path.join(__dirname, 'public', 'icon.ico'))
    : (fs.existsSync(path.join(__dirname, 'build', 'icon.png'))
        ? path.join(__dirname, 'build', 'icon.png')
        : path.join(__dirname, 'public', 'icon.png'));

  mainWindow = new BrowserWindow({
    width: 1420,
    height: 880,
    minWidth: 380,
    minHeight: 560,
    title: 'Lumina Papelle — Estetik Dijital Kırtasiye & Not Alma Stüdyosu',
    icon: iconPath,
    backgroundColor: '#F6F4FE',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  let isClosing = false;
  mainWindow.on('close', (e) => {
    if (!isClosing) {
      isClosing = true;
      e.preventDefault();
      // Trigger synchronous save flush in renderer before destroying the window
      mainWindow.webContents
        .executeJavaScript('typeof window.__luminaFlushSave === "function" && window.__luminaFlushSave()')
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.destroy();
            }
          }, 80);
        });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

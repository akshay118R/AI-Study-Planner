import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startEmbeddedServer } from './server.js';
import { createWindowStateManager } from './windowState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Windows Application Model ID for proper taskbar grouping
app.setAppUserModelId('com.ai.studytaskplanner');

// Prevent multiple duplicate instances of the application
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[AI Study Planner] Another instance is already running. Exiting.');
  app.quit();
}

let mainWindow = null;
let embeddedServer = null;

async function createMainWindow() {
  const appPath = app.getAppPath();
  console.log('[AI Study Planner] Starting application from:', appPath);

  // Start embedded loopback server
  const { server, port, url } = await startEmbeddedServer(appPath);
  embeddedServer = server;

  // Window State Manager (remembers width, height, position, maximized state)
  const windowManager = createWindowStateManager(app.getPath('userData'), {
    width: 1280,
    height: 820
  });

  const iconPath = path.join(__dirname, '../build/icon.ico');

  mainWindow = new BrowserWindow({
    width: windowManager.bounds.width,
    height: windowManager.bounds.height,
    x: windowManager.bounds.x,
    y: windowManager.bounds.y,
    minWidth: 960,
    minHeight: 600,
    title: 'AI Study & Task Planner',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#F8FAFC',
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.focus();

  // Track window resizing, moving, maximizing
  windowManager.track(mainWindow);
  if (windowManager.isMaximized) {
    mainWindow.maximize();
  }

  // Native application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        { type: 'separator' },
        { role: 'quit', accelerator: 'Alt+F4' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools', accelerator: 'CmdOrCtrl+Shift+I' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setMenuBarVisibility(false);

  // External links delegate to default browser
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('http:') || targetUrl.startsWith('https:')) {
      shell.openExternal(targetUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!targetUrl.startsWith(url)) {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    console.log('[AI Study Planner Desktop] Window ready and shown.');
  });

  await mainWindow.loadURL(url);

  if (!mainWindow.isVisible()) {
    mainWindow.show();
    mainWindow.focus();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (embeddedServer) {
    embeddedServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

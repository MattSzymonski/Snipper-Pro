import { app, BrowserWindow, globalShortcut, screen, ipcMain, clipboard, nativeImage } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let captureWindow: BrowserWindow | null = null;
let hollowWindow: BrowserWindow | null = null;

function createMainWindow() {
    // Create a hidden main window (runs in background)
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));
}

function createCaptureWindow() {
    // Don't allow capture mode if hollow window exists
    if (hollowWindow) {
        console.log('Hollow window already exists, cannot create capture window');
        return;
    }

    if (captureWindow) {
        captureWindow.close();
    }

    const { width, height } = screen.getPrimaryDisplay().bounds;

    captureWindow = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        fullscreen: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    captureWindow.setIgnoreMouseEvents(false);
    captureWindow.loadFile(path.join(__dirname, '../capture.html'));

    // Open DevTools for debugging
    //captureWindow.webContents.openDevTools({ mode: 'detach' });

    captureWindow.on('closed', () => {
        captureWindow = null;
    });
}

function captureScreen(bounds: { x: number; y: number; width: number; height: number }) {
    const { x, y, width, height } = bounds;

    // Ensure positive dimensions
    if (width <= 0 || height <= 0) {
        return;
    }

    // Hide the capture window before taking screenshot
    if (captureWindow) {
        captureWindow.hide();
    }

    // Small delay to ensure window is hidden
    setTimeout(() => {
        // Capture the screen area
        const sources = screen.getPrimaryDisplay();
        const scaleFactor = sources.scaleFactor;

        // Use Electron's desktopCapturer to capture the screen
        const { desktopCapturer } = require('electron');

        desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: {
                width: sources.bounds.width * scaleFactor,
                height: sources.bounds.height * scaleFactor
            }
        }).then((sources: any[]) => {
            if (sources.length > 0) {
                const image = sources[0].thumbnail;

                // Crop the image to the selected area
                const croppedImage = image.crop({
                    x: Math.round(x * scaleFactor),
                    y: Math.round(y * scaleFactor),
                    width: Math.round(width * scaleFactor),
                    height: Math.round(height * scaleFactor)
                });

                // Copy to clipboard
                clipboard.writeImage(croppedImage);

                console.log('Screenshot saved to clipboard');
            }

            // Close the capture window
            if (captureWindow) {
                captureWindow.close();
            }
        }).catch((error: Error) => {
            console.error('Error capturing screen:', error);
            if (captureWindow) {
                captureWindow.close();
            }
        });
    }, 100);
}

function createHollowWindow(bounds: { x: number; y: number; width: number; height: number }) {
    const { x, y, width, height } = bounds;
    const menuHeight = 40;

    // Don't allow creating multiple hollow windows
    if (hollowWindow) {
        console.log('Hollow window already exists');
        hollowWindow.focus();
        return;
    }

    hollowWindow = new BrowserWindow({
        width: width,
        height: height + menuHeight,
        x: x,
        y: y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    hollowWindow.loadFile(path.join(__dirname, '../hollow.html'));

    hollowWindow.on('closed', () => {
        hollowWindow = null;
    });
}

app.whenReady().then(() => {
    createMainWindow();

    // Register Print Screen global shortcut
    const ret = globalShortcut.register('PrintScreen', () => {
        console.log('PrintScreen pressed - starting capture mode');
        createCaptureWindow();
    });

    if (!ret) {
        console.log('PrintScreen registration failed');
    }

    console.log('Snippy is running in the background. Press PrintScreen to capture.');
});

// Handle capture-complete event from renderer
ipcMain.on('capture-complete', (_event, bounds) => {
    console.log('Capture bounds:', bounds);
    captureScreen(bounds);
});

// Handle capture-cancel event
ipcMain.on('capture-cancel', () => {
    console.log('Capture cancelled');
    if (captureWindow) {
        captureWindow.close();
    }
});

// Handle open-window event
ipcMain.on('open-window', (_event, bounds) => {
    console.log('Opening hollow window with bounds:', bounds);
    if (captureWindow) {
        captureWindow.close();
    }
    createHollowWindow(bounds);
});

// Handle hollow-capture event
ipcMain.on('hollow-capture', (_event, bounds) => {
    console.log('Hollow window capture:', bounds);
    captureScreen(bounds);
    if (hollowWindow) {
        hollowWindow.close();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

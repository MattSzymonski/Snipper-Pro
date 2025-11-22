import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    captureComplete: (bounds: { x: number; y: number; width: number; height: number }) => {
        ipcRenderer.send('capture-complete', bounds);
    },
    captureCancel: () => {
        ipcRenderer.send('capture-cancel');
    },
    openWindow: (bounds: { x: number; y: number; width: number; height: number }) => {
        ipcRenderer.send('open-window', bounds);
    },
    hollowCapture: (bounds: { x: number; y: number; width: number; height: number }) => {
        ipcRenderer.send('hollow-capture', bounds);
    }
});

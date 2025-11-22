export { };

declare global {
    interface Window {
        electronAPI: {
            captureComplete: (bounds: { x: number; y: number; width: number; height: number }) => void;
            captureCancel: () => void;
            openWindow: (bounds: { x: number; y: number; width: number; height: number }) => void;
            hollowCapture: (bounds: { x: number; y: number; width: number; height: number }) => void;
        };
    }
}

# Snippy - Electron Snipping Tool

A lightweight snipping tool for Windows built with Electron and TypeScript.

## Features

- Runs in the background as a system tray application
- Press **PrintScreen** to activate capture mode
- Click and drag to select an area
- Automatically copies the screenshot to clipboard
- Crosshair cursor for precise selection
- ESC to cancel capture

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Build and Run
```bash
npm start
```

### Watch Mode (for development)
```bash
npm run watch
```

Then in another terminal:
```bash
npm start
```

## How to Use

1. Run the application - it will run in the background
2. Press **PrintScreen** key on your keyboard
3. The screen will dim and your cursor will change to a crosshair
4. Click and drag to select the area you want to capture
5. Release the mouse button to capture
6. The screenshot is automatically saved to your clipboard
7. Press ESC at any time to cancel

## Technical Details

- Built with Electron 28+ and TypeScript 5+
- Uses Electron's desktopCapturer API for screen capture
- Global keyboard shortcuts for PrintScreen detection
- Transparent overlay window for selection UI
- Clipboard integration for instant access to captures

## Requirements

- Node.js 18+
- Windows OS

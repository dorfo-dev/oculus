# Oculus - PDF Viewer

A modern, elegant PDF viewer built with Electron and Vue 3.

## Features

- 📁 **Directory Browser**: Select any directory and view all PDF files
- 📄 **PDF Rendering**: High-quality PDF rendering using PDF.js
- 🔍 **Zoom Controls**: Zoom in/out for better readability
- ↔️ **Page Navigation**: Easy navigation between pages
- 🔄 **Rotation**: Rotate PDF pages as needed
- ↕️ **Resizable Sidebar**: Adjust the sidebar width to your preference
- ⌨️ **Keyboard Shortcuts**: 
  - Arrow keys for page navigation
  - +/- for zoom
  - R for rotation

## Tech Stack

- **Electron** - Desktop application framework
- **Vue 3** - Reactive UI framework
- **PDF.js** - PDF rendering engine
- **Vite** - Fast build tool

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development Mode

```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron in development mode with hot-reload.

### Build

Build the Vue application:
```bash
npm run build
```

Build for Windows:
```bash
npm run electron:build:win
```

Build for Linux:
```bash
npm run electron:build:linux
```

Build for all platforms:
```bash
npm run electron:build
```

## Usage

1. Launch the application
2. Click "Selecionar Diretório" (Select Directory) button
3. Choose a folder containing PDF files
4. Click on any PDF file in the sidebar to view it
5. Use the controls at the top to navigate pages, zoom, or rotate

## Project Structure

```
oculus/
├── electron/           # Electron main process
│   ├── main.js        # Main process entry point
│   └── preload.js     # Preload script for IPC
├── src/               # Vue source files
│   ├── components/    # Vue components
│   │   ├── Sidebar.vue      # File browser sidebar
│   │   └── PdfViewer.vue    # PDF viewer component
│   ├── App.vue        # Root component
│   ├── main.js        # Vue entry point
│   └── style.css      # Global styles
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies and scripts
```

## License

MIT

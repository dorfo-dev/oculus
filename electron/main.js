const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    }
  })

  // In development, load from Vite dev server
  // In production, load from built files
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC handler to open directory dialog
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }

  return null
})

// IPC handler to read PDF files from directory
ipcMain.handle('fs:readDirectory', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath)
    const pdfFiles = []

    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      const stat = await fs.stat(fullPath)

      if (stat.isFile() && path.extname(file).toLowerCase() === '.pdf') {
        pdfFiles.push({
          name: file,
          path: fullPath,
          extension: path.extname(file)
        })
      }
    }

    return pdfFiles
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
})

// IPC handler to read PDF file as buffer
ipcMain.handle('fs:readPdfFile', async (event, filePath) => {
  try {
    const buffer = await fs.readFile(filePath)
    return {
      success: true,
      data: buffer,
      path: filePath
    }
  } catch (error) {
    console.error('Error reading PDF file:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

// Check if file exists
ipcMain.handle('fs:fileExists', async (event, filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

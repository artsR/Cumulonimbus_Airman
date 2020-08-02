const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')



let mainWindow


app.whenReady().then(() => {
    createWindow()
    mainWindow.show()
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    // Reopen the app on macOS:
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
app.on('closed', () => {
    app.quit()
})
app.allowRendererProcessReuse = false


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 640,
        show: false,
        transparent: true,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'main.html'),
            protocol: 'file:',
            slashes: true,
        })
    )
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

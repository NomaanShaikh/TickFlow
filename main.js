const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let win;
const DATA_FILE = path.join(app.getPath("userData"), "tickflow-data.json");

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 80,
    minWidth: 400,
    minHeight: 50,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "src/index.html"));
}

/* ---------- FILE SAVE ---------- */
ipcMain.handle("save-text", (_, text) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ text }), "utf-8");
  return true;
});

ipcMain.handle("load-text", () => {
  if (!fs.existsSync(DATA_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  return data.text || null;
});

/* ---------- LIFECYCLE ---------- */
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

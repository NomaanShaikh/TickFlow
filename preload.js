const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("TickFlowAPI", {
  saveState: (state) => ipcRenderer.invoke("save-text", state),
  loadState: () => ipcRenderer.invoke("load-text")
});

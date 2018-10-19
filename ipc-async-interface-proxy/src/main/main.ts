import { app as ElectronApp, BrowserWindow, ipcMain, session } from "electron";

import * as path from "path";

import { EchoService } from "./service/echoservice";

function installDevtron() {
  console.log("Installing Devtron");
  const devtron = require("devtron");
  devtron.uninstall();
  devtron.install();
  console.log("Installed Devtron");
}

function installDevtools() {
  installDevtron();
}

function onElectronReady() {
  installDevtools();
}

function isPromise(obj: any) {
    return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
}

function startService() {
  const echoService = new EchoService();
  ipcMain.on("proxy-service", (event: any, arg: any) => {
    if (arg.type === "EchoService") {
      const res = (echoService as any)[arg.method](...arg.args);
      console.log(res);
      if (isPromise(res)) {
        res.then((result: any) => {
          event.sender.send(`proxy-service-res-${arg.promiseCounter}`, {
            succeed: true,
            result,
            promiseCounter: arg.promiseCounter,
          });
        });
      } else {
        event.sender.send(`proxy-service-res-${arg.promiseCounter}`, {
          succeed: true,
          result: res,
          promiseCounter: arg.promiseCounter,
        });
      }
    }
  });
}

let mainWindow: BrowserWindow;

function startApp() {
  const options = {
    minWidth: 1280,
    minHeight: 768,
    width: 1280,
    height: 768,
    show: true,
    frame: false,
    center: true,
    backgroundColor: "#282b30",
    webPreferences: {
      nodeIntegration: true,
    },
  };
  mainWindow = new BrowserWindow(options);
  mainWindow.loadFile(path.join(__dirname, "../index/index.html"));

  mainWindow.webContents.on(
    "before-input-event",
    (event: Electron.Event, input: Electron.Input) => {
      if (input.key === "F12" && input.type === "keyDown") {
        mainWindow.webContents.openDevTools();
      }
    },
  );

  ipcMain.on("__QUIT__", () => mainWindow.close());

  startService();
}

ElectronApp.on("ready", () => {
  onElectronReady();
  startApp();
});

ElectronApp.on("window-all-closed", () => {
  ElectronApp.quit();
});

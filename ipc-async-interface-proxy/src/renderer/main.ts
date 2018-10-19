import { ipcRenderer, remote } from "electron";

import { IEchoService } from "../common/service/iechoservice";
import { createService } from "./create";

const quit = () => {
  ipcRenderer.send("__QUIT__");
};

const quitButton = document.getElementById("quit") as HTMLButtonElement;
quitButton.addEventListener("click", quit);

const { y } = window as any;

const echoService = createService<IEchoService>("EchoService");
const echo = () => {
  echoService.echo("command").then((res) => {
    console.log(res);
    const div = document.getElementById("res") as HTMLDivElement;
    div.innerText = res;
  });
};

const echo2 = () => {
    echoService.echo2("command").then((res) => {
      console.log(res);
      const div = document.getElementById("res") as HTMLDivElement;
      div.innerText = res;
    });
  };

const echoButton = document.getElementById("echo") as HTMLButtonElement;
echoButton.addEventListener("click", echo);

const echo2Button = document.getElementById("echo2") as HTMLButtonElement;
echo2Button.addEventListener("click", echo2);

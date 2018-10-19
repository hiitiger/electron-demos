import { ipcRenderer } from "electron";

type AnyFunction = (...args: any[]) => any;
// Extracts the type if wrapped by a Promise
type Unpacked<T> = T extends Promise<infer U> ? U : T;

type PromisifiedFunction<T extends AnyFunction> = T extends () => infer U
  ? () => Promise<Unpacked<U>>
  : T extends (a1: infer A1) => infer U
    ? (a1: A1) => Promise<Unpacked<U>>
    : T extends (a1: infer A1, a2: infer A2) => infer U
      ? (a1: A1, a2: A2) => Promise<Unpacked<U>>
      : T extends (a1: infer A1, a2: infer A2, a3: infer A3) => infer U
        ? (a1: A1, a2: A2, a3: A3) => Promise<Unpacked<U>>
        : T extends (...args: any[]) => infer U
          ? (...args: any[]) => Promise<Unpacked<U>>
          : T;

type Promisified<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? PromisifiedFunction<T[K]> : never
};

interface IFunctionCollection {
  [k: number]: AnyFunction;
}

let promiseCounter = 0;
const pendingPromiseCallbacks: IFunctionCollection = {};

export function createService<T>(name: string): Promisified<T> {
  const proxy = new Proxy(
    {},
    {
      get(target, key) {
        return (...args: any[]) => {
          return new Promise((resolve) => {
            promiseCounter += 1;
            pendingPromiseCallbacks[promiseCounter] = resolve;
            ipcRenderer.send("proxy-service", {
              type: name,
              method: key,
              args,
              promiseCounter,
            });

            ipcRenderer.once(
              `proxy-service-res-${promiseCounter}`,
              (event: string, arg: any) => {
                pendingPromiseCallbacks[arg.promiseCounter](arg.result);

                delete pendingPromiseCallbacks[arg.promiseCounter];
              },
            );
          });
        };
      },
    },
  );
  return proxy as Promisified<T>;
}

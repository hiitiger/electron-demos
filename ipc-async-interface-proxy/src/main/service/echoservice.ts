import { IEchoService } from "../../common/service/iechoservice";

export class EchoService implements IEchoService {
  public echo(content: string) {
    return `echo: ${content}`;
  }

  public echo2(content: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(`echo2: ${content}`);
    });
  }

  public echoMul(a: string, n: number) {
    return `echo: ${a.repeat(n)}`;
  }

}

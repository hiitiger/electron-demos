export interface IEchoService {
  echo(content: string): string;
  echo2(content: string): Promise<string>;

  echoMul(a: string, n: number): string;

}

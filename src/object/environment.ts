import { Obj } from './object';

export class Environment {
  private store = new Map<string, Obj>();

  public get(name: string) {
    return this.store.get(name);
  }

  public set(name: string, value: Obj): Obj {
    this.store.set(name, value);
    return value;
  }
}

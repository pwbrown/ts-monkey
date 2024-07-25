import { Obj } from './object';

export class Environment {
  private store = new Map<string, Obj>();

  constructor(public outer?: Environment) {};

  public get(name: string): Obj | undefined {
    let value = this.store.get(name);
    if (this.outer && typeof value === 'undefined') {
      value = this.outer.get(name);
    }
    return value;
  }

  public set(name: string, value: Obj): Obj {
    this.store.set(name, value);
    return value;
  }
}
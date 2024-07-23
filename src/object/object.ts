/** Represents a single object */
export interface Obj {
  type(): ObjType;
  inspect(): string;
}

/** All possible object types */
export enum ObjType {
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',
}

/** Integer Object */
export class IntegerObj implements Obj {
  constructor(public value: number) {}
  
  type(): ObjType {
    return ObjType.INTEGER;
  }

  inspect(): string {
    return this.value.toString();
  }
}

/** Boolean Object */
export class BooleanObj implements Obj {
  constructor(public value: boolean) {}

  type(): ObjType {
    return ObjType.BOOLEAN;
  }

  inspect(): string {
    return this.value.toString();
  }
}

/** Null Object */
export class NullObj implements Obj {
  type(): ObjType {
    return ObjType.NULL;
  }

  inspect(): string {
    return 'null';
  }
}
import { BlockStatement, Identifier } from '../ast/ast';
import { Environment } from './environment';

/** Represents a single object */
export interface Obj {
  type(): ObjType;
  inspect(): string;
}

/** All possible object types */
export enum ObjType {
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  FUNCTION = 'FUNCTION',
  RETURN_VALUE = 'RETURN_VALUE',
  ERROR = 'ERROR',
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

/** Function Object */
export class FunctionObj implements Obj {
  constructor(
    public parameters: Identifier[],
    public body: BlockStatement,
    public env: Environment,
  ) {}

  type(): ObjType {
    return ObjType.FUNCTION;
  }

  inspect(): string {
    const params = this.parameters?.map((p) => p.toString()) || [];
    const body = this.body?.toString() || '';
    return `fn(${params.join(', ')}) {\n${body}\n}`;
  }
}

/** Return Value Object */
export class ReturnValueObj implements Obj {
  constructor(public value: Obj) {}
  
  type(): ObjType {
    return ObjType.RETURN_VALUE;
  }

  inspect(): string {
    return this.value.inspect();
  }
}

/** Error Object */
export class ErrorObj implements Obj {
  constructor(public message: string) {}

  type(): ObjType {
    return ObjType.ERROR;
  }

  inspect(): string {
    return `ERROR: ${this.message}`;
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
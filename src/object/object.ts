import { BlockStatement, Identifier } from '../ast/ast';
import { Environment } from './environment';

/** Represents a single object */
export interface Obj {
  type(): ObjType;
  inspect(): string;
  clone(): Obj;
}

/** All possible object types */
export enum ObjType {
  INTEGER = 'INTEGER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  HASH = 'HASH',
  FUNCTION = 'FUNCTION',
  BUILTIN = 'BUILTIN',
  RETURN_VALUE = 'RETURN_VALUE',
  ERROR = 'ERROR',
  NULL = 'NULL',
}

/** Builtin functions */
export type BuiltinFunction = (...args: Obj[]) => Obj;

/** Integer Object */
export class IntegerObj implements Obj {
  constructor(public value: number) {}
  
  type(): ObjType {
    return ObjType.INTEGER;
  }

  inspect(): string {
    return this.value.toString();
  }

  clone(): IntegerObj {
    return new IntegerObj(this.value);
  }
}

/** String Object */
export class StringObj implements Obj {
  constructor(public value: string) {}

  type(): ObjType {
    return ObjType.STRING;
  }

  inspect(): string {
    return this.value;
  }

  clone(): StringObj {
    return new StringObj(this.value);
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

  clone(): BooleanObj {
    return new BooleanObj(this.value);
  }
}

/** Array Object */
export class ArrayObj implements Obj {
  constructor(public elements: Obj[]) {}
  
  type(): ObjType {
    return ObjType.ARRAY;
  }

  inspect(): string {
    const elements = this.elements.map((e) => e.inspect());
    return `[${elements.join(', ')}]`;
  }

  clone(): ArrayObj {
    return new ArrayObj([...this.elements.map((e) => e.clone())]);
  }
}

/** Hash Object */
export interface HashPair {
  key: Obj,
  value: Obj,
}

/** Hash Object */
export class HashObj implements Obj {
  constructor(public pairs: Map<string, HashPair>) {}

  type(): ObjType {
    return ObjType.HASH;
  }

  inspect(): string {
    const pairs: string[] = [];
    for (const { key, value } of this.pairs.values()) {
      pairs.push(`${key.inspect()}:${value.inspect()}`);
    }
    return `{${pairs.join(', ')}}`;
  }

  clone(): Obj {
    const copied = new Map<string, HashPair>();
    for (const { key, value } of this.pairs.values()) {
      copied.set(key.inspect(), { key: key.clone(), value: value.clone() });
    }
    return new HashObj(copied);
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

  clone(): FunctionObj {
    return new FunctionObj(
      [...this.parameters],
      this.body,
      this.env,
    );
  }
}

/** Builtin function object */
export class BuiltinObj implements Obj {
  constructor(public func: BuiltinFunction) {}

  type(): ObjType {
    return ObjType.BUILTIN;
  }

  inspect(): string {
    return "builtin function";
  }

  clone(): BuiltinObj {
    return new BuiltinObj(this.func);
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

  clone(): ReturnValueObj {
    return new ReturnValueObj(this.value.clone());
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

  clone(): ErrorObj {
    return new ErrorObj(this.message);
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

  clone(): NullObj {
    return new NullObj();
  }
}
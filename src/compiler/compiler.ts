import { Node } from '../ast/ast';
import { Instructions } from '../code/code';
import { Obj } from '../object/object';

/** The output of the compiler that is passed to the VM */
interface Bytecode {
  instructions: Instructions;
  constants: Obj[];
}

export class Compiler {
  constructor(
    private instructions: Instructions = new Uint8Array(),
    private constants: Obj[],
  ) {}

  /** Compile an AST node */
  public compile(node: Node): Error | null {
    return null;
  }

  public bytecode(): Bytecode {
    return {
      instructions: this.instructions,
      constants: this.constants,
    };
  }
}
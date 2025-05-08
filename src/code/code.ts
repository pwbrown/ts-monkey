export type Instructions = Uint8Array;

/** List of opcodes with the associated bytecode */
export enum Opcode {
  OpConstant = 0,
}

/** Opcode definition */
export interface Definition {
  name: string;
  operandWidths: number[];
}

/** Opcode Definitions */
export const DEFINITIONS = new Map<number, Definition>([
  /**
   * OpConstant is responsible for retrieving a constant value based on an
   * index value (the only operand)
   */
  [Opcode.OpConstant, { name: 'OpConstant', operandWidths: [2] }]
]);

/** Lookup the definition of an opcode */
export const lookup = (code: number): Definition | never => {
  const definition = DEFINITIONS.get(code);
  if (!definition) {
    throw new Error(`opcode ${code} undefined`);
  }
  return definition;
}

/** Make an instruction */
export const make = (op: number, ...operands: number[]): Uint8Array => {
  const def = DEFINITIONS.get(op);
  if (!def) {
    return new Uint8Array();
  }

  /** Start with the op code */
  let instructionLength = 1;
  /** Add each of the expected operand widths */
  for (const width of def.operandWidths) {
    instructionLength += width;
  }

  /** Initialize the instruction */
  const instruction = new Uint8Array(instructionLength);
  instruction[0] = op;

  /** Fill in operand values */
  let offset = 1;
  for (const [index, operand] of operands.entries()) {
    const width = def.operandWidths[index];
    switch (width) {
      case 2:
        instruction.set(new Uint16Array([operand]), offset);
        break;
    }
    offset += width;
  }
  return instruction;
}
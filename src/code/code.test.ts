import { Opcode, make } from './code';

describe('Code', () => {
  it('should make bytecode', () => {
    const tests: [op: Opcode, operands: number[], expected: Uint8Array][] = [
      [Opcode.OpConstant, [65534], new Uint8Array([Opcode.OpConstant, 255, 254])],
    ];

    for (const [op, operands, expected] of tests) {
      const instruction = make(op, ...operands);

      expect(instruction.byteLength).toBe(expected.byteLength);
      
      for (const [index, instruction] of expected.entries()) {
        expect(instruction).toBe(expected[index]);
      }
    }
  });
});
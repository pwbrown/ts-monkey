import {
  BooleanObj,
  ErrorObj,
  FunctionObj,
  IntegerObj,
  NullObj,
  Obj,
} from '../object/object';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { evaluate } from './evaluator';
import { Environment } from '../object/environment';

describe('Evaluator', () => {
  it('should evaluate integer expressions', () => {
    const tests: [input: string, expected: number][] = [
      ['5', 5],
      ['10', 10],
      ['-5', -5],
      ['-10', -10],
      ['5 + 5 + 5 + 5 - 10', 10],
      ['2 * 2 * 2 * 2 * 2', 32],
      ['-50 + 100 + -50', 0],
      ['5 * 2 + 10', 20],
      ['5 + 2 * 10', 25],
      ['20 + 2 * -10', 0],
      ['50 / 2 * 2 + 10', 60],
      ['2 * (5 + 10)', 30],
      ['3 * 3 * 3 + 10', 37],
      ['3 * (3 * 3) + 10', 37],
      ['(5 + 10 * 2 + 15 / 3) * 2 + -10', 50],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      testIntegerObject(evaluated, expected);
    }
  });

  it('should evaluate boolean expressions', () => {
    const tests: [input: string, expected: boolean][] = [
      ['true', true],
      ['false', false],
      ['1 < 2', true],
      ['1 > 2', false],
      ['1 < 1', false],
      ['1 > 1', false],
      ['1 == 1', true],
      ['1 != 1', false],
      ['1 == 2', false],
      ['1 != 2', true],
      ['true == true', true],
      ['false == false', true],
      ['true == false', false],
      ['true != false', true],
      ['false != true', true],
      ['(1 < 2) == true', true],
      ['(1 < 2) == false', false],
      ['(1 > 2) == true', false],
      ['(1 > 2) == false', true],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      testBooleanObject(evaluated, expected);
    }
  });

  it('should evaluate bang operator expressions', () => {
    const tests: [input: string, expected: boolean][] = [
      ['!true', false],
      ['!false', true],
      ['!5', false],
      ['!!true', true],
      ['!!false', false],
      ['!!5', true],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      testBooleanObject(evaluated, expected);
    }
  });

  it('should evaluate if else expressions', () => {
    const tests: [input: string, expected: unknown][] = [
      ['if (true) { 10 }', 10],
      ['if (false) { 10 }', null],
      ['if (1) { 10 }', 10],
      ['if (1 < 2) { 10 }', 10],
      ['if (1 > 2) { 10 }', null],
      ['if (1 > 2) { 10 } else { 20 }', 20],
      ['if (1 < 2) { 10 } else { 20 }', 10],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      if (typeof expected === 'number') {
        testIntegerObject(evaluated, expected);
      } else if (expected === null) {
        testNullObject(evaluated);
      } else {
        throw new Error('Unsupported test method');
      }
    }
  });

  it('should evaluate return statements', () => {
    const tests: [input: string, expected: number][] = [
      ['return 10;', 10],
      ['return 10; 9;', 10],
      ['return 2 * 5; 9;', 10],
      ['9; return 2 * 5; 9;', 10],
      ['if (10 > 1) { return 10; }', 10],
      [
        `
          if (10 > 1) {
            if (10 > 1) {
              return 10;
            }
            return 1;
          }
        `,
        10,
      ],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      testIntegerObject(evaluated, expected);
    }
  });

  it('should handle errors', () => {
    const tests: [input: string, expected: string][] = [
      [
        '5 + true;',
        'type mismatch: INTEGER + BOOLEAN',
      ],
      [
        '5 + true; 5;',
        'type mismatch: INTEGER + BOOLEAN',
      ],
      [
        '-true',
        'unknown operator: -BOOLEAN',
      ],
      [
        'true + false;',
        'unknown operator: BOOLEAN + BOOLEAN',
      ],
      [
        'true + false + true + false;',
        'unknown operator: BOOLEAN + BOOLEAN',
      ],
      [
        '5; true + false; 5',
        'unknown operator: BOOLEAN + BOOLEAN',
      ],
      [
        'if (10 > 1) { true + false; }',
        'unknown operator: BOOLEAN + BOOLEAN',
      ],
      [
        `
        if (10 > 1) {
          if (10 > 1) {
            return true + false;
          }
          return 1;
        }
      `,
        'unknown operator: BOOLEAN + BOOLEAN',
      ],
      ['foobar', 'identifier not found: foobar'],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      expect(evaluated).toBeInstanceOf(ErrorObj);
      if (evaluated instanceof ErrorObj) {
        expect(evaluated.message).toBe(expected);
      }
    }
  });

  it('should evaluate let statements', () => {
    const tests: [input: string, expected: number][] = [
      ['let a = 5; a;', 5],
      ['let a = 5 * 5; a;', 25],
      ['let a = 5; let b = a; b;', 5],
      ['let a = 5; let b = a; let c = a + b + 5; c;', 15],
    ];

    for (const [input, expected] of tests) {
      testIntegerObject(testEval(input), expected);
    }
  });

  it('should evaluate functions', () => {
    const input = 'fn(x) { x + 2; };';

    const evaluated = testEval(input);
    const func = testFunctionObject(evaluated);
    expect(func.parameters).toHaveLength(1);
    expect(func.body?.toString()).toBe('(x + 2)');
  });

  it('should evaluate function applications', () => {
    const tests: [input: string, expected: number][] = [
      ['let identity = fn(x) { x; }; identity(5);', 5],
      ['let identity = fn(x) { return x; }; identity(5);', 5],
      ['let double = fn(x) { x * 2; }; double(5);', 10],
      ['let add = fn(x, y) { x + y; }; add(5, 5);', 10],
      ['let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));', 20],
      ['fn(x) { x; }(5)', 5],
    ];

    for (const [input, expected] of tests) {
      testIntegerObject(testEval(input), expected);
    }
  });

  it('should evaluate enclosing environments', () => {
    const input = `
      let first = 10;
      let second = 10;
      let third = 10;

      let ourFunction = fn(first) {
        let second = 20;

        first + second + third;
      };

      ourFunction(20) + first + second;
    `;

    testIntegerObject(testEval(input), 70);
  });

  it('should evaluate function closures', () => {
    const input = `
      let newAdder = fn(x) {
        return fn(y) { x + y };
      };

      let addTwo = newAdder(2);
      addTwo(2);
    `;

    testIntegerObject(testEval(input), 4);
  });
});

/** Test evaluating a program and returning the object */
const testEval = (input: string): Obj | null => {
  const lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();
  const env = new Environment();
  return evaluate(program, env);
}

/** Test an integer object */
const testIntegerObject = (obj: Obj | null, expected: number) => {
  expect(obj).toBeInstanceOf(IntegerObj);
  if (obj instanceof IntegerObj) {
    expect(obj.value).toBe(expected);
  }
}

/** Test a boolean object */
const testBooleanObject = (obj: Obj | null, expected: boolean) => {
  expect(obj).toBeInstanceOf(BooleanObj);
  if (obj instanceof BooleanObj) {
    expect(obj.value).toBe(expected);
  }
}

/** Test a function object */
const testFunctionObject = (obj: Obj | null): FunctionObj => {
  expect(obj).toBeInstanceOf(FunctionObj);
  return obj as FunctionObj;
}

/** Test null object */
const testNullObject = (obj: Obj | null) => {
  expect(obj).toBeInstanceOf(NullObj);
}
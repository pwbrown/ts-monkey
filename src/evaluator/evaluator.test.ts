import {
  ArrayObj,
  BooleanObj,
  ErrorObj,
  FunctionObj,
  HashObj,
  IntegerObj,
  NullObj,
  Obj,
  QuoteObj,
  StringObj,
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
      testObject(testEval(input), expected);
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
      testObject(testEval(input), expected);
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
      testObject(testEval(input), expected);
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
      testObject(testEval(input), expected);
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
      testObject(testEval(input), expected);
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
        '"Hello" - "World!"',
        'unknown operator: STRING - STRING',
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
      ['{"name": "Monkey"}[fn(x) { x }];', 'unusable as hash key: FUNCTION'],
      ['999[1]', 'index operator not supported: INTEGER'],
    ];

    for (const [input, expected] of tests) {
      const evaluated = testEval(input);
      expect(evaluated).toBeInstanceOf(ErrorObj);
      testObject(evaluated, expected);
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
      testObject(testEval(input), expected);
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
      testObject(testEval(input), expected);
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

    testObject(testEval(input), 70);
  });

  it('should evaluate function closures', () => {
    const input = `
      let newAdder = fn(x) {
        return fn(y) { x + y };
      };

      let addTwo = newAdder(2);
      addTwo(2);
    `;

    testObject(testEval(input), 4);
  });

  it('should evaluate strings', () => {
    const input = `"hello world!"`;

    testObject(testEval(input), 'hello world!');
  });

  it('should concatenate strings', () => {
    const input = `"Hello" + " " + "World!"`;

    testObject(testEval(input), 'Hello World!');
  });

  it('should evaluate builtin functions', () => {
    let logHits = 0;
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {
      logHits += 1;
    });
    const tests: [input: string, expected: unknown][] = [
      [`len("")`, 0],
      [`len("four")`, 4],
      [`len("hello world")`, 11],
      [`len(1)`, 'argument to `len` not supported, got INTEGER'],
      [`len("one", "two")`, 'wrong number of arguments. got=2, want=1'],
      [`len([1, 2, 3])`, 3],
      [`len([])`, 0],
      [`puts("hello", "world!")`, null],
      [`first([1, 2, 3])`, 1],
      [`first([])`, null],
      [`first(1)`, 'argument to `first` must be ARRAY, got INTEGER'],
      [`last([1, 2, 3])`, 3],
      [`last([])`, null],
      [`last(1)`, 'argument to `last` must be ARRAY, got INTEGER'],
      [`rest([1, 2, 3])`, [2, 3]],
      [`rest([])`, null],
      [`push([], 1)`, [1]],
      [`push(1, 1)`, 'argument to `push` must be ARRAY, got INTEGER'],
    ];

    for (const [input, expected] of tests) {
      testObject(testEval(input), expected);
    }

    expect(logHits).toBe(2);
    spy.mockRestore();
  });

  it('should evaluate array literals', () => {
    const input = `[1, 2 * 2, 3 + 3]`;

    testObject(testEval(input), [1, 4, 6]);
  });

  it('should evaluate array index expressions', () => {
    const tests: [input: string, expected: unknown][] = [
      ['[1, 2, 3][0]', 1],
      ['[1, 2, 3][1]', 2],
      ['[1, 2, 3][2]', 3],
      ['let i = 0; [1][i];', 1],
      ['[1, 2, 3][1 + 1];', 3],
      ['let myArray = [1, 2, 3]; myArray[2];', 3],
      ['let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];', 6],
      ['let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]', 2],
      ['[1, 2, 3][3]', null],
      ['[1, 2, 3][-1]', null],
    ];

    for (const [input, expected] of tests) {
      testObject(testEval(input), expected);
    }
  });

  it('should evaluate hash literals', () => {
    const input = `
      let two = "two";
      {
        "one": 10 - 9,
        two: 1 + 1,
        "thr" + "ee": 6 / 2,
        4: 4,
        true: 5,
        false: 6
      }
    `;
    testHashObject(testEval(input), {
      'one': { key: 'one', value: 1 },
      'two': { key: 'two', value: 2 },
      'three': { key: 'three', value: 3 },
      '4': { key: 4, value: 4 },
      'true': { key: true, value: 5 },
      'false': { key: false, value: 6 },
    });
  });

  it('should evaluate hash index expressions', () => {
    const tests: [input: string, expected: unknown][] = [
      ['{"foo": 5}["foo"]', 5],
      ['{"foo": 5}["bar"]', null],
      ['let key = "foo"; {"foo": 5}[key]', 5],
      ['{}["foo"]', null],
      ['{5: 5}[5]', 5],
      ['{true: 5}[true]', 5],
      ['{false: 5}[false]', 5],
    ];

    for (const [input, expected] of tests) {
      testObject(testEval(input), expected);
    }
  });

  it('should evaluate quote expressions', () => {
    const tests: [input: string, expected: string][] = [
      ['quote(5)', '5'],
      ['quote(5 + 8)', '(5 + 8)'],
      ['quote(foobar)', 'foobar'],
      ['quote(foobar + barfoo)', '(foobar + barfoo)'],
    ];

    for (const [input, expected] of tests) {
      testQuoteObject(testEval(input), expected);
    }
  });

  it('should evaluate quote/unquote expressions', () => {
    const tests: [input: string, expected: string][] = [
      [
        'quote(unquote(4))',
        '4',
      ],
      [
        'quote(unquote(4 + 4))',
        '8',
      ],
      [
        'quote(8 + unquote(4 + 4))',
        '(8 + 8)',
      ],
      [
        'quote(unquote(4 + 4) + 8)',
        '(8 + 8)',
      ],
      [
        `
          let foobar = 8;
          quote(foobar)
        `,
        'foobar',
      ],
      [
        `
          let foobar = 8;
          quote(unquote(foobar))
        `,
        '8',
      ],
      [
        'quote(unquote(true))',
        'true',
      ],
      [
        'quote(unquote(true == false))',
        'false',
      ],
      [
        'quote(unquote(quote(4 + 4)))',
        '(4 + 4)',
      ],
      [
        `
          let quotedInfixExpression = quote(4 + 4);
          quote(unquote(4 + 4) + unquote(quotedInfixExpression))
        `,
        '(8 + (4 + 4))',
      ],
    ];

    for (const [input, expected] of tests) {
      testQuoteObject(testEval(input), expected);
    }
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

/** Test a string object */
const testStringObject = (obj: Obj | null, expected: string) => {
  expect(obj).toBeInstanceOf(StringObj);
  if (obj instanceof StringObj) {
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

/** Test an array object */
const testArrayObject = (obj: Obj | null, expected: unknown[]) => {
  expect(obj).toBeInstanceOf(ArrayObj);
  if (obj instanceof ArrayObj) {
    expect(obj.elements).toHaveLength(expected.length);
    expected.forEach((exp, i) => {
      testObject(obj.elements[i], exp);
    });
  }
};

interface ExpectedHash {
  [key: string]: {
    key: unknown,
    value: unknown
  };
}

/** Test a hash object */
const testHashObject = (obj: Obj | null, expected: ExpectedHash) => {
  expect(obj).toBeInstanceOf(HashObj);
  if (obj instanceof HashObj) {
    for (const [expKey, expValue] of Object.entries(expected)) {
      const value = obj.pairs.get(expKey);
      expect(value).not.toBeUndefined();
      if (value) {
        testObject(value.key, expValue.key);
        testObject(value.value, expValue.value);
      }
    }
  }
}

/** Test a quote object */
const testQuoteObject = (obj: Obj | null, expected: string) => {
  expect(obj).toBeInstanceOf(QuoteObj);
  if (obj instanceof QuoteObj) {
    expect(obj.node).not.toBeNull();
    expect(obj.node!.toString()).toBe(expected);
  }
}

/** Test an object of unknown type */
const testObject = (obj: Obj | null, expected: unknown) => {
  if (typeof expected === 'number') {
    testIntegerObject(obj, expected);
  } else if (typeof expected === 'string') {
    if (obj instanceof ErrorObj) {
      expect(obj.message).toBe(expected);
    } else {
      testStringObject(obj, expected);
    }
  } else if (typeof expected === 'boolean') {
    testBooleanObject(obj, expected);
  } else if (expected === null) {
    testNullObject(obj);
  } else if (Array.isArray(expected)) {
    testArrayObject(obj, expected);
  } else {
    throw new Error('Unsupported expected type');
  }
}

/** Test null object */
const testNullObject = (obj: Obj | null) => {
  expect(obj).toBeInstanceOf(NullObj);
}
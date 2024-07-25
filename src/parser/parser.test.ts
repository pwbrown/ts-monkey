import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import { 
  ArrayLiteral,
  BlockStatement,
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
  StringLiteral,
} from '../ast/ast';

describe('Parser', () => {
  it('should parse let statements', () => {
    const tests: [input: string, identifier: string, value: unknown][] = [
      ['let x = 5;', 'x', 5],
      ['let y = true;', 'y', true],
      ['let foobar = y;', 'foobar', 'y'],
    ];

    for (const [input, identifier, value] of tests) {
      const program = parseAndTestInput(input, 1);

      const statement = testLetStatement(program.statements[0], identifier);
      testLiteralExpression(statement.value, value);
    }
  });

  it('should parse return statements', () => {
    const tests: [input: string, value: unknown][] = [
      ['return 5;', 5],
      ['return true;', true],
      ['return foobar;', 'foobar'],
    ];

    for (const [input, value] of tests) {
      const program = parseAndTestInput(input, 1);
      const statement = testReturnStatement(program.statements[0]);
      testLiteralExpression(statement.returnValue, value);
    }
  });

  it('should parse an identifier expression', () => {
    const input = `
      foobar;
    `;

    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    testIdentifier(statement.expression, 'foobar');
  });

  it('should parse an integer literal expression', () => {
    const input = `
      5;
    `;

    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    testIntegerLiteral(statement.expression, 5);
  });

  it('should parse prefix expressions', () => {
    const tests: [input: string, operator: string, right: unknown][] = [
      ['!5;', '!', 5],
      ['-15;', '-', 15],
      ['!foobar;', '!', 'foobar'],
      ['-foobar;', '-', 'foobar'],
      ['!true;', '!', true],
      ['!false;', '!', false],
    ];

    for (const [input, operator, right] of tests) {
      const program = parseAndTestInput(input, 1);
      const statement = testExpressionStatement(program.statements[0]);
      testPrefixExpression(statement.expression, operator, right);
    }
  });

  it('should parse infix expressions', () => {
    const tests: [input: string, left: unknown, operator: string, right: unknown][] = [
      ['5 + 5;', 5, '+', 5],
      ['5 - 5;', 5, '-', 5],
      ['5 * 5;', 5, '*', 5],
      ['5 / 5;', 5, '/', 5],
      ['5 > 5;', 5, '>', 5],
      ['5 < 5;', 5, '<', 5],
      ['5 == 5;', 5, '==', 5],
      ['5 != 5;', 5, '!=', 5],
      ['foobar + barfoo;', 'foobar', '+', 'barfoo'],
      ['foobar - barfoo;', 'foobar', '-', 'barfoo'],
      ['foobar * barfoo;', 'foobar', '*', 'barfoo'],
      ['foobar / barfoo;', 'foobar', '/', 'barfoo'],
      ['foobar > barfoo;', 'foobar', '>', 'barfoo'],
      ['foobar < barfoo;', 'foobar', '<', 'barfoo'],
      ['foobar == barfoo;', 'foobar', '==', 'barfoo'],
      ['foobar != barfoo;', 'foobar', '!=', 'barfoo'],
      ['true == true', true, '==', true],
      ['true != false', true, '!=', false],
      ['false == false', false, '==', false],
    ];

    for (const [input, left, operator, right] of tests) {
      const program = parseAndTestInput(input, 1);
      const statement = testExpressionStatement(program.statements[0]);
      testInfixExpression(statement.expression, left, operator, right);
    }
  });

  it('should correctly handle operator precedence parsing', () => {
    const tests: [input: string, expected: string][] = [
      [
        "-a * b",
        "((-a) * b)",
      ],
      [
        "!-a",
        "(!(-a))",
      ],
      [
        "a + b + c",
        "((a + b) + c)",
      ],
      [
        "a + b - c",
        "((a + b) - c)",
      ],
      [
        "a * b * c",
        "((a * b) * c)",
      ],
      [
        "a * b / c",
        "((a * b) / c)",
      ],
      [
        "a + b / c",
        "(a + (b / c))",
      ],
      [
        "a + b * c + d / e - f",
        "(((a + (b * c)) + (d / e)) - f)",
      ],
      [
        "3 + 4; -5 * 5",
        "(3 + 4)((-5) * 5)",
      ],
      [
        "5 > 4 == 3 < 4",
        "((5 > 4) == (3 < 4))",
      ],
      [
        "5 < 4 != 3 > 4",
        "((5 < 4) != (3 > 4))",
      ],
      [
        "3 + 4 * 5 == 3 * 1 + 4 * 5",
        "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
      ],
      [
        "true",
        "true",
      ],
      [
        "false",
        "false",
      ],
      [
        "3 > 5 == false",
        "((3 > 5) == false)",
      ],
      [
        "3 < 5 == true",
        "((3 < 5) == true)",
      ],
      [
        "1 + (2 + 3) + 4",
        "((1 + (2 + 3)) + 4)",
      ],
      [
        "(5 + 5) * 2",
        "((5 + 5) * 2)",
      ],
      [
        "2 / (5 + 5)",
        "(2 / (5 + 5))",
      ],
      [
        "(5 + 5) * 2 * (5 + 5)",
        "(((5 + 5) * 2) * (5 + 5))",
      ],
      [
        "-(5 + 5)",
        "(-(5 + 5))",
      ],
      [
        "!(true == true)",
        "(!(true == true))",
      ],
      [
        "a + add(b * c) + d",
        "((a + add((b * c))) + d)",
      ],
      [
        "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
        "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
      ],
      [
        "add(a + b + c * d / f + g)",
        "add((((a + b) + ((c * d) / f)) + g))",
      ],
      [
        "a * [1, 2, 3, 4][b * c] * d",
        "((a * ([1, 2, 3, 4][(b * c)])) * d)",
      ],
      [
        "add(a * b[2], b[1], 2 * [1, 2][1])",
        "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
      ],
    ];
  
    for (const [input, expected] of tests) {
      const program = parseAndTestInput(input);
  
      expect(program.toString()).toBe(expected);
    }
  });

  it('should parse boolean expressions', () => {
    const tests: [input: string, expected: boolean][] = [
      ['true;', true],
      ['false;', false],
    ];

    for (const [input, expected] of tests) {
      const program = parseAndTestInput(input, 1);
      const statement = testExpressionStatement(program.statements[0]);      
      testBooleanLiteral(statement.expression, expected);
    }
  });

  it('should parse if expressions', () => {
    const input = 'if (x < y) { x }';

    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    const ifExpression = testIfExpression(statement.expression);
    testInfixExpression(ifExpression.condition, 'x', '<', 'y');
    const consequence = testBlockStatement(ifExpression.consequence, 1);
    const consequenceStatement = testExpressionStatement(consequence.statements[0]);
    testLiteralExpression(consequenceStatement.expression, 'x');
    expect(ifExpression.alternative).toBeNull();
  });

  it('should parse if else expressions', () => {
    const input = 'if (x < y) { x } else { y }';

    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    const ifExpression = testIfExpression(statement.expression);
    testInfixExpression(ifExpression.condition, 'x', '<', 'y');
    const consequence = testBlockStatement(ifExpression.consequence, 1);
    const consequenceStatement = testExpressionStatement(consequence.statements[0]);
    testLiteralExpression(consequenceStatement.expression, 'x');
    const alternative = testBlockStatement(ifExpression.alternative, 1);
    const alternativeStatement = testExpressionStatement(alternative.statements[0]);
    testLiteralExpression(alternativeStatement.expression, 'y');
  });

  it('should parse a function literal expression', () => {
    const input = 'fn(x, y) { x + y; }';

    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    const fnExpression = testFunctionLiteral(statement.expression);
    expect(fnExpression.parameters).not.toBeNull();
    const parameters = fnExpression.parameters!;
    expect(parameters).toHaveLength(2);
    testLiteralExpression(parameters[0], 'x');
    testLiteralExpression(parameters[1], 'y');
    const body = testBlockStatement(fnExpression.body, 1);
    const bodyStatement = testExpressionStatement(body.statements[0]);
    testInfixExpression(bodyStatement.expression, 'x', '+', 'y');
  });

  it('should parse function parameters', () => {
    const tests: [input: string, params: string[]][] = [
      ['fn() {};', []],
      ['fn(x) {};', ['x']],
      ['fn(x, y, z) {};', ['x', 'y', 'z']],
    ];

    for (const [input, params] of tests) {
      const program = parseAndTestInput(input, 1);
      const statement = testExpressionStatement(program.statements[0]);
      const fnExpression = testFunctionLiteral(statement.expression);
      expect(fnExpression.parameters).not.toBeNull();
      const parameters = fnExpression.parameters!;
      expect(parameters).toHaveLength(params.length);
      for (const [i, param] of params.entries()) {
        testLiteralExpression(parameters[i], param);
      }
    }
  });

  it('should parse a call expression', () => {
    const input = 'add(1, 2 * 3, 4 + 5);';

    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    const callExpression = testCallExpression(statement.expression);
    testIdentifier(callExpression.func, 'add');
    expect(callExpression.args).not.toBeNull();
    const args = callExpression.args!;
    expect(args).toHaveLength(3);
    
    testLiteralExpression(args[0], 1);
    testInfixExpression(args[1], 2, '*', 3);
    testInfixExpression(args[2], 4, '+', 5);
  });

  it('should parse call expression parameters', () => {
    const tests: [input: string, ident: string, args: string[]][] = [
      ['add();', 'add', []],
      ['add(1);', 'add', ['1']],
      ['add(1, 2 * 3, 4 + 5);', 'add', ['1', '(2 * 3)', '(4 + 5)']],
    ];

    for (const [input, ident, expectedArgs] of tests) {
      const program = parseAndTestInput(input, 1);
      const statement = testExpressionStatement(program.statements[0]);
      const call = testCallExpression(statement.expression);
      testIdentifier(call.func, ident);
      expect(call.args).not.toBeNull();
      const args = call.args!;
      expect(args).toHaveLength(expectedArgs.length);

      for (const [i, expArg] of expectedArgs.entries()) {
        expect(args[i].toString()).toBe(expArg);
      }
    }
  });

  it('should parse a string literal expression', () => {
    const input = `"hello world";`;
    
    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    testStringLiteral(statement.expression, 'hello world');
  });

  it('should parse empty array literal expressions', () => {
    const input = `[]`;
    
    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    testArrayLiteral(statement.expression, 0);
  });

  it('should parse array literal expressions', () => {
    const input = `[1, 2 * 2, 3 + 3]`;
    
    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    const arr = testArrayLiteral(statement.expression, 3);
    const elements = arr.elements!;
    testIntegerLiteral(elements[0], 1);
    testInfixExpression(elements[1], 2, '*', 2);
    testInfixExpression(elements[2], 3, '+', 3);
  });

  it('should parse an array index expression', () => {
    const input = `myArray[1 + 1]`;
    
    const program = parseAndTestInput(input, 1);
    const statement = testExpressionStatement(program.statements[0]);
    const exp = testIndexExpression(statement.expression);
    testIdentifier(exp.left, 'myArray');
    testInfixExpression(exp.index, 1, '+', 1);
  });
});

/** Parse input code into a program, check for errors, and check for statement count */
const parseAndTestInput = (input: string, expectedStatements?: number) => {
  /** Parse input into program */
  const lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();
  
  /** Check for parser errors */
  const errors = parser.getErrors();
  if (errors.length > 0) {
    throw new Error([
      `Parser has ${errors.length} error(s)`,
      ...errors.map((e) => `parser error: ${e}`)
    ].join('\n'));
  }

  /** Validate parser statement length */
  if (typeof expectedStatements === 'number') {
    expect(program.statements).toHaveLength(expectedStatements);
  }

  return program;
}

/** Test a let statement */
const testLetStatement = (statement: Statement, name: string): LetStatement => {
  expect(statement.tokenLiteral()).toBe('let');
  expect(statement).toBeInstanceOf(LetStatement);
  if (statement instanceof LetStatement) {
    expect(statement.name.value).toBe(name);
    expect(statement.name.tokenLiteral()).toBe(name);
  }
  return statement as LetStatement;
}

/** Test Return Statement */
const testReturnStatement = (statement: Statement): ReturnStatement => {
  expect(statement).toBeInstanceOf(ReturnStatement);
  if (statement instanceof ReturnStatement) {
    expect(statement.tokenLiteral()).toBe('return');
  }
  return statement as ReturnStatement;
}

/** Test an expression statement */
const testExpressionStatement = (statement: Statement): ExpressionStatement => {
  expect(statement).toBeInstanceOf(ExpressionStatement);
  return statement as ExpressionStatement;
}

/** Test block statement */
const testBlockStatement = (statement: Statement | null | undefined, expectedStatements?: number): BlockStatement => {
  expect(statement).toBeInstanceOf(BlockStatement);
  if (typeof expectedStatements === 'number' && statement instanceof BlockStatement) {
    expect(statement.statements).toHaveLength(expectedStatements);
  }
  return statement as BlockStatement;
}

/** Test an integer literal expression */
const testIntegerLiteral = (exp: Expression | null | undefined, value: number) => {
  expect(exp).toBeInstanceOf(IntegerLiteral);
  if (exp instanceof IntegerLiteral) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(value.toString());
  }
}

/** Test array literal expression */
const testArrayLiteral = (exp: Expression | null | undefined, expectedElements?: number): ArrayLiteral => {
  expect(exp).toBeInstanceOf(ArrayLiteral);
  if (typeof expectedElements === 'number' && exp instanceof ArrayLiteral) {
    expect(exp.elements || []).toHaveLength(expectedElements);
  }
  return exp as ArrayLiteral;
}

/** Test an array index expression */
const testIndexExpression = (exp: Expression | null | undefined): IndexExpression => {
  expect(exp).toBeInstanceOf(IndexExpression);
  return exp as IndexExpression;
}

/** Test string literal expression */
const testStringLiteral = (exp: Expression | null | undefined, value: string) => {
  expect(exp).toBeInstanceOf(StringLiteral);
  if (exp instanceof StringLiteral) {
    expect(exp.value).toBe(value);
  }
}

/** Test an identifier expression */
const testIdentifier = (exp: Expression | null | undefined, value: string) => {
  expect(exp).toBeInstanceOf(Identifier);
  if (exp instanceof Identifier) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(value);
  }
}

/** Test a boolean literal */
const testBooleanLiteral = (exp: Expression | null | undefined, value: boolean) => {
  expect(exp).toBeInstanceOf(BooleanLiteral);
  if (exp instanceof BooleanLiteral) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(value.toString());
  }
}

/** Test any literal expression */
const testLiteralExpression = (exp: Expression | null | undefined, expected: unknown) => {
  switch(typeof expected) {
    case 'number':
      return testIntegerLiteral(exp, expected);
    case 'string':
      return testIdentifier(exp, expected);
    case 'boolean':
      return testBooleanLiteral(exp, expected);
  }
  throw new Error('type of exp not handled');
}

/** Test a prefix expression */
const testPrefixExpression = (exp: Expression | null | undefined, operator: string, right: unknown) => {
  expect(exp).toBeInstanceOf(PrefixExpression);
  if (exp instanceof PrefixExpression) {
    expect(exp.operator).toBe(operator);
    testLiteralExpression(exp.right, right);
  }
};

/** Test an infix expression */
const testInfixExpression = (exp: Expression | null | undefined, left: unknown, operator: string, right: unknown) => {
  expect(exp).toBeInstanceOf(InfixExpression);
  if (exp instanceof InfixExpression) {
    testLiteralExpression(exp.left, left);
    expect(exp.operator).toBe(operator);
    testLiteralExpression(exp.right, right);
  }
}

/** Test an if expression */
const testIfExpression = (exp: Expression | null | undefined): IfExpression => {
  expect(exp).toBeInstanceOf(IfExpression);
  return exp as IfExpression;
}

/** Test a function literal expression */
const testFunctionLiteral = (exp: Expression | null | undefined): FunctionLiteral => {
  expect(exp).toBeInstanceOf(FunctionLiteral);
  return exp as FunctionLiteral;
}

/** Test a call expression */
const testCallExpression = (exp: Expression | null | undefined): CallExpression => {
  expect(exp).toBeInstanceOf(CallExpression);
  return exp as CallExpression;
}

import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import { Expression, ExpressionStatement, Identifier, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, ReturnStatement, Statement } from '../ast/ast';

describe('Parser', () => {
  it('should parse let statements', () => {
    const input = `
      let x = 5;
      let y = 10;
      let foobar = 838383;
    `;

    const lexer = Lexer.new(input);
    const parser = Parser.new(lexer);
    
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program).toBeDefined();
    expect(program.statements).toHaveLength(3);

    const tests: { expectedIdentifier: string }[] = [
      { expectedIdentifier: 'x' },
      { expectedIdentifier: 'y' },
      { expectedIdentifier: 'foobar' },
    ];

    for (const [i, test] of tests.entries()) {
      testLetStatement(program.statements[i], test.expectedIdentifier);
    }
  });

  it('should parse return statements', () => {
    const input = `
      return 5;
      return 10;
      return 993322;
    `;

    const lexer = Lexer.new(input);
    const parser = Parser.new(lexer);
    
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program).toBeDefined();
    expect(program.statements).toHaveLength(3);

    for (const statement of program.statements) {
      expect(statement).toBeInstanceOf(ReturnStatement);
      if (statement instanceof ReturnStatement) {
        expect(statement.tokenLiteral()).toBe('return');
      }
    }
  });

  it('should parse an identifier expression', () => {
    const input = `
      foobar;
    `;

    const lexer = Lexer.new(input);
    const parser = Parser.new(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program).toBeDefined();
    expect(program.statements).toHaveLength(1);

    const statement = program.statements[0];
    expect(statement).toBeInstanceOf(ExpressionStatement);
    if (statement instanceof ExpressionStatement) {
      expect(statement.expression).toBeInstanceOf(Identifier);
      if (statement.expression instanceof Identifier) {
        expect(statement.expression.value).toBe('foobar');
        expect(statement.expression.tokenLiteral()).toBe('foobar');
      }
    }
  });

  it('should parse an integer literal expression', () => {
    const input = `
      5;
    `;

    const lexer = Lexer.new(input);
    const parser = Parser.new(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program).toBeDefined();
    expect(program.statements).toHaveLength(1);

    const statement = program.statements[0];
    expect(statement).toBeInstanceOf(ExpressionStatement);
    if (statement instanceof ExpressionStatement) {
      testIntegerLiteral(statement.expression, 5);
    }
  });

  it('should parse prefix expressions', () => {
    const tests: [input: string, operator: string, value: number][] = [
      ['!5;', '!', 5],
      ['-15;', '-', 15],
    ];

    for (const [input, operator, value] of tests) {
      const lexer = Lexer.new(input);
      const parser = Parser.new(lexer);
  
      const program = parser.parseProgram();
      checkParserErrors(parser);
      expect(program).toBeDefined();
      expect(program.statements).toHaveLength(1);
  
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(ExpressionStatement);
      if (statement instanceof ExpressionStatement) {
        const expression = statement.expression;
        expect(expression).toBeInstanceOf(PrefixExpression);
        if (expression instanceof PrefixExpression) {
          expect(expression.operator).toBe(operator);
          testIntegerLiteral(expression.right, value);
        }
      }
    }
  });

  it('should parse infix expressions', () => {
    const tests: [input: string, left: number, operator: string, right: number][] = [
      ['5 + 5;', 5, '+', 5],
      ['5 - 5;', 5, '-', 5],
      ['5 * 5;', 5, '*', 5],
      ['5 / 5;', 5, '/', 5],
      ['5 > 5;', 5, '>', 5],
      ['5 < 5;', 5, '<', 5],
      ['5 == 5;', 5, '==', 5],
      ['5 != 5;', 5, '!=', 5],
    ];

    for (const [input, left, operator, right] of tests) {
      const lexer = Lexer.new(input);
      const parser = Parser.new(lexer);
  
      const program = parser.parseProgram();
      checkParserErrors(parser);
      expect(program).toBeDefined();
      expect(program.statements).toHaveLength(1);
  
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(ExpressionStatement);
      if (statement instanceof ExpressionStatement) {
        const expression = statement.expression;
        expect(expression).toBeInstanceOf(InfixExpression);
        if (expression instanceof InfixExpression) {
          testIntegerLiteral(expression.left, left);
          expect(expression.operator).toBe(operator);
          testIntegerLiteral(expression.right, right);
        }
      }
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
      // [
      //   "true",
      //   "true",
      // ],
      // [
      //   "false",
      //   "false",
      // ],
      // [
      //   "3 > 5 == false",
      //   "((3 > 5) == false)",
      // ],
      // [
      //   "3 < 5 == true",
      //   "((3 < 5) == true)",
      // ],
      // [
      //   "1 + (2 + 3) + 4",
      //   "((1 + (2 + 3)) + 4)",
      // ],
      // [
      //   "(5 + 5) * 2",
      //   "((5 + 5) * 2)",
      // ],
      // [
      //   "2 / (5 + 5)",
      //   "(2 / (5 + 5))",
      // ],
      // [
      //   "(5 + 5) * 2 * (5 + 5)",
      //   "(((5 + 5) * 2) * (5 + 5))",
      // ],
      // [
      //   "-(5 + 5)",
      //   "(-(5 + 5))",
      // ],
      // [
      //   "!(true == true)",
      //   "(!(true == true))",
      // ],
      // [
      //   "a + add(b * c) + d",
      //   "((a + add((b * c))) + d)",
      // ],
      // [
      //   "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
      //   "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
      // ],
      // [
      //   "add(a + b + c * d / f + g)",
      //   "add((((a + b) + ((c * d) / f)) + g))",
      // ],
    ];
  
    for (const [input, expected] of tests) {
      const lexer = Lexer.new(input);
      const parser =  Parser.new(lexer);
      const program = parser.parseProgram();
      checkParserErrors(parser);
  
      expect(program.toString()).toBe(expected);
    }
  });
});

/** Test a let statement */
const testLetStatement = (statement: Statement, name: string) => {
  expect(statement.tokenLiteral()).toBe('let');
  expect(statement).toBeInstanceOf(LetStatement);
  if (statement instanceof LetStatement) {
    expect(statement.name.value).toBe(name);
    expect(statement.name.tokenLiteral()).toBe(name);
  }
}

/** Test an integer literal expression */
const testIntegerLiteral = (exp: Expression | null | undefined, value: number) => {
  expect(exp).toBeInstanceOf(IntegerLiteral);
  if (exp instanceof IntegerLiteral) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(value.toString());
  }
}

const checkParserErrors = (parser: Parser) => {
  const errors = parser.getErrors();
  if (errors.length === 0) {
    return;
  }

  throw new Error([
    `Parser has ${errors.length} error(s)`,
    ...errors.map((e) => `parser error: ${e}`)
  ].join('\n'));
}
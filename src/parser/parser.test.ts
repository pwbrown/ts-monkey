import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import { LetStatement, Statement } from '../ast/ast';

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
});

const testLetStatement = (statement: Statement, name: string) => {
  expect(statement.tokenLiteral()).toBe('let');
  expect(statement).toBeInstanceOf(LetStatement);
  if (statement instanceof LetStatement) {
    expect(statement.name.value).toBe(name);
    expect(statement.name.tokenLiteral()).toBe(name);
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
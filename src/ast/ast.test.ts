import { Identifier, LetStatement, Program } from './ast';
import { TokenType } from '../token/token';

describe('AST', () => {
  it('should print a string representation of a program', () => {
    const program = new Program([
      new LetStatement(
        { type: TokenType.LET, literal: 'let' },
        new Identifier(
          { type: TokenType.IDENT, literal: 'myVar' },
          'myVar',
        ),
        new Identifier(
          { type: TokenType.IDENT, literal: 'anotherVar' },
          'anotherVar',
        ),
      )
    ]);
    expect(program.toString()).toBe('let myVar = anotherVar;');
  });
})
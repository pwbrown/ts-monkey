import { Lexer } from './lexer';
import { TokenType } from '../token/token';

describe('Lexer', () => {
  it('should read the next character', () => {
    const input = `
      let five = 5;
      let ten = 10;

      let add = fn(x, y) {
        x + y;
      };

      let result = add(five, ten);

      !-/*5;
      5 < 10 > 5;

      if (5 < 10) {
        return true;
      } else {
        return false;
      }
      
      10 == 10;
      10 != 9;
      "foobar"
      "foo bar"
      [1, 2];
      {"foo": "bar"}
      macro(x, y) { x + y; };
    `;

    const tests: [expectedType: TokenType, expectedLiteral: string][] = [
      [TokenType.LET, 'let'],
      [TokenType.IDENT, 'five'],
      [TokenType.ASSIGN, '='],
      [TokenType.INT, '5'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.LET, 'let'],
      [TokenType.IDENT, 'ten'],
      [TokenType.ASSIGN, '='],
      [TokenType.INT, '10'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.LET, 'let'],
      [TokenType.IDENT, 'add'],
      [TokenType.ASSIGN, '='],
      [TokenType.FUNCTION, 'fn'],
      [TokenType.LPAREN, '('],
      [TokenType.IDENT, 'x'],
      [TokenType.COMMA, ','],
      [TokenType.IDENT, 'y'],
      [TokenType.RPAREN, ')'],
      [TokenType.LBRACE, '{'],
      [TokenType.IDENT, 'x'],
      [TokenType.PLUS, '+'],
      [TokenType.IDENT, 'y'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.RBRACE, '}'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.LET, 'let'],
      [TokenType.IDENT, 'result'],
      [TokenType.ASSIGN, '='],
      [TokenType.IDENT, 'add'],
      [TokenType.LPAREN, '('],
      [TokenType.IDENT, 'five'],
      [TokenType.COMMA, ','],
      [TokenType.IDENT, 'ten'],
      [TokenType.RPAREN, ')'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.BANG, '!'],
      [TokenType.MINUS, '-'],
      [TokenType.SLASH, '/'],
      [TokenType.ASTERISK, '*'],
      [TokenType.INT, '5'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.INT, '5'],
      [TokenType.LT, '<'],
      [TokenType.INT, '10'],
      [TokenType.GT, '>'],
      [TokenType.INT, '5'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.IF, 'if'],
      [TokenType.LPAREN, '('],
      [TokenType.INT, '5'],
      [TokenType.LT, '<'],
      [TokenType.INT, '10'],
      [TokenType.RPAREN, ')'],
      [TokenType.LBRACE, '{'],
      [TokenType.RETURN, 'return'],
      [TokenType.TRUE, 'true'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.RBRACE, '}'],
      [TokenType.ELSE, 'else'],
      [TokenType.LBRACE, '{'],
      [TokenType.RETURN, 'return'],
      [TokenType.FALSE, 'false'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.RBRACE, '}'],
      [TokenType.INT, '10'],
      [TokenType.EQ, '=='],
      [TokenType.INT, '10'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.INT, '10'],
      [TokenType.NE, '!='],
      [TokenType.INT, '9'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.STRING, 'foobar'],
      [TokenType.STRING, 'foo bar'],
      [TokenType.LBRACKET, '['],
      [TokenType.INT, '1'],
      [TokenType.COMMA, ','],
      [TokenType.INT, '2'],
      [TokenType.RBRACKET, ']'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.LBRACE, '{'],
      [TokenType.STRING, 'foo'],
      [TokenType.COLON, ':'],
      [TokenType.STRING, 'bar'],
      [TokenType.RBRACE, '}'],
      [TokenType.MACRO, 'macro'],
      [TokenType.LPAREN, '('],
      [TokenType.IDENT, 'x'],
      [TokenType.COMMA, ','],
      [TokenType.IDENT, 'y'],
      [TokenType.RPAREN, ')'],
      [TokenType.LBRACE, '{'],
      [TokenType.IDENT, 'x'],
      [TokenType.PLUS, '+'],
      [TokenType.IDENT, 'y'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.RBRACE, '}'],
      [TokenType.SEMICOLON, ';'],
      [TokenType.EOF, ''],
    ];

    const lex = Lexer.new(input);

    for (const [expectedType, expectedLiteral] of tests) {
      const token = lex.nextToken();
      expect(token.type).toBe(expectedType);
      expect(token.literal).toBe(expectedLiteral);
    }
  });
});

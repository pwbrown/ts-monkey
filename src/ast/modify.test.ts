import { TokenType } from '../token/token';
import { ArrayLiteral, BlockStatement, Expression, ExpressionStatement, FunctionLiteral, HashLiteral, Identifier, IfExpression, IndexExpression, InfixExpression, IntegerLiteral, LetStatement, Node, PrefixExpression, Program, ReturnStatement } from './ast';
import { modify } from './modify';

describe('Modify', () => {
  it('should modify', () => {
    /** Functions for generating new integer literals */
    const one = () => new IntegerLiteral({ type: TokenType.INT, literal: '1' }, 1);
    const two = () => new IntegerLiteral({ type: TokenType.INT, literal: '2' }, 2);

    const turnOneIntoTwo = (node: Node): Node => {
      const isInt = node instanceof IntegerLiteral;
      if (!isInt || node.value != 1) {
        return node;
      }
      node.token.literal = '2';
      node.value = 2;
      return node;
    };

    const tests: [input: Node, expected: Node][] = [
      [one(), two()],
      [
        new Program([
          new ExpressionStatement(
            { type: TokenType.INT, literal: '1' },
            one(),
          )
        ]),
        new Program([
          new ExpressionStatement(
            { type: TokenType.INT, literal: '2' },
            two(),
          )
        ]),
      ],
      [
        new InfixExpression(
          { type: TokenType.INT, literal: '1' },
          one(),
          '+',
          two(),
        ),
        new InfixExpression(
          { type: TokenType.INT, literal: '2' },
          two(),
          '+',
          two(),
        ),
      ],
      [
        new InfixExpression(
          { type: TokenType.INT, literal: '2' },
          two(),
          '+',
          one(),
        ),
        new InfixExpression(
          { type: TokenType.INT, literal: '2' },
          two(),
          '+',
          two(),
        ),
      ],
      [
        new PrefixExpression(
          { type: TokenType.MINUS, literal: '-' },
          '-',
          one(),
        ),
        new PrefixExpression(
          { type: TokenType.MINUS, literal: '-' },
          '-',
          two(),
        ),
      ],
      [
        new IndexExpression(
          { type: TokenType.INT, literal: '1' },
          one(),
          one(),
        ),
        new IndexExpression(
          { type: TokenType.INT, literal: '2' },
          two(),
          two(),
        ),
      ],
      [
        new IfExpression(
          { type: TokenType.IF, literal: 'if' },
          one(),
          new BlockStatement(
            { type: TokenType.LBRACE, literal: '{' },
            [
              new ExpressionStatement(
                { type: TokenType.INT, literal: '1' },
                one(),
              ),
            ],
          ),
          new BlockStatement(
            { type: TokenType.LBRACE, literal: '{' },
            [
              new ExpressionStatement(
                { type: TokenType.INT, literal: '1' },
                one(),
              ),
            ],
          ),
        ),
        new IfExpression(
          { type: TokenType.IF, literal: 'if' },
          two(),
          new BlockStatement(
            { type: TokenType.LBRACE, literal: '{' },
            [
              new ExpressionStatement(
                { type: TokenType.INT, literal: '2' },
                two(),
              ),
            ],
          ),
          new BlockStatement(
            { type: TokenType.LBRACE, literal: '{' },
            [
              new ExpressionStatement(
                { type: TokenType.INT, literal: '2' },
                two(),
              ),
            ],
          ),
        ),
      ],
      [
        new ReturnStatement(
          { type: TokenType.RETURN, literal: 'return' },
          one(),
        ),
        new ReturnStatement(
          { type: TokenType.RETURN, literal: 'return' },
          two(),
        ),
      ],
      [
        new LetStatement(
          { type: TokenType.LET, literal: 'let' },
          new Identifier({ type: TokenType.IDENT, literal: 'myvar' }, 'myvar'),
          one(),
        ),
        new LetStatement(
          { type: TokenType.LET, literal: 'let' },
          new Identifier({ type: TokenType.IDENT, literal: 'myvar' }, 'myvar'),
          two(),
        ),
      ],
      [
        new FunctionLiteral(
          { type: TokenType.FUNCTION, literal: 'fn' },
          [],
          new BlockStatement(
            { type: TokenType.LBRACE, literal: '{' },
            [
              new ExpressionStatement(
                { type: TokenType.INT, literal: '1' },
                one(),
              ),
            ],
          ),
        ),
        new FunctionLiteral(
          { type: TokenType.FUNCTION, literal: 'fn' },
          [],
          new BlockStatement(
            { type: TokenType.LBRACE, literal: '{' },
            [
              new ExpressionStatement(
                { type: TokenType.INT, literal: '2' },
                two(),
              ),
            ],
          ),
        ),
      ],
      [
        new ArrayLiteral(
          { type: TokenType.LBRACKET, literal: '[' },
          [
            one(),
            one(),
          ],
        ),
        new ArrayLiteral(
          { type: TokenType.LBRACKET, literal: '[' },
          [
            two(),
            two(),
          ],
        ),
      ],
      [
        new HashLiteral(
          { type: TokenType.LBRACE, literal: '{' },
          new Map<Expression, Expression>()
            .set(one(), one())
            .set(one(), one()),
        ),
        new HashLiteral(
          { type: TokenType.LBRACE, literal: '{' },
          new Map<Expression, Expression>()
            .set(two(), two())
            .set(two(), two()),
        ),
      ],
    ];

    for (const [input, expected] of tests) {
      const modified = modify(input, turnOneIntoTwo);
      expect(modified).not.toBeNull();
      expect(modified!.toString()).toBe(expected.toString());
    }
  });
});
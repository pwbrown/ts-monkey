import { Program } from '../ast/ast';
import { Lexer } from '../lexer/lexer';
import { Environment } from '../object/environment';
import { MacroObj } from '../object/object';
import { Parser } from '../parser/parser';
import { defineMacros, expandMacros } from './macro-expansion';

describe('Macro Expansion', () => {
  it('should define macros', () => {
    const input = `
      let number = 1;
      let function = fn(x, y) { x + y };
      let mymacro = macro(x, y) { x + y; };
      let mymacroTwo = macro(x, y) { x + y; };
    `;

    const env = new Environment();
    const program = testParseProgram(input);

    defineMacros(program, env);

    expect(program.statements).toHaveLength(2);
    expect(env.get('number')).toBeUndefined();
    expect(env.get('function')).toBeUndefined();

    const myMacro = testEnvMacro('mymacro', env, 2);
    const myMacroParams = myMacro.parameters!;
    expect(myMacroParams[0].toString()).toBe('x');
    expect(myMacroParams[1].toString()).toBe('y');
    expect(myMacro.body.toString()).toBe('(x + y)');
  });

  it('should expand macros', () => {
    const tests: [input: string, expectedInput: string][] = [
      [
        `
          let infixExpression = macro() {
            quote(1 + 2);
          };
    
          infixExpression();
        `,
        '(1 + 2)',
      ],
      [
        `
          let reverse = macro(a, b) {
            quote(unquote(b) - unquote(a));
          };
  
          reverse(2 + 2, 10 - 5);
        `,
        '(10 - 5) - (2 + 2)',
      ],
      [
        `
          let unless = macro(condition, consequence, alternative) {
            quote(
              if (!(unquote(condition))) {
                unquote(consequence);
              } else {
                unquote(alternative);
              }
            );
          };
  
          unless(10 > 5, puts("not greater"), puts("greater"));
        `,
        `if (!(10 > 5)) { puts("not greater") } else { puts("greater") }`,
      ],
    ];

    for (const [input, expectedInput] of tests) {
      const expected = testParseProgram(expectedInput);
      const program = testParseProgram(input);

      const env = new Environment();
      defineMacros(program, env);
      const expanded = expandMacros(program, env);

      expect(expanded).not.toBeNull();
      expect(expanded!.toString()).toBe(expected.toString());
    }
  });
});

/** Parse and test a program */
const testParseProgram = (input: string): Program => {
  const lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();
  return program;
}

/** Get a macro from the provided environment and test it before returning it */
const testEnvMacro = (name: string, env: Environment, paramLength?: number): MacroObj => {
  const obj = env.get(name);
  expect(obj).toBeDefined();
  expect(obj).toBeInstanceOf(MacroObj);
  if (typeof paramLength === 'number' && obj instanceof MacroObj) {
    expect(obj.parameters).toHaveLength(paramLength);
  }
  return obj as MacroObj;
}
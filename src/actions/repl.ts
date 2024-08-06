import { createInterface } from 'node:readline/promises';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { evaluate } from '../evaluator/evaluator';
import { Environment } from '../object/environment';
import { defineMacros, expandMacros } from '../evaluator/macro-expansion';
import { printParserErrors } from './base';

/** Command line prompt string */
const PROMPT = '>> ';

/** Start REPL */
export const startRepl = async () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const env = new Environment();
  const macroEnv = new Environment();

  for(;;) {
    const input = await rl.question(PROMPT);
    const lexer = Lexer.new(input);
    const parser = Parser.new(lexer);
    const program = parser.parseProgram();
    const errors = parser.getErrors();
    if (errors.length > 0) {
      printParserErrors(errors);
      continue;
    }

    /** Define and expanded macros to modify the program */
    defineMacros(program, macroEnv);
    const expandedProgram = expandMacros(program, macroEnv);

    /** Evaluate the expanded program */
    const evaluated = evaluate(expandedProgram, env);
    if (evaluated) {
      console.log(evaluated.inspect());
    }
  }
}
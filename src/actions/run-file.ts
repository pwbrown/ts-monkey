import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Environment } from '../object/environment';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { printParserErrors } from './base';
import { defineMacros, expandMacros } from '../evaluator/macro-expansion';
import { evaluate } from '../evaluator/evaluator';

/** Parse and run a monkey file */
export const runFile = (file: string) => {
  const path = resolve(file);
  if (!existsSync(path)) {
    throw new Error(`Could not resolve the provided file '${file}'`);
  }
  const input = readFileSync(path, { encoding: 'utf8' });

  /** Build the main environment and macro environment */
  const env = new Environment();
  const macroEnv = new Environment();

  /** Parse the program and print any errors */
  const lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();
  const errors = parser.getErrors();
  if (errors.length > 0) {
    printParserErrors(errors);
    process.exit(1);
  }

  /** Perform macro expansion */
  defineMacros(program, macroEnv);
  const expandedProgram = expandMacros(program, macroEnv);

  /** Evaluate the program */
  evaluate(expandedProgram, env);
}
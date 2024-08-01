import { Environment } from '../object/environment';
import { BlockStatement, CallExpression, Identifier, LetStatement, MacroLiteral, Program, Statement } from '../ast/ast';
import { MacroObj, QuoteObj } from '../object/object';
import { TokenType } from '../token/token';
import { modify } from '../ast/modify';
import { evaluate } from './evaluator';

/**
 * Search for macros in the top level of a program and add them to an environment
 * before removing them from the program
 */
export const defineMacros = (program: Program, env: Environment) => {
  /** Keep track of the locations of macro definitions (for deleting later) */
  const definitions: number[] = [];

  /** Search for a add macros */
  for (const [i, statement] of program.statements.entries()) {
    if (isMacroDefinition(statement)) {
      addMacro(statement, env);
      definitions.push(i);
    }
  }

  /** Delete macros by definition indexes */
  for (let i = definitions.length - 1; i >= 0; i -= 1) {
    const index = definitions[i];
    program.statements.splice(index, 1);
  }
}

/**
 * Modify a program by expanding the macro calls
 */
export const expandMacros = (program: Program, env: Environment) => {
  return modify(program, (node) => {
    const isCall = node instanceof CallExpression;
    if (!isCall) {
      return node;
    }

    const macro = isMacroCall(node, env);
    if (!macro) {
      return node;
    }

    const args = quoteArgs(node);
    const evalEnv = extendMacroEnv(macro, args);

    const evaluated = evaluate(macro.body, evalEnv);

    if (evaluated instanceof QuoteObj) {
      return evaluated.node;
    } else {
      throw new Error('we only support returning AST-nodes from macros');
    }
  });
}

/** Checks if a statement is a macro definition */
const isMacroDefinition = (statement: Statement) => {
  return (
    statement instanceof LetStatement &&
    statement.value &&
    statement.value instanceof MacroLiteral
  );
}

/** Verifies that a call expression is associated with a macro, and if so it returns the macro */
const isMacroCall = (exp: CallExpression, env: Environment): MacroObj | null => {
  const ident = exp.func;
  const hasIdent = ident instanceof Identifier;
  if (!hasIdent) {
    return null;
  }
  const obj = env.get(ident.value);
  if (!obj) {
    return null;
  }
  const isMacro = obj instanceof MacroObj;
  if (!isMacro) {
    return null;
  }
  return obj;
}

/** Adds a macro to the environment */
const addMacro = (statement: Statement, env: Environment) => {
  const letStmt = statement as LetStatement;
  const macroLit = letStmt.value as MacroLiteral;

  const params = macroLit.parameters || [];
  const body = macroLit.body || new BlockStatement({ type: TokenType.LBRACE, literal: '{' });
  
  const macro = new MacroObj(params, body, env);
  env.set(letStmt.name.value, macro);
}

/** Wrap all call expression arguments in quotes */
const quoteArgs = (exp: CallExpression) => {
  const args: QuoteObj[] = [];

  for (const arg of exp.args || []) {
    args.push(new QuoteObj(arg));
  }

  return args;
}

/** Extend a macro's environment with the provided arguments */
const extendMacroEnv = (macro: MacroObj, args: QuoteObj[]) => {
  const extended = new Environment(macro.env);

  for (const [i, param] of macro.parameters.entries()) {
    extended.set(param.value, args[i]);
  }

  return extended;
}
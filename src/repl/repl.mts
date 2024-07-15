import { createInterface } from 'node:readline/promises';
import { inspect } from 'node:util';
import { Lexer } from '../lexer/lexer.mjs';
import { TokenType } from '../token/token.mjs';

/** Command line prompt string */
const PROMPT = '>> ';

/** Start REPL */
export const start = async () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for(;;) {
    const input = await rl.question(PROMPT);
    const lexer = Lexer.new(input);

    for (let token = lexer.nextToken(); token.type !== TokenType.EOF; token = lexer.nextToken()) {
      console.log(inspect(token));
    }
  }
}
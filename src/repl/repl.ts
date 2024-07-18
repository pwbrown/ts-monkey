import { createInterface } from 'node:readline/promises';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';

/** Command line prompt string */
const PROMPT = '>> ';

/** Parser error monkey face :D */
const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
  \\ '- ,\\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '-----'
`;

/** Start REPL */
export const start = async () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

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

    console.log(`${program.toString()}`);
  }
}

const printParserErrors = (errors: string[]) => {
  console.log(MONKEY_FACE);
  console.log('Woops! We ran into some monkey business here!');
  console.log(' parser errors:');
  for (const err of errors) {
    console.log(`\t${err}`);
  }
}
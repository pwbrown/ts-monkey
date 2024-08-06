import { program } from 'commander';
import { userInfo } from 'node:os';
import { startRepl } from './actions/repl';
import { runFile } from './actions/run-file';


program
  .argument('[file]', 'path to mky file to execute')
  .action((file?: string) => {
    /** Run the REPL if no file was provided */
    if (!file) {
      console.log(`Hello ${userInfo().username}! This is the Monkey programming language!`);
      console.log('Feel free to type in commands');
      return startRepl();
    } else {
      return runFile(file);
    }
  });

program.parse(process.argv);
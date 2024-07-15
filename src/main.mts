import { userInfo } from 'node:os';
import { start } from './repl/repl.mjs';

const main = async () => {
  const user = userInfo().username;

  console.log(`Hello ${user}! This is the Monkey programming language!`);
  console.log('Feel free to type in commands');
  await start();
};

main();

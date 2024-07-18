import { userInfo } from 'node:os';
import { start } from './repl/repl';

const main = async () => {
  const user = userInfo().username;

  console.clear();
  console.log(`Hello ${user}! This is the Monkey programming language!`);
  console.log('Feel free to type in commands');
  await start();
};

main();

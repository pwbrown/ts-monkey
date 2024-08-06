# Monkey

## About

This is my third time going through the wonderful book(s) written by Thorsten Ball. I tackled the first book titled ["Writing An Interpreter In Go"](https://interpreterbook.com/) back in 2018 when I was first starting to learn Go as a language and stumbled upon this book. I also started to work through the second book title ["Writing A Compiler In Go"](https://compilerbook.com/) soon after but never finished it. Both of those attempts I read the book as is and used GoLang to build the interpreter and partial compiler. Years later, I picked the first book back off the shelf while I was learning the language rust, and decided to go through it but with Rust instead. I started and completed the book using Rust in the midst of COVID in 2020 (with some help referencing others that did the same thing): [here is that implementation](https://github.com/pwbrown/rust-monkey). And finally here I am again in 2024 revisting the book(s), but this time using my most comfortable language: JavaScript/TypeScript/NodeJS. I decided to use JavaScript this time since I can focus less on the challenge of learning a new language, and instead focus on completing both books (with the lost chapter) AND beyond with new features.

## The Plan

Here is my plan in a nutshell:
1. (__*DONE*__) Scaffold the project to use modern TypeScript features with Jest as the testing framework.
2. (__*DONE*__) Build the Interpreter using the first book as close to the original implementation as I can.
3. (__*DONE*__) Add the Macro System from ["The Lost Chapter"](https://interpreterbook.com/#the-lost-chapter)
4. (__*DONE*__) Take a quick break to organize some of the code AND build a new CLI that includes the ability to pass monkey code from a file along with the standard REPL.
5. Build the Compiler using the second book as close to the original implementation as possible.
6. Go crazy with building new features just to see if I can!!!

## Dream for Monkey v2 (aka "new features")

* Support for single and multiline comments
* Support for special characters and character escaping in strings.
* Support for single quoted strings (like JavaScript) in addition to double quoted strings
* Add the `for` in the classic C style increment syntax `for (;;) {}`
* Add the `while` and `do while` loops
* Add support for floats
* Add support for the prefix and postfix `++` and `--` operators
* Add support for the postfix `+=` and `-=`
* Add support for the modulus operator `%`
* Add support for the dot operator for hash lookups
* Add support for the spread operator (`..` or `...`) in function and macro parameters
* Add support for the `&&` and `||` comparison operators
* ...TBD

## Setting Up the Environment

### Using a Dev Container

I personally used a dev container setup when developing this project. The dev container pattern uses Docker to setup a complete development environment with NodeJS pre-installed and is the `.devcontainer` folder is designed to work with both VSCode and Github Codespaces, so it makes it very portable.

1. Install the "Dev Containers" Extension for VSCode OR open this repo (or a fork) using Github Codespaces.
2. Run `npm i` from the root of this repository to install all required dev dependencies
3. Run `npm start` to compile the project and run the REPL
4. Run `npm test` to run all unit tests

### Manual Setup

1. Download and install NodeJS v22 from [nodejs.org](https://nodejs.org/en) or use an environment manager like [nvm](https://github.com/nvm-sh/nvm) to install it for you.
2. Run `npm i` from the root of this repository to install all required dependencies
3. Run `npm start` to compile the project and run the REPL
4. Run `npm test` to run all unit tests
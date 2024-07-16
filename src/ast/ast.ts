import { Token } from "../token/token";

/** The basis for all AST components */
export interface Node {
  tokenLiteral(): string;  
}

/** Statement Node */
export interface Statement extends Node {
  statementNode(): void;
}

/** Expression Node */
export interface Expression extends Node {
  expressionNode(): void;
}

/** Program with one or more statements */
export class Program {
  constructor(
    public statements: Statement[] = [],
  ) {}

  /** Print program token literal for debugging/testing */
  public tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return '';
    }
  }
}

/** Let Statement */
export class LetStatement implements Statement {
  constructor(
    public token: Token,
    public name: Identifier,
    public value: Expression,
  ) {}

  statementNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }
}

/** Identifier Expression */
export class Identifier implements Expression {
  constructor(
    public token: Token,
    public value: string,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }
}
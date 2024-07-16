import { Token } from "../token/token";

/** The basis for all AST components */
export interface Node {
  tokenLiteral(): string;
  toString(): string;  
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

  /** Returns a string representation of the entire program */
  public toString(): string {
    return this.statements.map((s) => s.toString()).join('');
  }
}

/** Let Statement */
export class LetStatement implements Statement {
  constructor(
    public token: Token,
    public name: Identifier,
    public value?: Expression | null,
  ) {}

  statementNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const token = this.token.literal;
    const name = this.name.toString();
    const value = this.value?.toString() || '';
    return `${token} ${name} = ${value};`;
  }
}

/** Return Statement */
export class ReturnStatement implements Statement {
  constructor(
    public token: Token,
    public returnValue?: Expression | null,
  ) {}
  
  statementNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const token = this.token.literal;
    const value = this.returnValue?.toString() || '';
    return `${token} ${value};`;
  }
}

/** Expression Statement */
export class ExpressionStatement implements Statement {
  constructor(
    public token: Token,
    public expression?: Expression | null,
  ) {}

  statementNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.expression?.toString() || '';
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

  toString(): string {
    return this.value;
  }
}

/** Integer literal expression */
export class IntegerLiteral implements Expression {
  constructor(
    public token: Token,
    public value: number,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }
}

/** Prefix expression */
export class PrefixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public right?: Expression | null,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const right = this.right?.toString() || ''
    return `(${this.operator}${right})`;
  }

}
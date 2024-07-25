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

/** Block statement */
export class BlockStatement implements Statement {
  constructor(
    public token: Token,
    public statements: Statement[] = [],
  ) {}

  statementNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }
  
  toString(): string {
    return this.statements.map((s) => s.toString()).join('');
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

/** String literal expression */
export class StringLiteral implements Expression {
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
    return this.token.literal;
  }
}

/** Array literal expression */
export class ArrayLiteral implements Expression {
  constructor(
    public token: Token,
    public elements: Expression[] | null,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const elements = this.elements?.map((e) => e.toString()) || [];
    return `[${elements.join(', ')}]`;
  }
}

export class IndexExpression implements Expression {
  constructor(
    public token: Token,
    public left: Expression | null,
    public index: Expression | null,
  ){}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const left = this.left?.toString() || '';
    const index = this.index?.toString() || '';
    return `(${left}[${index}])`;
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
    const right = this.right?.toString() || '';
    return `(${this.operator}${right})`;
  }
}

/** Prefix expression */
export class InfixExpression implements Expression {
  constructor(
    public token: Token,
    public left: Expression | null,
    public operator: string,
    public right: Expression | null,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const left = this.left?.toString() || '';
    const right = this.right?.toString() || '';
    return `(${left} ${this.operator} ${right})`;
  }
}

/** Boolean literal expression */
export class BooleanLiteral implements Expression {
  constructor(
    public token: Token,
    public value: boolean,
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

/** If expression */
export class IfExpression implements Expression {
  constructor(
    public token: Token,
    public condition: Expression | null,
    public consequence: BlockStatement | null,
    public alternative: BlockStatement | null,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const condition = this.condition?.toString() || '';
    const consequence = this.consequence?.toString() || '';
    const alternative = this.alternative?.toString() || '';
    return `if ${condition} ${consequence}${alternative ? ` else ${alternative}`: ''}`;
  }
}

/** Function literal expression */
export class FunctionLiteral implements Expression {
  constructor(
    public token: Token,
    public parameters: Identifier[] | null,
    public body: BlockStatement | null,
  ) {}

  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }
  
  toString(): string {
    const parameters = this.parameters?.map((p) => p.toString()) || [];
    const body = this.body?.toString() || '';

    return `${this.token.literal}(${parameters.join(', ')}) ${body}`;
  }
}

/** Call expression */
export class CallExpression implements Expression {
  constructor(
    public token: Token,
    public func: Expression | null,
    public args: Expression[] | null,
  ) {}
  
  expressionNode(): void {
    throw new Error("Method not implemented.");
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const func = this.func?.toString() || '';
    const args = this.args?.map((a) => a.toString()) || [];

    return `${func}(${args.join(', ')})`;
  }
}
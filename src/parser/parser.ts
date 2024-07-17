import { Token, TokenType } from '../token/token';
import { Lexer } from '../lexer/lexer';
import {
  Program,
  Statement,
  Expression,
  LetStatement,
  ReturnStatement,
  Identifier,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
} from '../ast/ast';

/** Parser Functions */
type PrefixParseFn = () => Expression | null;
type InfixParseFn = (exp: Expression | null) => Expression | null;

/** Precedence for Pratt Parser */
enum Precedence {
  LOWEST,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
}

/** Mapping of tokens to their corresponding precedence */
const TOKEN_PRECEDENCE: { [type in TokenType]?: Precedence } = {
  [TokenType.EQ]: Precedence.EQUALS,
  [TokenType.NE]: Precedence.EQUALS,
  [TokenType.LT]: Precedence.LESSGREATER,
  [TokenType.GT]: Precedence.LESSGREATER,
  [TokenType.PLUS]: Precedence.SUM,
  [TokenType.MINUS]: Precedence.SUM,
  [TokenType.SLASH]: Precedence.PRODUCT,
  [TokenType.ASTERISK]: Precedence.PRODUCT,
};

/**
 * Parser
 * 
 * Receives a lexer and returns an AST (Abstract Syntax Tree)
 */
export class Parser {
  private curToken!: Token;
  private peekToken!: Token;
  private errors: string[] = [];

  private prefixParseFns: { [type in TokenType]?: PrefixParseFn } = {};
  private infixParseFns: { [type in TokenType]?: InfixParseFn } = {};
  
  static new(lexer: Lexer) {
    return new Parser(lexer);
  }

  constructor(private lex: Lexer) {
    /** Read two tokens to fill the current and peek tokens */
    this.nextToken();
    this.nextToken();

    /** Register prefix parser functions */
    this.registerPrefix(TokenType.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TokenType.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression.bind(this));

    /** Register infix parser functions */
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NE, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
  }

  /** Fully parses the lexer into a program */
  public parseProgram(): Program {
    const program = new Program();

    while (this.curToken.type !== TokenType.EOF) {
      const statement = this.parseStatement();
      if (statement) {
        program.statements.push(statement);
      }
      this.nextToken();
    }

    return program;
  }

  /** Returns any parser errors */
  public getErrors() {
    return this.errors;
  }

  /** Parse a statement */
  private parseStatement(): Statement | null {
    switch(this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  /** Parse a let statement */
  private parseLetStatement(): LetStatement | null {
    const token = this.curToken;

    if (!this.expectPeek(TokenType.IDENT)) {
      return null;
    }

    const name = new Identifier(this.curToken, this.curToken.literal);

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    /** Skip expression for now */
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return new LetStatement(token, name);
  }

  /** Parse a return statement */
  private parseReturnStatement(): ReturnStatement | null {
    const token = this.curToken;

    this.nextToken();

    // Skip expression for now
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return new ReturnStatement(token);
  }

  /** Parse an expression statement */
  private parseExpressionStatement(): ExpressionStatement | null {
    const token = this.curToken;
    
    const expression = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return new ExpressionStatement(token, expression);
  }

  /** Parse an expression */
  private parseExpression(precedence: Precedence): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      return null;
    }

    let leftExp = prefix();

    while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns[this.peekToken.type];
      if (!infix) {
        return leftExp;
      }
      this.nextToken();
      
      leftExp = infix(leftExp);
    }

    return leftExp;
  }

  /** Parse an identifier expression */
  private parseIdentifier(): Identifier {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  /** Parse an integer literal expression */
  private parseIntegerLiteral(): IntegerLiteral | null {
    const token = this.curToken;

    let value: number;
    try {
      value = parseInt(token.literal, 10);
    } catch(e) {
      this.errors.push(`could not parse ${token.literal} as integer`);
      return null;
    }

    return new IntegerLiteral(token, value);
  }

  /** Parse a prefix expression */
  private parsePrefixExpression(): PrefixExpression {
    const token = this.curToken;
    const operator = this.curToken.literal;

    this.nextToken();

    const right = this.parseExpression(Precedence.PREFIX);

    return new PrefixExpression(token, operator, right);
  }

  /** Parse infix expression */
  private parseInfixExpression(left: Expression | null): InfixExpression {
    const token = this.curToken;
    const operator = this.curToken.literal;
    const precedence = this.curPrecedence();
    this.nextToken();
    const right = this.parseExpression(precedence);

    return new InfixExpression(token, left, operator, right);
  }

  /** Checks if the current token is of a specific type */
  private curTokenIs(type: TokenType) {
    return this.curToken.type === type;
  }

  /** Checks if the next token is of a specific type */
  private peekTokenIs(type: TokenType) {
    return this.peekToken.type === type;
  }

  /** Checks if the next token is of the expected type and gets the next token if a match occurs */
  private expectPeek(type: TokenType) {
    if (this.peekTokenIs(type)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(type);
      return false;
    }
  }

  /** Appends an error for a mismatched peek token type */
  private peekError(type: TokenType) {
    this.errors.push(`expected next token to be ${type}, got ${this.peekToken.type} instead`);
  }

  /** Appends an error for a missing prefix parse function */
  private noPrefixParseFnError(type: TokenType) {
    this.errors.push(`no prefix parse function for ${type} found`);
  }

  /** Read the next token from the lexer */
  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lex.nextToken();
  }

  /** Get precedence of the next token */
  private peekPrecedence(): Precedence {
    return TOKEN_PRECEDENCE[this.peekToken.type] || Precedence.LOWEST;
  }

  /** Get precedence of the current token */
  private curPrecedence(): Precedence {
    return TOKEN_PRECEDENCE[this.curToken.type] || Precedence.LOWEST;
  }

  /** Register a prefix parser function to the prefix map */
  private registerPrefix(type: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns[type] = fn;
  }

  /** Register an infix parser function to the infix map */
  private registerInfix(type: TokenType, fn: InfixParseFn) {
    this.infixParseFns[type] = fn;
  }
}
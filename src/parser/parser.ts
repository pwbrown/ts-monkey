import { Token, TokenType } from '../token/token';
import { Lexer } from '../lexer/lexer';
import { Identifier, LetStatement, Program, Statement } from '../ast/ast';

/**
 * Parser
 * 
 * Receives a lexer and returns an AST (Abstract Syntax Tree)
 */
export class Parser {
  private curToken!: Token;
  private peekToken!: Token;
  private errors: string[] = [];
  
  static new(lexer: Lexer) {
    return new Parser(lexer);
  }

  constructor(private lex: Lexer) {
    /** Read two tokens to fill the current and peek tokens */
    this.nextToken();
    this.nextToken();
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
      default:
        return null;
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

    return new LetStatement(token, name, { expressionNode: () => '', tokenLiteral: () => '' });
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

  /** Read the next token from the lexer */
  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lex.nextToken();
  }
}
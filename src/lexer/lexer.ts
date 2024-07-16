import { Token, TokenType, lookupIdent } from '../token/token';

/**
 * Lexer
 * 
 * Handles lexical analysis of a string of Monkey code. Takes a string of input
 * code and allows for iteration over tokens
 */
export class Lexer {
  /** Current character position */
  private position = 0;
  /** Current reading position (after current character) */
  private readPosition = 0;
  /** Current character under examination */
  private char: string = '';

  /** Create a new lexer for the given input string */
  static new(input: string) {
    return new Lexer(input);
  }

  constructor(private input: string) {
    /** Initialize first character */
    this.readChar();
  }

  /** Read and return the next token */
  public nextToken() {
    let token: Token;

    this.skipWhitespace();

    switch(this.char) {
      case '=':
        if (this.peekChar() === '=') {
          this.readChar();
          token = newToken(TokenType.EQ, '==');
        } else {
          token = newToken(TokenType.ASSIGN, '=');
        }
        break;
      case '+':
        token = newToken(TokenType.PLUS, '+');
        break;
      case '-':
        token = newToken(TokenType.MINUS, '-');
        break;
      case '!':
        if (this.peekChar() === '=') {
          this.readChar();
          token = newToken(TokenType.NE, '!=');
        } else {
          token = newToken(TokenType.BANG, '!');
        }
        break;
      case '/':
        token = newToken(TokenType.SLASH, '/');
        break;
      case '*':
        token = newToken(TokenType.ASTERISK, '*');
        break;
      case '<':
        token = newToken(TokenType.LT, '<');
        break;
      case '>':
        token = newToken(TokenType.GT, '>');
        break;
      case ';':
        token = newToken(TokenType.SEMICOLON, ';');
        break;
      case ',':
        token = newToken(TokenType.COMMA, ',');
        break;
      case '(':
        token = newToken(TokenType.LPAREN, '(');
        break;
      case ')':
        token = newToken(TokenType.RPAREN, ')');
        break;
      case '{':
        token = newToken(TokenType.LBRACE, '{');
        break;
      case '}':
        token = newToken(TokenType.RBRACE, '}');
        break;
      case '':
        token = newToken(TokenType.EOF, '');
        break;
      default:
        if (isLetter(this.char)) {
          const literal = this.readIdentifier();
          const type = lookupIdent(literal);
          return newToken(type, literal);
        } else if (isDigit(this.char)) {
          const literal = this.readNumber();
          const type = TokenType.INT;
          return newToken(type, literal);
        } else {
          token = newToken(TokenType.ILLEGAL, this.char);
        }
        break;
    }

    this.readChar();
    return token;
  }

  /** Read the next character in the input string */
  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.char = '';
    } else {
      this.char = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  /** Peek at the next character in the input string without consuming it */
  private peekChar() {
    if (this.readPosition >= this.input.length) {
      return '';
    } else {
      return this.input[this.readPosition];
    }
  }

  /** Reads and returns an identifier */
  private readIdentifier() {
    const start = this.position;
    while (isLetter(this.char)) {
      this.readChar();
    }
    const end = this.position;
    return this.input.substring(start, end);
  }

  /** Reads and returns a number */
  private readNumber() {
    const start = this.position;
    while (isDigit(this.char)) {
      this.readChar();
    }
    const end = this.position;
    return this.input.substring(start, end);
  }

  /** Read and skip over all whitespace characters */
  private skipWhitespace() {
    while(
      this.char === ' ' ||
      this.char === '\t' ||
      this.char === '\n' ||
      this.char === '\r'
    ) {
      this.readChar();
    }
  }
}

/** Create a new token */
const newToken = (type: TokenType, literal: string): Token => {
  return { type, literal };
}

/** Checks if a character is considered a letter */
const isLetter = (char: string): boolean => {
  return (
    ('a' <= char && char <= 'z') ||
    ('A' <= char && char <= 'Z') ||
    char === '_'
  );
}

/** Checks if a characters is considered a digit */
const isDigit = (char: string): boolean => {
  return '0' <= char && char <= '9';
}

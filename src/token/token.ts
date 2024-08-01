/** Represents a single token */
export interface Token {
  type: TokenType;
  literal: string;
}

/** Holds all possible token types */
export enum TokenType {
  // GENERAL
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',

  // IDENTIFIERS/LITERALS
  IDENT = 'IDENT',
  INT = 'INT',
  STRING = 'STRING',
  
  // OPERATORS
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  BANG = 'BANG',
  ASTERISK = 'ASTERISK',
  SLASH = 'SLASH',
  LT = 'LT',
  GT = 'GT',
  EQ = 'EQ',
  NE = 'NE',

  // DELIMITERS
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',

  // KEYWORDS
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
  MACRO = 'MACRO',
}

interface Keywords {
  [keyword: string]: TokenType;
}

/** Keywords Map */
const KEYWORDS: Keywords = {
  fn: TokenType.FUNCTION,
  let: TokenType.LET,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  if: TokenType.IF,
  else: TokenType.ELSE,
  return: TokenType.RETURN,
  macro: TokenType.MACRO,
}

/** Lookup and return the token type associated with an identifier */
export const lookupIdent = (ident: string): TokenType => {
  return KEYWORDS[ident] || TokenType.IDENT;
}

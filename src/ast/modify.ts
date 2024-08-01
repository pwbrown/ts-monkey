import { ArrayLiteral, BlockStatement, Expression, ExpressionStatement, FunctionLiteral, HashLiteral, Identifier, IfExpression, IndexExpression, InfixExpression, LetStatement, Node, PrefixExpression, Program, ReturnStatement, Statement } from "./ast";

export type ModifierFunc = (node: Node) => Node | null;

export const modify = (node: Node | null | undefined, modifier: ModifierFunc): Node | null => {
  if (!node) {
    return null;
  }
  /** Program or Block Statement*/
  else if (node instanceof Program || node instanceof BlockStatement) {
    for (const [i, statement] of node.statements.entries()) {
      node.statements[i] = modify(statement, modifier) as Statement;
    }
  }
  /** Expression Statement */
  else if (node instanceof ExpressionStatement) {
    node.expression = modify(node.expression, modifier) as Expression;
  }
  /** Infix Expression */
  else if (node instanceof InfixExpression) {
    node.left = modify(node.left, modifier) as Expression;
    node.right = modify(node.right, modifier) as Expression;
  }
  /** Prefix Expression */
  else if (node instanceof PrefixExpression) {
    node.right = modify(node.right, modifier) as Expression;
  }
  /** Index Expression */
  else if (node instanceof IndexExpression) {
    node.left = modify(node.left, modifier) as Expression;
    node.index = modify(node.index, modifier) as Expression;
  }
  /** If Expression */
  else if (node instanceof IfExpression) {
    node.condition = modify(node.condition, modifier) as Expression;
    node.consequence = modify(node.consequence, modifier) as BlockStatement;
    node.alternative = modify(node.alternative, modifier) as BlockStatement;
  }
  /** Return Statement */
  else if (node instanceof ReturnStatement) {
    node.returnValue = modify(node.returnValue, modifier) as Expression;
  }
  /** Let Statement */
  else if (node instanceof LetStatement) {
    node.value = modify(node.value, modifier) as Expression;
  }
  /** Function Literal */
  else if (node instanceof FunctionLiteral) {
    if (node.parameters) {
      for (const [i, param] of node.parameters.entries()) {
        node.parameters[i] = modify(param, modifier) as Identifier;
      }
    }
    node.body = modify(node.body, modifier) as BlockStatement;
  }
  /** Array Literal */
  else if (node instanceof ArrayLiteral) {
    if (node.elements) {
      for (const [i, elem] of node.elements.entries()) {
        node.elements[i] = modify(elem, modifier) as Expression;
      }
    }
  }
  /** Hash Literal */
  else if (node instanceof HashLiteral) {
    const pairs = new Map<Expression, Expression>();
    for (const [key, value] of node.pairs) {
      const newKey = modify(key, modifier) as Expression;
      const newValue = modify(value, modifier) as Expression;
      pairs.set(newKey, newValue);
    }
    node.pairs = pairs;
  }

  return modifier(node);
};
import { BooleanObj, IntegerObj, NullObj, Obj } from '../object/object';
import { BooleanLiteral, ExpressionStatement, InfixExpression, IntegerLiteral, Node, PrefixExpression, Program, Statement } from '../ast/ast';

/** Objects that are constant in nature */
export const ConstObj = {
  true: new BooleanObj(true),
  false: new BooleanObj(false),
  null: new NullObj(),
}

/** Evaulates an AST Node and returns an Object representation */
export const evaluate = (node?: Node | null): Obj => {
  if (node instanceof Program) {
    return evalStatements(node.statements);
  }
  if (node instanceof ExpressionStatement) {
    return evaluate(node.expression);
  }

  /** Expressions */
  if (node instanceof IntegerLiteral) {
    return new IntegerObj(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return boolToBooleanObj(node.value);
  }
  if (node instanceof PrefixExpression) {
    const right = evaluate(node.right);
    return evalPrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = evaluate(node.left);
    const right = evaluate(node.right);
    return evalInfixExpression(node.operator, left, right);
  }

  return ConstObj.null;
}

/** Evaluate a list of statements */
const evalStatements = (statements: Statement[]): Obj => {
  let result: Obj = ConstObj.null;

  for (const statement of statements) {
    result = evaluate(statement);
  }

  return result;
}

/** Evaluate prefix expression */
const evalPrefixExpression = (operator: string, right: Obj): Obj => {
  switch(operator) {
    case '!':
      return evalBangOperatorExpression(right);
    case '-':
      return evalMinusPrefixOperatorExpression(right);
    default:
      return ConstObj.null;
  }
}

/** Evaluate bang operator expression (negate) */
const evalBangOperatorExpression = (right: Obj): Obj => {
  switch(right) {
    case ConstObj.true:
      return ConstObj.false;
    case ConstObj.false:
      return ConstObj.true;
      case ConstObj.null:
        return ConstObj.true;
        default:
          return ConstObj.false;
  }
}

/** Evaluate minus prefix operator expression */
const evalMinusPrefixOperatorExpression = (right: Obj): Obj => {
  if (right instanceof IntegerObj) {
    return new IntegerObj(-right.value);
  }
  
  return ConstObj.null;
}

/** Evaluate infix expression */
const evalInfixExpression = (operator: string, left: Obj, right: Obj): Obj => {
  if (left instanceof IntegerObj && right instanceof IntegerObj) {
    return evalIntegerInfixExpression(operator, left, right);
  }
  switch(operator) {
    case '==':
      return boolToBooleanObj(left === right);
    case '!=':
      return boolToBooleanObj(left !== right);
    default:
      return ConstObj.null;
  }
}

/** Evaluate integer infex expression */
const evalIntegerInfixExpression = (operator: string, left: IntegerObj, right: IntegerObj): Obj => {
  switch(operator) {
    case '+':
      return new IntegerObj(left.value + right.value);
    case '-':
      return new IntegerObj(left.value - right.value);
    case '*':
      return new IntegerObj(left.value * right.value);
    case '/':
      return new IntegerObj(left.value / right.value);
    case '<':
      return boolToBooleanObj(left.value < right.value);
    case '>':
      return boolToBooleanObj(left.value > right.value);
    case '==':
      return boolToBooleanObj(left.value === right.value);
    case '!=':
      return boolToBooleanObj(left.value !== right.value);
    default:
      return ConstObj.null;
  }
}

/** Converts boolean value to boolean object */
const boolToBooleanObj = (value: boolean) => {
  return value ? ConstObj.true : ConstObj.false;
}
import {
  Obj,
  IntegerObj,
  BooleanObj,
  ReturnValueObj,
  ErrorObj,
  NullObj,
} from '../object/object';
import {
  Program,
  Node,
  BlockStatement,
  ReturnStatement,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  IntegerLiteral,
  BooleanLiteral,
} from '../ast/ast';

/** Objects that are constant in nature */
export const ConstObj = {
  true: new BooleanObj(true),
  false: new BooleanObj(false),
  null: new NullObj(),
}

/** Evaulates an AST Node and returns an Object representation */
export const evaluate = (node?: Node | null): Obj => {
  if (node instanceof Program) {
    return evalProgram(node);
  }
  if (node instanceof BlockStatement) {
    return evalBlockStatement(node)
  }
  if (node instanceof ExpressionStatement) {
    return evaluate(node.expression);
  }
  if (node instanceof ReturnStatement) {
    const value = evaluate(node.returnValue);
    if (isError(value)) {
      return value;
    }
    return new ReturnValueObj(value);
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
    if (isError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = evaluate(node.left);
    if (isError(left)) {
      return left;
    }

    const right = evaluate(node.right);
    if (isError(right)) {
      return right;
    }

    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof IfExpression) {
    return evalIfExpression(node);
  }

  return ConstObj.null;
}

/** Evaluate a program */
const evalProgram = (program: Program): Obj => {
  let result: Obj = ConstObj.null;

  for (const statement of program.statements) {
    result = evaluate(statement);

    /** Unwrap the return value */
    if (result instanceof ReturnValueObj) {
      return result.value;
    }

    /** Don't unwrap error */
    if (result instanceof ErrorObj) {
      return result;
    }
  }

  return result;
}

/** Evaluate a list of statements */
const evalBlockStatement = (block: BlockStatement): Obj => {
  let result: Obj = ConstObj.null;

  for (const statement of block.statements) {
    result = evaluate(statement);

    /** Do not unwrap return value or error */
    if (result instanceof ReturnValueObj || result instanceof ErrorObj) {
      return result;
    }
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
      return newError(`unknown operator: ${operator}${right.type()}`);
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
  } else {
    return newError(`unknown operator: -${right.type()}`);
  }
}

/** Evaluate infix expression */
const evalInfixExpression = (operator: string, left: Obj, right: Obj): Obj => {
  if (left.type() !== right.type()) {
    return newError(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
  } else if (left instanceof IntegerObj && right instanceof IntegerObj) {
    return evalIntegerInfixExpression(operator, left, right);
  } else if (operator === '==') {
    return boolToBooleanObj(left === right);
  } else if (operator === '!=') {
    return boolToBooleanObj(left !== right);
  } else {
    return newError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
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
      return newError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
  }
}

/** Evaluate if expression */
const evalIfExpression = (expression: IfExpression): Obj => {
  const condition = evaluate(expression.condition);
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return evaluate(expression.consequence);
  } else {
    return evaluate(expression.alternative);
  }
}

/** Converts boolean value to boolean object */
const boolToBooleanObj = (value: boolean) => {
  return value ? ConstObj.true : ConstObj.false;
}

/** Checks if an object is truthy */
const isTruthy = (obj: Obj) => {
  return obj !== ConstObj.false && obj !== ConstObj.null;
}

/** Checks if an object is an error */
const isError = (obj: Obj) => obj instanceof ErrorObj;

/** Generate a new error object for a message */
const newError = (message: string) => {
  return new ErrorObj(message);
}
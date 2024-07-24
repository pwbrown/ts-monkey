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
  LetStatement,
  Identifier,
} from '../ast/ast';
import { Environment } from '../object/environment';

/** Objects that are constant in nature */
export const ConstObj = {
  true: new BooleanObj(true),
  false: new BooleanObj(false),
  null: new NullObj(),
}

/** Evaulates an AST Node and returns an Object representation */
export const evaluate = (node: Node | null | undefined, env: Environment): Obj => {
  if (node instanceof Program) {
    return evalProgram(node, env);
  }
  if (node instanceof BlockStatement) {
    return evalBlockStatement(node, env)
  }
  if (node instanceof ExpressionStatement) {
    return evaluate(node.expression, env);
  }
  if (node instanceof ReturnStatement) {
    const value = evaluate(node.returnValue, env);
    if (isError(value)) {
      return value;
    }
    return new ReturnValueObj(value);
  }
  if (node instanceof LetStatement) {
    const value = evaluate(node.value, env);
    if (isError(value)) {
      return value;
    }
    env.set(node.name.value, value);
  }

  /** Expressions */
  if (node instanceof Identifier) {
    return evalIdentifier(node, env);
  }
  if (node instanceof IntegerLiteral) {
    return new IntegerObj(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return boolToBooleanObj(node.value);
  }
  if (node instanceof PrefixExpression) {
    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = evaluate(node.left, env);
    if (isError(left)) {
      return left;
    }

    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }

    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof IfExpression) {
    return evalIfExpression(node, env);
  }

  return ConstObj.null;
}

/** Evaluate a program */
const evalProgram = (program: Program, env: Environment): Obj => {
  let result: Obj = ConstObj.null;

  for (const statement of program.statements) {
    result = evaluate(statement, env);

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
const evalBlockStatement = (block: BlockStatement, env: Environment): Obj => {
  let result: Obj = ConstObj.null;

  for (const statement of block.statements) {
    result = evaluate(statement, env);

    /** Do not unwrap return value or error */
    if (result instanceof ReturnValueObj || result instanceof ErrorObj) {
      return result;
    }
  }

  return result;
}

/** Evaluate identifiers */
const evalIdentifier = (identifier: Identifier, env: Environment): Obj => {
  const stored = env.get(identifier.value);
  if (!stored) {
    return newError(`identifier not found: ${identifier.value}`);
  }
  return stored;
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
const evalIfExpression = (expression: IfExpression, env: Environment): Obj => {
  const condition = evaluate(expression.condition, env);
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return evaluate(expression.consequence, env);
  } else {
    return evaluate(expression.alternative, env);
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
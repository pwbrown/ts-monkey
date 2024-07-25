import {
  Obj,
  IntegerObj,
  BooleanObj,
  ReturnValueObj,
  ErrorObj,
  NullObj,
  FunctionObj,
  StringObj,
  BuiltinObj,
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
  FunctionLiteral,
  CallExpression,
  Expression,
  StringLiteral,
} from '../ast/ast';
import { Environment } from '../object/environment';

/** Objects that are constant in nature */
export const ConstObj = {
  true: new BooleanObj(true),
  false: new BooleanObj(false),
  null: new NullObj(),
}

/** Builtin Functions */
const BUILTINS: { [name: string]: BuiltinObj } = {
  'len': new BuiltinObj((...args: Obj[]) => {
    if (args.length !== 1) {
      return newError(`wrong number of arguments. got=${args.length}, want=1`);
    }
    const arg = args[0];
    if (arg instanceof StringObj) {
      return new IntegerObj(arg.value.length);
    }
    return newError(`argument to \`len\` not supported, got ${arg.type()}`);
  }),
};

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
  if (node instanceof StringLiteral) {
    return new StringObj(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return boolToBooleanObj(node.value);
  }
  if (node instanceof FunctionLiteral) {
    return new FunctionObj(
      node.parameters || [],
      node.body!,
      env,
    )
  }
  if (node instanceof CallExpression) {
    const func = evaluate(node.func, env);
    if (isError(func)) {
      return func;
    }
    const args = evalExpressions(node.args, env);
    if (args.length === 1 && isError(args[0])) {
      return args[0];
    }

    return applyFunction(func, args);
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

/** Evaluate a list of expressions */
const evalExpressions = (exps: Expression[] | null, env: Environment): Obj[] => {
  const results: Obj[] = [];

  for (const exp of exps || []) {
    const evaluated = evaluate(exp, env);
    if (isError(evaluated)) {
      return [evaluated];
    }
    results.push(evaluated);
  }

  return results;
}

/** Evaluate identifiers */
const evalIdentifier = (identifier: Identifier, env: Environment): Obj => {
  const name = identifier.value;
  return (
    env.get(name) ||
    BUILTINS[name] ||
    newError(`identifier not found: ${identifier.value}`)
  );
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
  } else if (left instanceof StringObj && right instanceof StringObj) {
    return evalStringInfixExpression(operator, left, right);
  }else if (operator === '==') {
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

/** Evaluate string infix expression */
const evalStringInfixExpression = (operator: string, left: StringObj, right: StringObj): Obj => {
  if (operator !== '+') {
    return newError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
  }
  return new StringObj(left.value + right.value);
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

/** Apply a function with arguments */
const applyFunction = (func: Obj, args: Obj[]): Obj => {
  /** Handle stored function */
  if (func instanceof FunctionObj) {
    const extEnv = extendFunctionEnv(func, args);
    const evaluated = evaluate(func.body, extEnv);
    return unwrapReturnValue(evaluated);
  }
  /** Handle builtin function */
  if (func instanceof BuiltinObj) {
    return func.func(...args);
  }
  return newError(`not a function: ${func.type()}`);
}

/** Extend a function's environment */
const extendFunctionEnv = (func: FunctionObj, args: Obj[]): Environment => {
  const env = new Environment(func.env);

  for (const [i, param] of func.parameters.entries()) {
    env.set(param.value, args[i]);
  }

  return env;
}

/** Unwrap an object's return value if it is a return value object */
const unwrapReturnValue = (obj: Obj): Obj => {
  if (obj instanceof ReturnValueObj) {
    return obj.value;
  }

  return obj;
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
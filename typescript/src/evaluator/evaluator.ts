import {
    Node,
    Program,
    IntegerLiteral,
    ExpressionStatement,
    BooleanLiteral,
    PrefixExpression,
    InfixExpression,
    IfExpression,
    BlockStatement,
    LetStatement,
    ReturnStatement,
    FunctionLiteral,
    CallExpression,
    Identifier,
    StringLiteral,
    ArrayLiteral,
} from "../ast";
import {
    Object,
    ObjectTypes,
    Null,
    Error,
    Integer,
    Boolean,
    String,
    Array,
    Function,
    Environment,
    ReturnValue,
    Builtin,
} from "../object";
import { Builtins } from "./builtin";

export const NULL = new Null();
export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

export class Evaluator {
    public eval(node: Node, env: Environment): Object {
        switch (node.constructor) {
            case Program:
                return this.evalProgram(node as Program, env);

            case ExpressionStatement:
                return this.eval((node as ExpressionStatement).expression, env);

            case IntegerLiteral:
                return this.evalIntegerLiteral(node as IntegerLiteral);

            case BooleanLiteral:
                return this.evalBooleanLiteral(node as BooleanLiteral);

            case PrefixExpression: {
                const prefixExpression = node as PrefixExpression;
                const right = this.eval(prefixExpression.right, env);

                if (right.type === ObjectTypes.ERROR) {
                    return right;
                }

                return this.evalPrefixExpression(
                    prefixExpression.operator,
                    right,
                );
            }

            case InfixExpression: {
                const infixExpression = node as InfixExpression;

                const left = this.eval(infixExpression.left, env);
                if (left.type == ObjectTypes.ERROR) {
                    return left;
                }

                const right = this.eval(infixExpression.right, env);
                if (right.type == ObjectTypes.ERROR) {
                    return right;
                }

                return this.evalInfixExpression(
                    infixExpression.operator,
                    left,
                    right,
                );
            }

            case IfExpression:
                return this.evalIfExpression(node as IfExpression, env);

            case BlockStatement:
                return this.evalBlockStatement(node as BlockStatement, env);

            case LetStatement:
                return this.evalLetStatement(node as LetStatement, env);

            case Identifier:
                return this.evalIdentifier(node as Identifier, env);

            case FunctionLiteral:
                return this.evalFunctionLiteral(node as FunctionLiteral, env);

            case ReturnStatement:
                return this.evalReturnStatement(node as ReturnStatement, env);

            case CallExpression:
                return this.evalCallExpression(node as CallExpression, env);

            case StringLiteral:
                return this.evalStringLiteral(node as StringLiteral);

            case ArrayLiteral:
                return this.evalArrayLiteral(node as ArrayLiteral, env);

            default:
                return NULL;
        }
    }

    private evalProgram(node: Program, env: Environment): Object {
        let result: Object = NULL;

        for (let statement of node.statements) {
            result = this.eval(statement, env);

            if (result.type === ObjectTypes.RETURN_VALUE) {
                return (result as ReturnValue).value;
            }

            if (result.type === ObjectTypes.ERROR) {
                return result;
            }
        }

        return result;
    }

    private evalIntegerLiteral(node: IntegerLiteral): Object {
        return new Integer(node.value);
    }

    private evalBooleanLiteral(node: BooleanLiteral): Object {
        return node.value ? TRUE : FALSE;
    }

    private evalPrefixExpression(operator: string, right: Object): Object {
        switch (operator) {
            case "!":
                return this.evalBangPrefixExpression(right);
            case "-":
                return this.evalMinusPrefixExpression(right);
            default:
                return this.newError(
                    `unknown operator: ${operator}${right.type}`,
                );
        }
    }

    private evalBangPrefixExpression(right: Object): Object {
        switch (right) {
            case TRUE:
                return FALSE;
            case FALSE:
                return TRUE;
            case NULL:
                return TRUE;
            default:
                return FALSE;
        }
    }

    private evalMinusPrefixExpression(right: Object): Object {
        if (right.type !== ObjectTypes.INTEGER) {
            return this.newError(`unknown operator: -${right.type}`);
        }

        return new Integer(-(right as Integer).value);
    }

    private evalInfixExpression(
        operator: string,
        left: Object,
        right: Object,
    ): Object {
        if (
            left.type === ObjectTypes.INTEGER &&
            right.type === ObjectTypes.INTEGER
        ) {
            return this.evalIntegerInfixExpression(operator, left, right);
        }

        if (operator === "==") {
            return left === right ? TRUE : FALSE;
        }

        if (operator === "!=") {
            return left !== right ? TRUE : FALSE;
        }

        if (left.type !== right.type) {
            return this.newError(
                `type mismatch: ${left.type} ${operator} ${right.type}`,
            );
        }

        return this.newError(
            `unknown operator: ${left.type} ${operator} ${right.type}`,
        );
    }

    private evalIntegerInfixExpression(
        operator: string,
        left: Object,
        right: Object,
    ): Object {
        const leftValue = (left as Integer).value;
        const rightValue = (right as Integer).value;

        switch (operator) {
            case "+":
                return new Integer(leftValue + rightValue);
            case "-":
                return new Integer(leftValue - rightValue);
            case "*":
                return new Integer(leftValue * rightValue);
            case "/":
                return new Integer(leftValue / rightValue);
            case "<":
                return leftValue < rightValue ? TRUE : FALSE;
            case ">":
                return leftValue > rightValue ? TRUE : FALSE;
            case "==":
                return leftValue === rightValue ? TRUE : FALSE;
            case "!=":
                return leftValue !== rightValue ? TRUE : FALSE;
            default:
                return this.newError(
                    `unknown operator: ${left.type} ${operator} ${right.type}`,
                );
        }
    }

    private evalIfExpression(ie: IfExpression, env: Environment): Object {
        const condition = this.eval(ie.condition, env);

        if (condition.type === ObjectTypes.ERROR) {
            return condition;
        }

        if (this.isTruthy(condition)) {
            return this.eval(ie.consequence, env);
        }

        if (ie.alternative) {
            return this.eval(ie.alternative, env);
        }

        return NULL;
    }

    private evalBlockStatement(node: BlockStatement, env: Environment): Object {
        let result: Object = NULL;

        for (let statement of node.statements) {
            result = this.eval(statement, env);

            if (
                result.type === ObjectTypes.RETURN_VALUE ||
                result.type === ObjectTypes.ERROR
            ) {
                return result;
            }
        }

        return result;
    }

    private evalLetStatement(node: LetStatement, env: Environment): Object {
        const value = this.eval(node.value, env);

        if (value.type === ObjectTypes.ERROR) {
            return value;
        }

        env.set(node.name.value, value);

        return NULL;
    }

    private evalIdentifier(node: Identifier, env: Environment): Object {
        const value = env.get(node.value);

        if (value) {
            return value;
        }

        const builtin = Builtins[node.value];
        if (builtin) {
            return new Builtin(builtin);
        }

        return this.newError(`identifier not found: ${node.value}`);
    }

    private evalReturnStatement(
        node: ReturnStatement,
        env: Environment,
    ): Object {
        const value = this.eval(node.value, env);
        if (value.type === ObjectTypes.ERROR) {
            return value;
        }

        return new ReturnValue(value);
    }

    private evalFunctionLiteral(
        node: FunctionLiteral,
        env: Environment,
    ): Object {
        return new Function(node.parameters, node.body, env);
    }

    private evalCallExpression(node: CallExpression, env: Environment): Object {
        const func = this.eval(node.function, env);

        if (func.type === ObjectTypes.ERROR) {
            return func;
        }

        const args = node.arguments.map((arg) => this.eval(arg, env));

        if (args.length === 1 && args[0].type === ObjectTypes.ERROR) {
            return args[0];
        }

        return this.applyFunction(func, args);
    }

    private applyFunction(func: Object, args: Object[]): Object {
        switch (func.type) {
            case ObjectTypes.FUNCTION: {
                const fn = func as Function;
                const extendedEnv = new Environment(fn.env);

                for (let i = 0; i < fn.parameters.length; i++) {
                    extendedEnv.set(fn.parameters[i].value, args[i]);
                }

                const evaluated = this.eval(fn.body, extendedEnv);

                if (evaluated.type === ObjectTypes.RETURN_VALUE) {
                    return (evaluated as ReturnValue).value;
                }

                return evaluated;
            }
            case ObjectTypes.BUILTIN:
                return (func as Builtin).fn(...args);
            default:
                return this.newError(`not a function: ${func.type}`);
        }
    }

    private evalStringLiteral(node: StringLiteral): Object {
        return new String(node.value);
    }

    private evalArrayLiteral(node: ArrayLiteral, env: Environment): Object {
        const elements: Object[] = node.elements.map((e) => this.eval(e, env));

        return new Array(elements);
    }

    private newError(msg: string): Object {
        return new Error(msg);
    }

    private isTruthy(obj: Object): boolean {
        switch (obj) {
            case NULL:
                return false;
            case TRUE:
                return true;
            case FALSE:
                return false;
            default:
                return true;
        }
    }
}

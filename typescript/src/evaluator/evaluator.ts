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
} from "../ast";
import { Object, ObjectTypes, Null, Error, Integer, Boolean } from "../object";

export class Evaluator {
    private null;
    private true;
    private false;

    constructor() {
        this.null = new Null();
        this.true = new Boolean(true);
        this.false = new Boolean(false);
    }

    public eval(node: Node): Object {
        switch (node.constructor) {
            case Program:
                return this.evalProgram(node as Program);

            case ExpressionStatement:
                return this.eval((node as ExpressionStatement).expression);

            case IntegerLiteral:
                return this.evalIntegerLiteral(node as IntegerLiteral);

            case BooleanLiteral:
                return this.evalBooleanLiteral(node as BooleanLiteral);

            case PrefixExpression: {
                const prefixExpression = node as PrefixExpression;
                const right = this.eval(prefixExpression.right);

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

                const left = this.eval(infixExpression.left);
                if (left.type == ObjectTypes.ERROR) {
                    return left;
                }

                const right = this.eval(infixExpression.right);
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
                return this.evalIfExpression(node as IfExpression);

            case BlockStatement:
                return this.evalBlockStatement(node as BlockStatement);
            default:
                return this.null;
        }
    }

    private evalProgram(node: Program): Object {
        let result: Object = this.null;

        for (let statement of node.statements) {
            result = this.eval(statement);
        }

        return result;
    }

    private evalIntegerLiteral(node: IntegerLiteral): Object {
        return new Integer(node.value);
    }

    private evalBooleanLiteral(node: BooleanLiteral): Object {
        return node.value ? this.true : this.false;
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
            case this.true:
                return this.false;
            case this.false:
                return this.true;
            case this.null:
                return this.true;
            default:
                return this.false;
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
            return left === right ? this.true : this.false;
        }

        if (operator === "!=") {
            return left !== right ? this.true : this.false;
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
                return leftValue < rightValue ? this.true : this.false;
            case ">":
                return leftValue > rightValue ? this.true : this.false;
            case "==":
                return leftValue === rightValue ? this.true : this.false;
            case "!=":
                return leftValue !== rightValue ? this.true : this.false;
            default:
                return this.newError(
                    `unknown operator: ${left.type} ${operator} ${right.type}`,
                );
        }
    }

    private evalIfExpression(ie: IfExpression): Object {
        const condition = this.eval(ie.condition);

        if (condition.type === ObjectTypes.ERROR) {
            return condition;
        }

        if (this.isTruthy(condition)) {
            return this.eval(ie.consequence);
        }

        if (ie.alternative) {
            return this.eval(ie.alternative);
        }

        return this.null;
    }

    private evalBlockStatement(node: BlockStatement): Object {
        let result: Object = this.null;

        for (let statement of node.statements) {
            result = this.eval(statement);
        }

        return result;
    }

    private newError(msg: string): Object {
        return new Error(msg);
    }

    private isTruthy(obj: Object): boolean {
        switch (obj) {
            case this.null:
                return false;
            case this.true:
                return true;
            case this.false:
                return false;
            default:
                return true;
        }
    }
}
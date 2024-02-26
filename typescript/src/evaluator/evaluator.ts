import { Node, Program, IntegerLiteral, ExpressionStatement, BooleanLiteral, PrefixExpression } from "../ast";
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

            case PrefixExpression:
                const prefixExpression = node as PrefixExpression;
                const right = this.eval(prefixExpression.right);

                if (right.type === ObjectTypes.ERROR) {
                    return right;
                }

                return this.evalPrefixExpression(prefixExpression.operator, right);

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
                return this.newError(`unknown operator: ${operator}${right.type}`);
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

    private newError(msg: string): Object {
        return new Error(msg);
    }
}

import { Node, Program, IntegerLiteral, ExpressionStatement } from "../ast";
import { Integer, Object, Null } from "../object";

export class Evaluator {
    private nullObject;

    constructor() {
        this.nullObject = new Null();
    }

    public eval(node: Node): Object {
        switch (node.constructor) {
            case Program:
                return this.evalProgram(node as Program);
            case ExpressionStatement:
                return this.eval((node as ExpressionStatement).expression);
            case IntegerLiteral:
                return this.evalIntegerLiteral(node as IntegerLiteral);

            default:
                return this.nullObject;
        }
    }

    private evalProgram(node: Program): Object {
        let result: Object = this.nullObject;

        for (let statement of node.statements) {
            result = this.eval(statement);
        }

        return result;
    }

    private evalIntegerLiteral(node: IntegerLiteral): Object {
        return new Integer(node.value);
    }
}

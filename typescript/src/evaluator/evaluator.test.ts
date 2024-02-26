import { Evaluator } from "./evaluator";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { Object, ObjectTypes, Integer, Boolean } from "../object";

test("evaluateIntegerLiteral", () => {
    const testCases = [
        { input: "5", expected: 5 },
        { input: "10", expected: 10 },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        testIntegerObject(evaluated, expected);
    }
});

test("evaluateBooleanLiteral", () => {
    const testCases = [
        { input: "true", expected: true },
        { input: "false", expected: false },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        testBooleanObject(evaluated, expected);
    }
});

test("evaluateBangOperator", () => {
    const testCases = [
        { input: "!true", expected: false },
        { input: "!false", expected: true },
        { input: "!5", expected: false },
        { input: "!!true", expected: true },
        { input: "!!false", expected: false },
        { input: "!!5", expected: true },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        testBooleanObject(evaluated, expected);
    }
});

function evaluate(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    return evaluator.eval(program);
}

function testIntegerObject(obj: Object, expected: number) {
    expect(obj).toBeInstanceOf(Integer);

    const intObj = obj as Integer;
    expect(intObj.value).toBe(expected);
    expect(intObj.type).toBe(ObjectTypes.INTEGER);
}

function testBooleanObject(obj: Object, expected: boolean) {
    expect(obj).toBeInstanceOf(Boolean);

    const boolObj = obj as Boolean;
    expect(boolObj.value).toBe(expected);
    expect(boolObj.type).toBe(ObjectTypes.BOOLEAN);
}


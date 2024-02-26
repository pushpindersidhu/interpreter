import { Evaluator } from "./evaluator";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { Object, ObjectTypes, Integer } from "../object";

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

import { Evaluator } from "./evaluator";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import {
    Object,
    ObjectTypes,
    Integer,
    Error,
    Boolean,
    Environment,
    Function,
    String,
    Array,
} from "../object";

test("evaluateIntegerLiteral", () => {
    const testCases = [
        { input: "5", expected: 5 },
        { input: "10", expected: 10 },
        { input: "-5", expected: -5 },
        { input: "-10", expected: -10 },
        { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
        { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
        { input: "-50 + 100 + -50", expected: 0 },
        { input: "5 * 2 + 10", expected: 20 },
        { input: "5 + 2 * 10", expected: 25 },
        { input: "20 + 2 * -10", expected: 0 },
        { input: "50 / 2 * 2 + 10", expected: 60 },
        { input: "2 * (5 + 10)", expected: 30 },
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
        { input: "1 < 2", expected: true },
        { input: "1 > 2", expected: false },
        { input: "1 < 1", expected: false },
        { input: "1 > 1", expected: false },
        { input: "1 == 1", expected: true },
        { input: "1 != 1", expected: false },
        { input: "1 == 2", expected: false },
        { input: "1 != 2", expected: true },
        { input: "true == true", expected: true },
        { input: "false == false", expected: true },
        { input: "true == false", expected: false },
        { input: "true != false", expected: true },
        { input: "false != true", expected: true },
        { input: "(1 < 2) == true", expected: true },
        { input: "(1 < 2) == false", expected: false },
        { input: "(1 > 2) == true", expected: false },
        { input: "(1 > 2) == false", expected: true },
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

test("evaluateIfElseExpressions", () => {
    const testCases = [
        { input: "if (true) { 10 }", expected: 10 },
        { input: "if (false) { 10 }", expected: null },
        { input: "if (1) { 10 }", expected: 10 },
        { input: "if (1 < 2) { 10 }", expected: 10 },
        { input: "if (1 > 2) { 10 }", expected: null },
        { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
        { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        if (expected === null) {
            expect(evaluated.type).toBe(ObjectTypes.NULL);
        } else {
            testIntegerObject(evaluated, expected);
        }
    }
});

test("evaluateLetStatements", () => {
    const testCases = [
        { input: "let a = 5; a;", expected: 5 },
        { input: "let a = 5 * 5; a;", expected: 25 },
        { input: "let a = 5; let b = a; b;", expected: 5 },
        { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        testIntegerObject(evaluated, expected);
    }
});

test("evaluateReturnStatements", () => {
    const testCases = [
        { input: "return 10;", expected: 10 },
        { input: "return 10; 9;", expected: 10 },
        { input: "return 2 * 5; 9;", expected: 10 },
        { input: "9; return 2 * 5; 9;", expected: 10 },
        {
            input: `
            if (10 > 1) {
                if (10 > 1) {
                    return 10;
                }

                return 1;
            }
            `,
            expected: 10,
        },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        testIntegerObject(evaluated, expected);
    }
});

test("functionObject", () => {
    const input = "fn(x) { x + 2; }";
    const evaluated = evaluate(input);

    expect(evaluated).toBeInstanceOf(Function);

    const fn = evaluated as Function;

    const parameters = fn.parameters;
    expect(parameters.length).toBe(1);
    expect(parameters[0].value).toBe("x");

    const body = fn.body;
    expect(body.toString()).toBe("(x + 2)");
});

test("evaluateCallExpressions", () => {
    const testCases = [
        { input: "let func = fn(x) { x; }; func(5);", expected: 5 },
        { input: "let func = fn(x) { return x; }; func(5);", expected: 5 },
        { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
        { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
        {
            input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
            expected: 20,
        },
        { input: "fn(x) { x; }(5)", expected: 5 },
    ];

    for (const { input, expected } of testCases) {
        const evaluated = evaluate(input);
        testIntegerObject(evaluated, expected);
    }
});

test("closures", () => {
    const input = `
    let newAdder = fn(x) {
        fn(y) { x + y; };
    };

    let addTwo = newAdder(2);
    addTwo(2);
    `;

    const evaluated = evaluate(input);
    testIntegerObject(evaluated, 4);
});

test("stringLiteral", () => {
    const input = `"Hello World!"`;
    const evaluated = evaluate(input);

    expect(evaluated).toBeInstanceOf(Object);

    const obj = evaluated as Object;
    expect(obj.type).toBe(ObjectTypes.STRING);

    const strObj = obj as String;
    expect(strObj.value).toBe("Hello World!");
});

test("arrayLiteral", () => {
    const input = "[1, 2 * 2, 3 + 3]";
    const evaluated = evaluate(input);

    expect(evaluated).toBeInstanceOf(Object);

    const obj = evaluated as Object;
    expect(obj.type).toBe(ObjectTypes.ARRAY);

    const arrObj = obj as Array;
    expect(arrObj.elements.length).toBe(3);
    testIntegerObject(arrObj.elements[0], 1);
    testIntegerObject(arrObj.elements[1], 4);
    testIntegerObject(arrObj.elements[2], 6);
});

describe("builtinFunctions", () => {
    test("len", () => {
        const testCases = [
            { input: `len("")`, expected: 0 },
            { input: `len("hello world")`, expected: 11 },
            {
                input: `len(1)`,
                expected: "type INTEGER has no method len",
            },
            {
                input: `len("one", "two")`,
                expected: "invalid number of arguments. expected 1, got 2",
            },
            {
                input: `len([1, 2, 3])`,
                expected: 3,
            },
            {
                input: `len([])`,
                expected: 0,
            },
            {
                input: `len([1, 2, 3], [1, 2, 3])`,
                expected: "invalid number of arguments. expected 1, got 2",
            },
            {
                input: `len([[1, 2, 3], [1, 2, 3]])`,
                expected: 2,
            },
        ];

        for (const { input, expected } of testCases) {
            const evaluated = evaluate(input);
            switch (typeof expected) {
                case "number":
                    testIntegerObject(evaluated, expected);
                    break;
                case "string":
                    expect(evaluated).toBeInstanceOf(Error);
                    expect((evaluated as Error).msg).toBe(expected);
                    break;
            }
        }
    });

    test("first", () => {
        const testCases = [
            { input: `first([1, 2, 3])`, expected: 1 },
            { input: `first([])`, expected: null },
            { input: `first(1)`, expected: "type INTEGER has no method first" },
            {
                input: `first([1, 2], [3, 4])`,
                expected: "invalid number of arguments. expected 1, got 2",
            },
        ];

        for (const { input, expected } of testCases) {
            const evaluated = evaluate(input);
            switch (typeof expected) {
                case "number":
                    testIntegerObject(evaluated, expected);
                    break;
                case "string":
                    expect(evaluated).toBeInstanceOf(Error);
                    expect((evaluated as Error).msg).toBe(expected);
                    break;
            }
        }
    });

    test("last", () => {
        const testCases = [
            { input: `last([1, 2, 3])`, expected: 3 },
            { input: `last([])`, expected: null },
            { input: `last(1)`, expected: "type INTEGER has no method last" },
            {
                input: `last([1, 2], [3, 4])`,
                expected: "invalid number of arguments. expected 1, got 2",
            },
        ];

        for (const { input, expected } of testCases) {
            const evaluated = evaluate(input);
            switch (typeof expected) {
                case "number":
                    testIntegerObject(evaluated, expected);
                    break;
                case "string":
                    expect(evaluated).toBeInstanceOf(Error);
                    expect((evaluated as Error).msg).toBe(expected);
                    break;
            }
        }
    });

    test("rest", () => {
        const testCases = [
            { input: `rest([1, 2, 3])`, expected: [2, 3] },
            { input: `rest(1)`, expected: "type INTEGER has no method rest" },
            {
                input: `rest([1, 2], [3, 4])`,
                expected: "invalid number of arguments. expected 1, got 2",
            },
        ];

        for (const { input, expected } of testCases) {
            const evaluated = evaluate(input);
            switch (typeof expected) {
                case "object":
                    const arr = expected as number[];
                    expect(evaluated).toBeInstanceOf(Array);
                    const arrObj = evaluated as Array;
                    expect(arrObj.elements.length).toBe(arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        testIntegerObject(arrObj.elements[i], arr[i]);
                    }
                    break;
                case "string":
                    expect(evaluated).toBeInstanceOf(Error);
                    expect((evaluated as Error).msg).toBe(expected);
                    break;
            }
        }
    });

    test("push", () => {
        const testCases = [
            { input: `push([1, 2, 3], 4)`, expected: [1, 2, 3, 4] },
            { input: `push([], 1)`, expected: [1] },
            {
                input: `push(1, 1)`,
                expected: "type INTEGER has no method push",
            },
            {
                input: `push([1, 2], [3, 4], 5)`,
                expected: "invalid number of arguments. expected 2, got 3",
            },
        ];

        for (const { input, expected } of testCases) {
            const evaluated = evaluate(input);
            switch (typeof expected) {
                case "object":
                    const arr = expected as number[];
                    expect(evaluated).toBeInstanceOf(Array);
                    const arrObj = evaluated as Array;
                    expect(arrObj.elements.length).toBe(arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        testIntegerObject(arrObj.elements[i], arr[i]);
                    }
                    break;
                case "string":
                    expect(evaluated).toBeInstanceOf(Error);
                    expect((evaluated as Error).msg).toBe(expected);
                    break;
            }
        }
    });
});

function evaluate(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const evaluator = new Evaluator();
    const env = new Environment();

    return evaluator.eval(program, env);
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

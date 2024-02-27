import { Lexer } from "../lexer";
import { Parser } from "./parser";
import {
    Program,
    Statement,
    LetStatement,
    ReturnStatement,
    Expression,
    Identifier,
    IntegerLiteral,
    BooleanLiteral,
    ExpressionStatement,
    PrefixExpression,
    InfixExpression,
    IfExpression,
    BlockStatement,
    FunctionLiteral,
    CallExpression,
    StringLiteral,
    ArrayLiteral,
} from "../ast";
import { Tokens } from "../token";

test("parseLetStatement", function () {
    const testCases = [
        {
            input: "let x = 7;",
            ident: "x",
            value: 7,
        },
        {
            input: "let y = 13;",
            ident: "y",
            value: 13,
        },
        {
            input: "let y = true;",
            ident: "y",
            value: true,
        },
        {
            input: "let foo = bar;",
            ident: "foo",
            value: "bar",
        },
    ];

    for (const { input, ident, value } of testCases) {
        const program = parseProgram(input);
        expect(program.statements.length).toBe(1);

        const stmt = program.statements[0];
        testLetStatement(stmt, ident, value);
    }
});

test("parseReturnStatement", function () {
    const testCases = [
        {
            input: "return foo;",
            returnValue: "foo",
        },
        {
            input: "return 7;",
            returnValue: 7,
        },
        {
            input: "return true;",
            returnValue: true,
        },
        {
            input: "return false;",
            returnValue: false,
        },
    ];

    for (const { input, returnValue } of testCases) {
        const program = parseProgram(input);
        expect(program.statements.length).toBe(1);

        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ReturnStatement);

        const returnStmt = stmt as ReturnStatement;
        expect(returnStmt.token.type).toBe(Tokens.RETURN);
        testLiteralExpression(returnStmt.value, returnValue);
    }
});

test("parseIdentifierExpression", function () {
    const input = "foobar;";

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exprStmt = stmt as ExpressionStatement;
    testIdentifier(exprStmt.expression, "foobar");
});

test("parseIntegerLiteralExpression", function () {
    const input = "7;";

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    testIntegerLiteral((stmt as ExpressionStatement).expression, 7);
});

test("parseBooleanLiteralExpression", function () {
    const testCases = [
        { input: "true;", value: true },
        { input: "false;", value: false },
    ];

    for (const { input, value } of testCases) {
        const program = parseProgram(input);
        expect(program.statements.length).toBe(1);

        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ExpressionStatement);

        testBooleanLiteral((stmt as ExpressionStatement).expression, value);
    }
});

test("parsePrefixExpression", function () {
    const testCases = [
        { input: "!5;", operator: "!", value: 5 },
        { input: "-15;", operator: "-", value: 15 },
        { input: "!true;", operator: "!", value: true },
        { input: "!false;", operator: "!", value: false },
    ];

    for (const { input, operator, value } of testCases) {
        const program = parseProgram(input);
        expect(program.statements.length).toBe(1);

        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ExpressionStatement);

        const exprStmt = stmt as ExpressionStatement;
        expect(exprStmt.expression).toBeInstanceOf(PrefixExpression);

        const prefix = exprStmt.expression as PrefixExpression;
        expect(prefix.operator).toBe(operator);
        testLiteralExpression(prefix.right, value);
    }
});

test("parseInfixExpression", function () {
    const testCases = [
        { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
        { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
        { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
        { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
        { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
        { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
        { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
        { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
        {
            input: "true == true;",
            leftValue: true,
            operator: "==",
            rightValue: true,
        },
        {
            input: "true != false;",
            leftValue: true,
            operator: "!=",
            rightValue: false,
        },
        {
            input: "false == false;",
            leftValue: false,
            operator: "==",
            rightValue: false,
        },
    ];

    for (const { input, leftValue, operator, rightValue } of testCases) {
        const program = parseProgram(input);

        expect(program.statements.length).toBe(1);

        const stmt = program.statements[0];
        expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

        const exprStmt = stmt as ExpressionStatement;
        expect(exprStmt.expression).toBeInstanceOf(InfixExpression);

        const infix = exprStmt.expression as InfixExpression;
        testLiteralExpression(infix.left, leftValue);
        expect(infix.operator).toBe(operator);
        testLiteralExpression(infix.right, rightValue);
    }
});

test("parseOperatorPrecedence", function () {
    const testCases = [
        { input: "-a * b;", expected: "((-a) * b)" },
        { input: "!-a;", expected: "(!(-a))" },
        { input: "a + b + c;", expected: "((a + b) + c)" },
        { input: "a + b - c;", expected: "((a + b) - c)" },
        { input: "a * b * c;", expected: "((a * b) * c)" },
        { input: "a * b / c;", expected: "((a * b) / c)" },
        { input: "a + b / c;", expected: "(a + (b / c))" },
        {
            input: "a + b * c + d / e - f;",
            expected: "(((a + (b * c)) + (d / e)) - f)",
        },
        { input: "3 + 4; -5 * 5;", expected: "(3 + 4)((-5) * 5)" },
        { input: "5 > 4 == 3 < 4;", expected: "((5 > 4) == (3 < 4))" },
        { input: "5 < 4 != 3 > 4;", expected: "((5 < 4) != (3 > 4))" },
        {
            input: "3 + 4 * 5 == 3 * 1 + 4 * 5;",
            expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        },
        { input: "true;", expected: "true" },
        { input: "false;", expected: "false" },
        { input: "3 > 5 == false;", expected: "((3 > 5) == false)" },
        { input: "3 < 5 == true;", expected: "((3 < 5) == true)" },
        { input: "1 + (2 + 3) + 4;", expected: "((1 + (2 + 3)) + 4)" },
        { input: "(5 + 5) * 2;", expected: "((5 + 5) * 2)" },
        { input: "2 / (5 + 5);", expected: "(2 / (5 + 5))" },
        { input: "-(5 + 5);", expected: "(-(5 + 5))" },
        { input: "!(true == true);", expected: "(!(true == true))" },
    ];

    for (const { input, expected } of testCases) {
        const program = parseProgram(input);
        expect(program.toString()).toBe(expected);
    }
});

test("parseIfExpression", function () {
    const input = "if (foo > bar) { foo }";

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exprStmt = stmt as ExpressionStatement;
    expect(exprStmt.expression).toBeInstanceOf(IfExpression);

    const ifExpr = exprStmt.expression as IfExpression;

    testInfixExpression(ifExpr.condition, "foo", ">", "bar");
    expect(ifExpr.consequence.statements.length).toBe(1);

    const consequence = ifExpr.consequence;
    expect(consequence).toBeInstanceOf(BlockStatement);

    const block = consequence as BlockStatement;
    expect(block.statements.length).toBe(1);

    const blockStmt = block.statements[0];
    expect(blockStmt).toBeInstanceOf(ExpressionStatement);

    testIdentifier((blockStmt as ExpressionStatement).expression, "foo");
    expect(ifExpr.alternative).toBeNull();
});

test("parseIfElseExpression", function () {
    const input = "if (foo > bar) { foo } else { bar }";

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exprStmt = stmt as ExpressionStatement;
    expect(exprStmt.expression).toBeInstanceOf(IfExpression);

    const ifExpr = exprStmt.expression as IfExpression;

    testInfixExpression(ifExpr.condition, "foo", ">", "bar");

    const consequence = ifExpr.consequence;
    expect(consequence).toBeInstanceOf(BlockStatement);

    const block = consequence as BlockStatement;
    expect(block.statements.length).toBe(1);

    const blockStmt = block.statements[0];
    expect(blockStmt).toBeInstanceOf(ExpressionStatement);

    testIdentifier((blockStmt as ExpressionStatement).expression, "foo");

    expect(ifExpr.alternative).not.toBeNull();

    const alternative = ifExpr.alternative!;
    expect(alternative).toBeInstanceOf(BlockStatement);

    const altBlock = alternative as BlockStatement;
    expect(altBlock.statements.length).toBe(1);

    const altBlockStmt = altBlock.statements[0];
    expect(altBlockStmt).toBeInstanceOf(ExpressionStatement);

    testIdentifier((altBlockStmt as ExpressionStatement).expression, "bar");
});

test("parseFunctionLiteral", function () {
    const input = "fn(x, y) { x + y; }";

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exprStmt = stmt as ExpressionStatement;
    expect(exprStmt.expression).toBeInstanceOf(FunctionLiteral);

    const functionLiteral = exprStmt.expression as FunctionLiteral;

    expect(functionLiteral.parameters.length).toBe(2);
    testIdentifier(functionLiteral.parameters[0], "x");
    testIdentifier(functionLiteral.parameters[1], "y");

    const body = functionLiteral.body;
    expect(body).toBeInstanceOf(BlockStatement);
    expect(body.statements.length).toBe(1);

    const bodyStmt = body.statements[0];
    expect(bodyStmt).toBeInstanceOf(ExpressionStatement);

    testInfixExpression(
        (bodyStmt as ExpressionStatement).expression,
        "x",
        "+",
        "y",
    );
});

test("parseCallExpression", function () {
    const input = "add(1, 2 * 3, 4 + 5);";

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exprStmt = stmt as ExpressionStatement;
    expect(exprStmt.expression).toBeInstanceOf(CallExpression);

    const call = exprStmt.expression as CallExpression;
    testIdentifier(call.function, "add");
    expect(call.arguments.length).toBe(3);
    testLiteralExpression(call.arguments[0], 1);
    testInfixExpression(call.arguments[1], 2, "*", 3);
    testInfixExpression(call.arguments[2], 4, "+", 5);
});

test("parseStringLiteral", function () {
    const input = `"hello world"`;

    const program = parseProgram(input);
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exprStmt = stmt as ExpressionStatement;
    expect(exprStmt.expression).toBeInstanceOf(StringLiteral);

    const str = exprStmt.expression as StringLiteral;
    expect(str.value).toBe("hello world");
});

test("parseArrayLiteral", function () {
    const input = "[1, 2 * 2, 3 + 3]";
    const program = parseProgram(input);

    const stmt = program.statements[0];
    const array = stmt as ExpressionStatement;
    expect(array.expression).toBeInstanceOf(ArrayLiteral);

    const elements = (array.expression as ArrayLiteral).elements;
    expect(elements.length).toBe(3);
    testIntegerLiteral(elements[0], 1);
    testInfixExpression(elements[1], 2, "*", 2);
    testInfixExpression(elements[2], 3, "+", 3);
});

function parseProgram(input: string): Program {
    const lexer: Lexer = new Lexer(input);
    const parser: Parser = new Parser(lexer);
    const program: Program = parser.parseProgram();
    const errors = parser.errors;

    if (errors.length > 0) {
        for (const error of errors) {
            console.error("parser error:", error);
        }

        throw new Error(`parser has ${errors.length} errors`);
    }

    return program;
}

function testLetStatement(
    stmt: Statement,
    expectedIdent: string,
    expectedValue: any,
) {
    expect(stmt.tokenLiteral()).toBe("let");
    expect(stmt).toBeInstanceOf(LetStatement);

    const letStmt = stmt as LetStatement;

    testIdentifier(letStmt.name, expectedIdent);
    testLiteralExpression(letStmt.value, expectedValue);
}

function testIdentifier(expr: Expression, expectedValue: string) {
    expect(expr).toBeInstanceOf(Identifier);

    const ident = expr as Identifier;
    expect(ident.value).toBe(expectedValue);
    expect(ident.tokenLiteral()).toBe(expectedValue);
}

function testLiteralExpression(expr: Expression, expectedValue: any) {
    switch (typeof expectedValue) {
        case "number":
            return testIntegerLiteral(expr, expectedValue as number);
        case "boolean":
            return testBooleanLiteral(expr, expectedValue as boolean);
        case "string":
            return testIdentifier(expr, expectedValue as string);
    }

    throw new Error(`type of expr not handled. got=${expr}`);
}

function testIntegerLiteral(expr: Expression, expectedValue: number) {
    expect(expr).toBeInstanceOf(IntegerLiteral);

    const il = expr as IntegerLiteral;
    expect(il.value).toBe(expectedValue);
}

function testBooleanLiteral(expr: Expression, expectedValue: boolean) {
    expect(expr).toBeInstanceOf(BooleanLiteral);

    const bl = expr as BooleanLiteral;
    expect(bl.value).toBe(expectedValue);
}

function testInfixExpression(
    expr: Expression,
    left: any,
    operator: string,
    right: any,
) {
    expect(expr).toBeInstanceOf(InfixExpression);

    const infix = expr as InfixExpression;
    testLiteralExpression(infix.left, left);
    expect(infix.operator).toBe(operator);
    testLiteralExpression(infix.right, right);
}

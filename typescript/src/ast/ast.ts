import { Token, Tokens } from "../token";

export interface Node {
    tokenLiteral(): string;
    toString(): string;
}

export interface Statement extends Node {
    statementNode(): void;
}
export interface Expression extends Node {
    expressionNode(): void;
}

export class Program implements Node {
    statements: Statement[];

    constructor() {
        this.statements = [];
    }

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        }

        return Tokens.EOF;
    }

    toString(): string {
        return this.statements.reduce((acc, stmt) => acc + stmt.toString(), "");
    }
}

export class LetStatement implements Statement {
    token: Token;
    name: Identifier;
    value: Expression;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `${this.tokenLiteral()} ${this.name.toString()} = ${this.value.toString()}`;
    }

    statementNode(): void {}
}

export class ReturnStatement implements Statement {
    token: Token;
    value: Expression;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.tokenLiteral() + " " + this.value.toString();
    }

    statementNode(): void {}
}

export class ExpressionStatement implements Statement {
    token: Token;
    expression: Expression;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.expression.toString();
    }

    statementNode(): void {}
}

export class NullStatement implements Statement {
    tokenLiteral(): string {
        return "";
    }

    toString(): string {
        return "";
    }

    statementNode(): void {}
}

export class NullExpression implements Expression {
    tokenLiteral(): string {
        return "";
    }

    toString(): string {
        return "";
    }

    expressionNode(): void {}
}

export class Identifier implements Expression {
    token: Token;
    value: string;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.value;
    }

    expressionNode(): void {}
}

export class IntegerLiteral implements Expression {
    token: Token;
    value: number;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.value.toString();
    }

    expressionNode(): void {}
}

export class BooleanLiteral implements Expression {
    token: Token;
    value: boolean;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.token.literal;
    }

    expressionNode(): void {}
}

export class PrefixExpression implements Expression {
    token: Token;
    operator: string;
    right: Expression;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `(${this.operator}${this.right.toString()})`;
    }

    expressionNode(): void {}
}

export class InfixExpression implements Expression {
    token: Token;
    left: Expression;
    operator: string;
    right: Expression;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }

    expressionNode(): void {}
}

export class BlockStatement implements Statement {
    token: Token;
    statements: Statement[];

    constructor(token: Token) {
        this.token = token;
        this.statements = [];
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.statements.reduce((acc, stmt) => acc + stmt.toString(), "");
    }

    statementNode(): void {}
}

export class IfExpression implements Expression {
    token: Token;
    condition: Expression;
    consequence: BlockStatement;
    alternative: BlockStatement | null;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `if ${this.condition.toString()} ${this.consequence.toString()}`;
    }

    expressionNode(): void {}
}

export class FunctionLiteral implements Expression {
    token: Token;
    parameters: Identifier[];
    body: BlockStatement;

    constructor(token: Token) {
        this.token = token;
        this.parameters = [];
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `
        ${this.tokenLiteral()}(${this.parameters.map((p) => p.toString()).join(", ")}) ${this.body.toString()}
        `;
    }

    expressionNode(): void {}
}

export class CallExpression implements Expression {
    token: Token;
    function: Expression;
    arguments: Expression[];

    constructor(token: Token) {
        this.token = token;
        this.arguments = [];
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `${this.function.toString()}(${this.arguments.map((a) => a.toString()).join(", ")})`;
    }

    expressionNode(): void {}
}

export class StringLiteral implements Expression {
    token: Token;
    value: string;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return this.token.literal;
    }

    expressionNode(): void {}
}

export class ArrayLiteral implements Expression {
    token: Token;
    elements: Expression[];

    constructor(token: Token) {
        this.token = token;
        this.elements = [];
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    toString(): string {
        return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
    }

    expressionNode(): void {}
}

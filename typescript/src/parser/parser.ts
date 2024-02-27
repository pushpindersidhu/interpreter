import { isError } from "util";
import {
    BlockStatement,
    BooleanLiteral,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    NullExpression,
    NullStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    CallExpression,
    StringLiteral,
    ArrayLiteral,
} from "../ast";
import { Lexer } from "../lexer";
import { Token, Tokens, TokenType } from "../token";

const LOWEST = 1,
    EQUALS = 2,
    LESSGREATER = 3,
    SUM = 4,
    PRODUCT = 5,
    PREFIX = 6,
    CALL = 7;

const precedences: { [key: string]: number } = {
    [Tokens.EQ]: EQUALS,
    [Tokens.NOT_EQ]: EQUALS,
    [Tokens.LT]: LESSGREATER,
    [Tokens.GT]: LESSGREATER,
    [Tokens.PLUS]: SUM,
    [Tokens.MINUS]: SUM,
    [Tokens.SLASH]: PRODUCT,
    [Tokens.ASTERISK]: PRODUCT,
    [Tokens.LPAREN]: CALL,
};

type prefixParseFn = () => Expression;
type infixParseFn = (expression: Expression) => Expression;

export class Parser {
    lexer: Lexer;
    program: Program;
    currToken: Token;
    peekToken: Token;
    prefixParseFns: { [key: string]: prefixParseFn };
    infixParseFns: { [key: string]: infixParseFn };
    errors: string[];
    nullExpression: NullExpression;
    nullStatement: NullStatement;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.nullExpression = new NullExpression();
        this.nullStatement = new NullStatement();

        this.prefixParseFns = {};
        this.registerPrefix(Tokens.IDENT, this.parseIdentifier.bind(this));
        this.registerPrefix(Tokens.INT, this.parseIntegerLiteral.bind(this));
        this.registerPrefix(Tokens.BANG, this.parsePrefixExpression.bind(this));
        this.registerPrefix(
            Tokens.MINUS,
            this.parsePrefixExpression.bind(this),
        );
        this.registerPrefix(Tokens.TRUE, this.parseBooleanLiteral.bind(this));
        this.registerPrefix(Tokens.FALSE, this.parseBooleanLiteral.bind(this));
        this.registerPrefix(
            Tokens.LPAREN,
            this.parseGroupedExpression.bind(this),
        );
        this.registerPrefix(Tokens.IF, this.parseIfExpression.bind(this));
        this.registerPrefix(
            Tokens.FUNCTION,
            this.parseFunctionLiteral.bind(this),
        );
        this.registerPrefix(Tokens.STRING, this.parseStringLiteral.bind(this));
        this.registerPrefix(Tokens.LBRACKET, this.parseArrayLiteral.bind(this));

        this.infixParseFns = {};
        this.registerInfix(Tokens.PLUS, this.parseInfixExpression.bind(this));
        this.registerInfix(Tokens.MINUS, this.parseInfixExpression.bind(this));
        this.registerInfix(Tokens.SLASH, this.parseInfixExpression.bind(this));
        this.registerInfix(
            Tokens.ASTERISK,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfix(Tokens.EQ, this.parseInfixExpression.bind(this));
        this.registerInfix(Tokens.NOT_EQ, this.parseInfixExpression.bind(this));
        this.registerInfix(Tokens.LT, this.parseInfixExpression.bind(this));
        this.registerInfix(Tokens.GT, this.parseInfixExpression.bind(this));
        this.registerInfix(Tokens.LPAREN, this.parseCallExpression.bind(this));

        this.errors = [];

        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        const program = new Program();
        program.statements = [];

        while (!this.currTokenIs(Tokens.EOF)) {
            const stmt = this.parseStatement();
            if (!(stmt instanceof NullStatement)) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }

        this.program = program;

        return program;
    }

    private nextToken(): void {
        this.currToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private currTokenIs(t: TokenType): boolean {
        return this.currToken.type === t;
    }

    private peekTokenIs(t: TokenType): boolean {
        return this.peekToken.type === t;
    }

    private expectPeek(t: TokenType): boolean {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        }

        return false;
    }

    private registerPrefix(tokenType: TokenType, fn: prefixParseFn): void {
        this.prefixParseFns[tokenType] = fn;
    }

    private registerInfix(tokenType: TokenType, fn: infixParseFn): void {
        this.infixParseFns[tokenType] = fn;
    }

    private newError(msg: string): void {
        this.errors.push(msg);
    }

    private currPrecedence(): number {
        const precedence = precedences[this.currToken.type];
        if (precedence) {
            return precedence;
        }

        return LOWEST;
    }

    private peekPrecedence(): number {
        const precedence = precedences[this.peekToken.type];
        if (precedence) {
            return precedence;
        }

        return LOWEST;
    }

    private parseStatement(): Statement {
        switch (this.currToken.type) {
            case Tokens.LET:
                return this.parseLetStatement();
            case Tokens.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): Statement {
        const stmt = new LetStatement(this.currToken);

        if (!this.expectPeek(Tokens.IDENT)) {
            this.newError(
                `Expected IDENT, got ${this.peekToken.type} instead.`,
            );
            return this.nullStatement;
        }

        stmt.name = this.parseIdentifier();

        if (!this.expectPeek(Tokens.ASSIGN)) {
            this.newError(
                `Expected ASSIGN, got ${this.peekToken.type} instead.`,
            );
            return this.nullStatement;
        }

        this.nextToken();

        stmt.value = this.parseExpression(LOWEST);

        if (this.peekTokenIs(Tokens.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    private parseReturnStatement(): Statement {
        const stmt = new ReturnStatement(this.currToken);

        this.nextToken();

        stmt.value = this.parseExpression(LOWEST);

        if (this.peekTokenIs(Tokens.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    private parseExpressionStatement(): Statement {
        const stmt = new ExpressionStatement(this.currToken);

        stmt.expression = this.parseExpression(LOWEST);

        if (this.peekTokenIs(Tokens.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    private parseExpression(precedence: number): Expression {
        const prefixFn = this.prefixParseFns[this.currToken.type];
        if (!prefixFn) {
            this.newError(
                `No prefix parse function found for ${this.currToken.type}`,
            );
            return this.nullExpression;
        }

        let leftExp = prefixFn();

        while (
            !this.peekTokenIs(Tokens.SEMICOLON) &&
            precedence < this.peekPrecedence()
        ) {
            const infixFn = this.infixParseFns[this.peekToken.type];
            if (!infixFn) {
                this.newError(
                    `No infix parse function found for ${this.peekToken.type}`,
                );
                return this.nullExpression;
            }

            this.nextToken();

            leftExp = infixFn(leftExp);
        }

        return leftExp;
    }

    private parseIdentifier(): Identifier {
        const ident = new Identifier(this.currToken);
        ident.value = this.currToken.literal;

        return ident;
    }

    private parseIntegerLiteral(): IntegerLiteral {
        const il = new IntegerLiteral(this.currToken);
        il.value = parseInt(this.currToken.literal);

        return il;
    }

    private parseBooleanLiteral(): Expression {
        const bl = new BooleanLiteral(this.currToken);
        bl.value = this.currToken.type === Tokens.TRUE;

        return bl;
    }

    private parsePrefixExpression(): Expression {
        const exp = new PrefixExpression(this.currToken);
        exp.operator = this.currToken.literal;

        this.nextToken();

        const right = this.parseExpression(PREFIX);
        if (right instanceof NullExpression) {
            this.newError(
                `Expected expression, got ${this.peekToken.type} instead.`,
            );
            return this.nullExpression;
        }

        exp.right = right;

        return exp;
    }

    private parseInfixExpression(left: Expression): Expression {
        const infixExpr = new InfixExpression(this.currToken);
        infixExpr.left = left;
        infixExpr.operator = this.currToken.literal;

        const precedence = this.currPrecedence();

        this.nextToken();

        infixExpr.right = this.parseExpression(precedence);

        return infixExpr;
    }

    private parseGroupedExpression(): Expression {
        this.nextToken();

        const expr = this.parseExpression(LOWEST);

        if (!this.expectPeek(Tokens.RPAREN)) {
            return this.nullExpression;
        }

        return expr;
    }

    private parseBlockStatement(): BlockStatement {
        const blockStmt = new BlockStatement(this.currToken);
        blockStmt.statements = [];

        this.nextToken();

        while (
            !this.currTokenIs(Tokens.RBRACE) &&
            !this.currTokenIs(Tokens.EOF)
        ) {
            const stmt = this.parseStatement();

            if (stmt != this.nullStatement) {
                blockStmt.statements.push(stmt);
            }

            this.nextToken();
        }

        return blockStmt;
    }

    private parseIfExpression(): Expression {
        const ifExpr = new IfExpression(this.currToken);

        if (!this.expectPeek(Tokens.LPAREN)) {
            this.newError(
                `Expected LPAREN after IF, got ${this.peekToken.type} instead.`,
            );
            return this.nullExpression;
        }

        this.nextToken();
        ifExpr.condition = this.parseExpression(LOWEST);

        if (!this.expectPeek(Tokens.RPAREN)) {
            this.newError(
                `Expected RPAREN after IF condition, got ${this.peekToken.type} instead.`,
            );
            return this.nullExpression;
        }

        if (!this.expectPeek(Tokens.LBRACE)) {
            this.newError(
                `Expected LBRACE after IF condition, got ${this.peekToken.type} instead.`,
            );
            return this.nullExpression;
        }

        ifExpr.consequence = this.parseBlockStatement();
        ifExpr.alternative = null;

        if (this.peekTokenIs(Tokens.ELSE)) {
            this.nextToken();

            if (!this.expectPeek(Tokens.LBRACE)) {
                this.newError(
                    `Expected LBRACE after ELSE, got ${this.peekToken.type} instead.`,
                );
                return this.nullExpression;
            }

            ifExpr.alternative = this.parseBlockStatement();
        }

        return ifExpr;
    }

    private parseFunctionLiteral(): Expression {
        const fl = new FunctionLiteral(this.currToken);

        if (!this.expectPeek(Tokens.LPAREN)) {
            this.newError(
                `Expected LPAREN after FUNCTION, got ${this.peekToken.type} instead.`,
            );
            return this.nullExpression;
        }

        fl.parameters = this.parseFunctionParameters();

        if (!this.expectPeek(Tokens.LBRACE)) {
            this.newError(`Expected LBRACE after FUNCTION parameters,
                          got ${this.peekToken.type} instead.`);
            return this.nullExpression;
        }

        fl.body = this.parseBlockStatement();

        return fl;
    }

    private parseFunctionParameters(): Identifier[] {
        const identifiers: Identifier[] = [];

        this.nextToken();

        if (this.currTokenIs(Tokens.RPAREN)) {
            return identifiers;
        }

        identifiers.push(this.parseIdentifier());

        while (this.peekTokenIs(Tokens.COMMA)) {
            this.nextToken();
            this.nextToken();
            identifiers.push(this.parseIdentifier());
        }

        if (!this.expectPeek(Tokens.RPAREN)) {
            this.newError(`Expected RPAREN after FUNCTION parameters,
                          got ${this.peekToken.type} instead.`);
            return [];
        }

        return identifiers;
    }

    private parseCallExpression(fn: Expression): Expression {
        const exp = new CallExpression(this.currToken);
        exp.function = fn;
        exp.arguments = this.parseExpressionList(Tokens.RPAREN);

        return exp;
    }

    private parseExpressionList(end: TokenType): Expression[] {
        const expressions: Expression[] = [];

        this.nextToken();

        if (this.currTokenIs(end)) {
            return expressions;
        }

        expressions.push(this.parseExpression(LOWEST));

        while (this.peekTokenIs(Tokens.COMMA)) {
            this.nextToken();
            this.nextToken();

            expressions.push(this.parseExpression(LOWEST));
        }

        if (!this.expectPeek(end)) {
            this.newError(
                `Expected ${end} after expression list, got ${this.peekToken.type} instead.`,
            );
            return [];
        }

        return expressions;
    }

    private parseStringLiteral(): Expression {
        const sl = new StringLiteral(this.currToken);
        sl.value = this.currToken.literal;

        return sl;
    }

    private parseArrayLiteral(): Expression {
        const al = new ArrayLiteral(this.currToken);
        al.elements = this.parseExpressionList(Tokens.RBRACKET);

        return al;
    }
}

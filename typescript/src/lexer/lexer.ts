import { Token, Tokens, TokenType, lookUpIdent } from "../token";

export function createToken(type: TokenType, literal: string): Token {
    return { type: type, literal: literal };
}

const _0 = "0".charCodeAt(0);
const _9 = "9".charCodeAt(0);

const a = "a".charCodeAt(0);
const z = "z".charCodeAt(0);

const A = "A".charCodeAt(0);
const Z = "Z".charCodeAt(0);

const _ = "_".charCodeAt(0);

function isLetter(character: string): boolean {
    const char = character.charCodeAt(0);
    return (char >= a && char <= z) || (char >= A && char <= Z) || char === _;
}

function isDigit(character: string): boolean {
    const char = character.charCodeAt(0);
    return char >= _0 && char <= _9;
}

export class Lexer {
    private input: string;
    private position: number;
    private readPosition: number;
    private ch!: string;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.readPosition = 0;

        this.readChar();
    }

    public nextToken(): Token {
        this.skipWhitespace();

        let token: Token | undefined;

        switch (this.ch) {
            case "=":
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    token = createToken(Tokens.EQ, ch + this.ch);
                } else {
                    token = createToken(Tokens.ASSIGN, this.ch);
                }
                break;
            case ";":
                token = createToken(Tokens.SEMICOLON, this.ch);
                break;
            case "(":
                token = createToken(Tokens.LPAREN, this.ch);
                break;
            case ")":
                token = createToken(Tokens.RPAREN, this.ch);
                break;
            case ",":
                token = createToken(Tokens.COMMA, this.ch);
                break;
            case "+":
                token = createToken(Tokens.PLUS, this.ch);
                break;
            case "-":
                token = createToken(Tokens.MINUS, this.ch);
                break;
            case "*":
                token = createToken(Tokens.ASTERISK, this.ch);
                break;
            case "!":
                if (this.peekChar() == "=") {
                    const ch = this.ch;
                    this.readChar();
                    token = createToken(Tokens.NOT_EQ, ch + this.ch);
                } else {
                    token = createToken(Tokens.BANG, this.ch);
                }
                break;
            case "/":
                token = createToken(Tokens.SLASH, this.ch);
                break;
            case "<":
                token = createToken(Tokens.LT, this.ch);
                break;
            case ">":
                token = createToken(Tokens.GT, this.ch);
                break;
            case "{":
                token = createToken(Tokens.LBRACE, this.ch);
                break;
            case "}":
                token = createToken(Tokens.RBRACE, this.ch);
                break;
            case "\0":
                token = createToken(Tokens.EOF, "EOF");
                break;
            default:
                if (isLetter(this.ch)) {
                    const ident: string = this.readIdentifier();
                    const type: TokenType = lookUpIdent(ident);
                    token = createToken(type, ident);
                    return token;
                } else if (isDigit(this.ch)) {
                    const ident: string = this.readNumber();
                    token = createToken(Tokens.INT, ident);
                    return token;
                } else {
                    token = createToken(Tokens.ILLEGAL, this.ch);
                }
                break;
        }

        this.readChar();

        return token as Token;
    }

    private skipWhitespace(): void {
        while (
            this.ch === " " ||
            this.ch === "\n" ||
            this.ch === "\t" ||
            this.ch === "\r"
        ) {
            this.readChar();
        }
    }

    private readIdentifier(): string {
        const position = this.position;
        while (isLetter(this.ch)) {
            this.readChar();
        }

        return this.input.slice(position, this.position);
    }

    private readNumber(): string {
        const position = this.position;
        while (isDigit(this.ch)) {
            this.readChar();
        }

        return this.input.slice(position, this.position);
    }

    private peekChar(): string {
        if (this.readPosition > this.input.length) {
            return "\0";
        }

        return this.input[this.readPosition];
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = "\0";
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition++;
    }
}

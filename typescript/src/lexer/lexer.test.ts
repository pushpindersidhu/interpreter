import { Lexer } from "./lexer";
import { Token, Tokens } from "../token";

test("nextToken()", function () {
    const input: string = `
let five = 5;
let ten = 10;

let add = fn(x, y) {
  x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;

if (5 < 10) {
	return true;
} else {
	return false;
}

10 == 10;
10 != 9;
`;

    const tokens: Token[] = [
        { type: Tokens.LET, literal: "let" },
        { type: Tokens.IDENT, literal: "five" },
        { type: Tokens.ASSIGN, literal: "=" },
        { type: Tokens.INT, literal: "5" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.LET, literal: "let" },
        { type: Tokens.IDENT, literal: "ten" },
        { type: Tokens.ASSIGN, literal: "=" },
        { type: Tokens.INT, literal: "10" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.LET, literal: "let" },
        { type: Tokens.IDENT, literal: "add" },
        { type: Tokens.ASSIGN, literal: "=" },
        { type: Tokens.FUNCTION, literal: "fn" },
        { type: Tokens.LPAREN, literal: "(" },
        { type: Tokens.IDENT, literal: "x" },
        { type: Tokens.COMMA, literal: "," },
        { type: Tokens.IDENT, literal: "y" },
        { type: Tokens.RPAREN, literal: ")" },
        { type: Tokens.LBRACE, literal: "{" },
        { type: Tokens.IDENT, literal: "x" },
        { type: Tokens.PLUS, literal: "+" },
        { type: Tokens.IDENT, literal: "y" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.RBRACE, literal: "}" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.LET, literal: "let" },
        { type: Tokens.IDENT, literal: "result" },
        { type: Tokens.ASSIGN, literal: "=" },
        { type: Tokens.IDENT, literal: "add" },
        { type: Tokens.LPAREN, literal: "(" },
        { type: Tokens.IDENT, literal: "five" },
        { type: Tokens.COMMA, literal: "," },
        { type: Tokens.IDENT, literal: "ten" },
        { type: Tokens.RPAREN, literal: ")" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.BANG, literal: "!" },
        { type: Tokens.MINUS, literal: "-" },
        { type: Tokens.SLASH, literal: "/" },
        { type: Tokens.ASTERISK, literal: "*" },
        { type: Tokens.INT, literal: "5" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.INT, literal: "5" },
        { type: Tokens.LT, literal: "<" },
        { type: Tokens.INT, literal: "10" },
        { type: Tokens.GT, literal: ">" },
        { type: Tokens.INT, literal: "5" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.IF, literal: "if" },
        { type: Tokens.LPAREN, literal: "(" },
        { type: Tokens.INT, literal: "5" },
        { type: Tokens.LT, literal: "<" },
        { type: Tokens.INT, literal: "10" },
        { type: Tokens.RPAREN, literal: ")" },
        { type: Tokens.LBRACE, literal: "{" },
        { type: Tokens.RETURN, literal: "return" },
        { type: Tokens.TRUE, literal: "true" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.RBRACE, literal: "}" },
        { type: Tokens.ELSE, literal: "else" },
        { type: Tokens.LBRACE, literal: "{" },
        { type: Tokens.RETURN, literal: "return" },
        { type: Tokens.FALSE, literal: "false" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.RBRACE, literal: "}" },
        { type: Tokens.INT, literal: "10" },
        { type: Tokens.EQ, literal: "==" },
        { type: Tokens.INT, literal: "10" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.INT, literal: "10" },
        { type: Tokens.NOT_EQ, literal: "!=" },
        { type: Tokens.INT, literal: "9" },
        { type: Tokens.SEMICOLON, literal: ";" },
        { type: Tokens.EOF, literal: "EOF" },
    ];

    const lexer: Lexer = new Lexer(input);

    for (const testToken of tokens) {
        const token: Token = lexer.nextToken();

        expect(token.type).toEqual(testToken.type);
        expect(token.literal).toEqual(testToken.literal);
    }
});

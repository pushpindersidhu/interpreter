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
        { Type: Tokens.LET, Literal: "let" },
        { Type: Tokens.IDENT, Literal: "five" },
        { Type: Tokens.ASSIGN, Literal: "=" },
        { Type: Tokens.INT, Literal: "5" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.LET, Literal: "let" },
        { Type: Tokens.IDENT, Literal: "ten" },
        { Type: Tokens.ASSIGN, Literal: "=" },
        { Type: Tokens.INT, Literal: "10" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.LET, Literal: "let" },
        { Type: Tokens.IDENT, Literal: "add" },
        { Type: Tokens.ASSIGN, Literal: "=" },
        { Type: Tokens.FUNCTION, Literal: "fn" },
        { Type: Tokens.LPAREN, Literal: "(" },
        { Type: Tokens.IDENT, Literal: "x" },
        { Type: Tokens.COMMA, Literal: "," },
        { Type: Tokens.IDENT, Literal: "y" },
        { Type: Tokens.RPAREN, Literal: ")" },
        { Type: Tokens.LBRACE, Literal: "{" },
        { Type: Tokens.IDENT, Literal: "x" },
        { Type: Tokens.PLUS, Literal: "+" },
        { Type: Tokens.IDENT, Literal: "y" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.RBRACE, Literal: "}" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.LET, Literal: "let" },
        { Type: Tokens.IDENT, Literal: "result" },
        { Type: Tokens.ASSIGN, Literal: "=" },
        { Type: Tokens.IDENT, Literal: "add" },
        { Type: Tokens.LPAREN, Literal: "(" },
        { Type: Tokens.IDENT, Literal: "five" },
        { Type: Tokens.COMMA, Literal: "," },
        { Type: Tokens.IDENT, Literal: "ten" },
        { Type: Tokens.RPAREN, Literal: ")" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.BANG, Literal: "!" },
        { Type: Tokens.MINUS, Literal: "-" },
        { Type: Tokens.SLASH, Literal: "/" },
        { Type: Tokens.ASTERISK, Literal: "*" },
        { Type: Tokens.INT, Literal: "5" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.INT, Literal: "5" },
        { Type: Tokens.LT, Literal: "<" },
        { Type: Tokens.INT, Literal: "10" },
        { Type: Tokens.GT, Literal: ">" },
        { Type: Tokens.INT, Literal: "5" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.IF, Literal: "if" },
        { Type: Tokens.LPAREN, Literal: "(" },
        { Type: Tokens.INT, Literal: "5" },
        { Type: Tokens.LT, Literal: "<" },
        { Type: Tokens.INT, Literal: "10" },
        { Type: Tokens.RPAREN, Literal: ")" },
        { Type: Tokens.LBRACE, Literal: "{" },
        { Type: Tokens.RETURN, Literal: "return" },
        { Type: Tokens.TRUE, Literal: "true" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.RBRACE, Literal: "}" },
        { Type: Tokens.ELSE, Literal: "else" },
        { Type: Tokens.LBRACE, Literal: "{" },
        { Type: Tokens.RETURN, Literal: "return" },
        { Type: Tokens.FALSE, Literal: "false" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.RBRACE, Literal: "}" },
        { Type: Tokens.INT, Literal: "10" },
        { Type: Tokens.EQ, Literal: "==" },
        { Type: Tokens.INT, Literal: "10" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.INT, Literal: "10" },
        { Type: Tokens.NOT_EQ, Literal: "!=" },
        { Type: Tokens.INT, Literal: "9" },
        { Type: Tokens.SEMICOLON, Literal: ";" },
        { Type: Tokens.EOF, Literal: "EOF" },
    ];

    const lexer: Lexer = new Lexer(input);

    for (const testToken of tokens) {
        const token: Token = lexer.nextToken();

        expect(token.Type).toEqual(testToken.Type);
        expect(token.Literal).toEqual(testToken.Literal);
    }
});

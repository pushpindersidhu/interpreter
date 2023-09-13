import { Tokenizer} from "./lexer";
import { Token, TokenType } from "../token";

test("nextToken()", function() {
    const input: string = `let five = 5;
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
        { Type: TokenType.LET, Literal: "let" },
		{ Type: TokenType.IDENT, Literal: "five" },
		{ Type: TokenType.ASSIGN, Literal: "=" },
		{ Type: TokenType.INT, Literal: "5" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.LET, Literal: "let" },
		{ Type: TokenType.IDENT, Literal: "ten" },
		{ Type: TokenType.ASSIGN, Literal: "=" },
		{ Type: TokenType.INT, Literal: "10" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.LET, Literal: "let" },
		{ Type: TokenType.IDENT, Literal: "add" },
		{ Type: TokenType.ASSIGN, Literal: "=" },
		{ Type: TokenType.FUNCTION, Literal: "fn" },
		{ Type: TokenType.LPAREN, Literal: "(" },
		{ Type: TokenType.IDENT, Literal: "x" },
		{ Type: TokenType.COMMA, Literal: "," },
		{ Type: TokenType.IDENT, Literal: "y" },
		{ Type: TokenType.RPAREN, Literal: ")" },
		{ Type: TokenType.LBRACE, Literal: "{" },
		{ Type: TokenType.IDENT, Literal: "x" },
		{ Type: TokenType.PLUS, Literal: "+" },
		{ Type: TokenType.IDENT, Literal: "y" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.RBRACE, Literal: "}" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.LET, Literal: "let" },
		{ Type: TokenType.IDENT, Literal: "result" },
		{ Type: TokenType.ASSIGN, Literal: "=" },
		{ Type: TokenType.IDENT, Literal: "add" },
		{ Type: TokenType.LPAREN, Literal: "(" },
		{ Type: TokenType.IDENT, Literal: "five" },
		{ Type: TokenType.COMMA, Literal: "," },
		{ Type: TokenType.IDENT, Literal: "ten" },
		{ Type: TokenType.RPAREN, Literal: ")" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.BANG, Literal: "!" },
		{ Type: TokenType.MINUS, Literal: "-" },
		{ Type: TokenType.SLASH, Literal: "/" },
		{ Type: TokenType.ASTERISK, Literal: "*" },
		{ Type: TokenType.INT, Literal: "5" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.INT, Literal: "5" },
		{ Type: TokenType.LT, Literal: "<" },
		{ Type: TokenType.INT, Literal: "10" },
		{ Type: TokenType.GT, Literal: ">" },
		{ Type: TokenType.INT, Literal: "5" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.IF, Literal: "if" },
		{ Type: TokenType.LPAREN, Literal: "(" },
		{ Type: TokenType.INT, Literal: "5" },
		{ Type: TokenType.LT, Literal: "<" },
		{ Type: TokenType.INT, Literal: "10" },
		{ Type: TokenType.RPAREN, Literal: ")" },
		{ Type: TokenType.LBRACE, Literal: "{" },
		{ Type: TokenType.RETURN, Literal: "return" },
		{ Type: TokenType.TRUE, Literal: "true" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.RBRACE, Literal: "}"},
		{ Type: TokenType.ELSE, Literal: "else" },
		{ Type: TokenType.LBRACE, Literal: "{" },
		{ Type: TokenType.RETURN, Literal: "return" },
		{ Type: TokenType.FALSE, Literal: "false" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.RBRACE, Literal: "}"},
		{ Type: TokenType.INT, Literal: "10" },
		{ Type: TokenType.EQUAL, Literal: "==" },
		{ Type: TokenType.INT, Literal: "10" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.INT, Literal: "10" },
		{ Type: TokenType.NOTEQUAL, Literal: "!=" },
		{ Type: TokenType.INT, Literal: "9" },
		{ Type: TokenType.SEMICOLON, Literal: ";" },
		{ Type: TokenType.EOF, Literal: "EOF" },
    ];

    const lexer: Tokenizer = new Tokenizer(input);

    for (const testToken of tokens) {
        const token: Token = lexer.getNextToken();

        expect(token.Type).toEqual(testToken.Type);
        expect(token.Literal).toEqual(testToken.Literal);
    }
});

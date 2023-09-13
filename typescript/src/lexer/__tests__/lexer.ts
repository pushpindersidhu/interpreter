import { TokenType } from "./lexer.ts";

test("test getNextToken()", function() {
    input:= `=+(){},;`;

    const tokens = {
        Token.P:

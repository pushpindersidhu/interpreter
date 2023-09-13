import readline from "readline";
import { Tokenizer } from "../lexer";
import { Token, TokenType } from "../token";

export function repl() {
    const PROMPT = ">>> ";

    const rs = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });

    rs.on("line", function (input: string) {
        const lexer: Tokenizer = new Tokenizer(input);

        while (true) {
            const token: Token = lexer.getNextToken();

            console.log(token);

            if (token.Type == TokenType.EOF) {
                rs.prompt();
                break;
            }
        }
    });

    rs.prompt();
}

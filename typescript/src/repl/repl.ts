import readline from "readline";
import { Lexer } from "../lexer";
import { Token, Tokens } from "../token";

export function repl() {
    const PROMPT = ">>> ";

    const rs = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });

    rs.on("line", function (input: string) {
        const lexer = new Lexer(input);

        while (true) {
            const token = lexer.nextToken();

            console.log(token);

            if (token.type == Tokens.EOF) {
                rs.prompt();
                break;
            }
        }
    });

    rs.prompt();
}

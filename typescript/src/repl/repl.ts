import readline from "readline";
import { Lexer } from "../lexer";
import { Token, Tokens } from "../token";
import { Parser } from "../parser";

export function repl() {
    const PROMPT = ">>> ";

    const rs = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });

    rs.on("line", function (input: string) {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        console.log(program.toString());

        rs.prompt();
    });

    rs.prompt();
}

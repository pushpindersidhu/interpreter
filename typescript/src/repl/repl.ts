import readline from "readline";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { Evaluator } from "../evaluator";
import { Environment } from "../object";

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
        const evaluator = new Evaluator();
        const env = new Environment();

        const evaluated = evaluator.eval(program, env);
        console.log(evaluated.inspect());

        rs.prompt();
    });

    rs.prompt();
}

import fs from "fs";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Evaluator } from "./evaluator";
import { Environment, Error } from "./object";
import { repl } from "./repl";

const args = process.argv.slice(2);

switch (args.length) {
    case 1:
        const filename = args[0];
        if (!fs.existsSync(filename)) {
            console.error(`Error: no such file or directory: ${filename}`);
            process.exit(1);
        }

        const input = fs.readFileSync(filename, "utf-8");
        const env = new Environment();

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        const evaluator = new Evaluator();

        const result = evaluator.eval(program, env);

        if (result instanceof Error) {
            console.log(result.inspect());
        }

        process.exit(0);

    case 0:
        repl();
        break;

    default:
        console.error("Usage: [filename]");
}

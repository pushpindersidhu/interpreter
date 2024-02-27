package main

import (
	"interpreter/repl"
    "interpreter/lexer"
    "interpreter/parser"
    "interpreter/evaluator"
    "interpreter/object"
    "fmt"
	"os"
)

func main() {
    args := os.Args
    if len(args) > 1 {
        filepath := args[1]
        if _, err := os.Stat(filepath); os.IsNotExist(err) {
            fmt.Println("Error: ", err)
            return
        }

        srcBytes, err := os.ReadFile(filepath)
        if err != nil {
            fmt.Println("Error: ", err)
            return
        }

        src := string(srcBytes)

        l := lexer.New(src)
        p := parser.New(l)
        program := p.ParseProgram()

        if len(p.Errors()) != 0 {
            fmt.Println("Parser errors: ", p.Errors())
            return
        }

        env := object.NewEnvironment()
        result := evaluator.Eval(program, env)

        if result != nil && result.Type() == object.ERROR_OBJ {
            fmt.Println(result.Inspect())
        }

        return
    }

	repl.Start(os.Stdin, os.Stdout)
}

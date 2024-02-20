package main

import (
	"interpreter/repl"
	"os"
)

func main() {
	repl.Start(os.Stdin, os.Stdout)
}

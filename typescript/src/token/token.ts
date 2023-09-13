export const TokenType = {
    EOF: "EOF",
    IDENT: "IDENT",
    ILLEGAL: "ILLEGAL",
    INT: "INT",

    ASSIGN: "=",
    PLUS: "+",
    MINUS: "-",
    BANG: "!",
    ASTERISK: "*",
    SLASH: "/",
    LT: "<",
    GT: ">",
    EQUAL: "==",
    NOTEQUAL: "!=",

    COMMA: ",",
    SEMICOLON: ";",
    LPAREN: "(",
    RPAREN: ")",
    LBRACE: "{",
    RBRACE: "}",

    LET: "LET",
    TRUE: "TRUE",
    FALSE: "FALSE",
    IF: "IF",
    ELSE: "ELSE",
    FUNCTION: "FUNCTION",
    RETURN: "RETURN",
} as const;

export const Keywords = {
    fn: TokenType.FUNCTION,
    let: TokenType.LET,
    true: TokenType.TRUE,
    false: TokenType.FALSE,
    if: TokenType.IF,
    else: TokenType.ELSE,
    return: TokenType.RETURN,
}

export function lookUpIdent(ident: string): TokenItem {
    return Keywords[ident as keyof typeof Keywords] || TokenType.IDENT;
}

export type TokenItem = (typeof TokenType)[keyof typeof TokenType];

export type Token = {
    Type: TokenItem;
    Literal: string;
};

type Identifier = {
    Token: Token;
    Value: string;
}

type Expression = {

}

type LetStatement = {
    Token: Token;
    Name: Identifier;
    Value: Expression;
}


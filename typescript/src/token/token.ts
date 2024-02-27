export const Tokens = {
    EOF: "EOF",
    IDENT: "IDENT",
    ILLEGAL: "ILLEGAL",
    INT: "INT",
    STRING: "STRING",

    ASSIGN: "=",
    PLUS: "+",
    MINUS: "-",
    BANG: "!",
    ASTERISK: "*",
    SLASH: "/",
    LT: "<",
    GT: ">",
    EQ: "==",
    NOT_EQ: "!=",

    COMMA: ",",
    SEMICOLON: ";",
    LPAREN: "(",
    RPAREN: ")",
    LBRACE: "{",
    RBRACE: "}",
    LBRACKET: "[",
    RBRACKET: "]",

    LET: "LET",
    TRUE: "TRUE",
    FALSE: "FALSE",
    IF: "IF",
    ELSE: "ELSE",
    FUNCTION: "FUNCTION",
    RETURN: "RETURN",
} as const;

export const Keywords = {
    fn: Tokens.FUNCTION,
    let: Tokens.LET,
    true: Tokens.TRUE,
    false: Tokens.FALSE,
    if: Tokens.IF,
    else: Tokens.ELSE,
    return: Tokens.RETURN,
};

export function lookUpIdent(ident: string): TokenType {
    return Keywords[ident as keyof typeof Keywords] || Tokens.IDENT;
}

export type TokenType = (typeof Tokens)[keyof typeof Tokens];

export type Token = {
    type: TokenType;
    literal: string;
};

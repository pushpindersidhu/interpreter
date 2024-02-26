import { Identifier, BlockStatement } from "../ast";
import { Environment } from "./environment";

export const ObjectTypes = {
    NULL: "NULL",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ERROR: "ERROR",
    FUNCTION: "FUNCTION",
    RETURN_VALUE: "RETURN_VALUE",
};

export type ObjectType = (typeof ObjectTypes)[keyof typeof ObjectTypes];

export interface Object {
    type: ObjectType;
    inspect: () => string;
}

export class Null implements Object {
    type = ObjectTypes.NULL;

    inspect(): string {
        return "null";
    }
}

export class Integer implements Object {
    type = ObjectTypes.INTEGER;
    value: number;

    constructor(value: number) {
        this.value = value;
    }

    inspect(): string {
        return this.value.toString();
    }
}

export class Boolean implements Object {
    type = ObjectTypes.BOOLEAN;
    value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    inspect(): string {
        return this.value.toString();
    }
}

export class Error implements Object {
    type = ObjectTypes.ERROR;
    msg: string;

    constructor(msg: string) {
        this.msg = msg;
    }

    inspect(): string {
        return this.msg;
    }
}

export class Function implements Object {
    type = ObjectTypes.FUNCTION;
    parameters: Identifier[];
    body: BlockStatement;
    env: Environment;

    constructor(parameters: Identifier[], body: BlockStatement, env: Environment) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }

    inspect(): string {
        return `fn(${this.parameters.join(", ")}) {\n${this.body.toString()}\n}`;
    }
}

export class ReturnValue implements Object {
    type = ObjectTypes.RETURN_VALUE;
    value: Object;

    constructor(value: Object) {
        this.value = value;
    }

    inspect(): string {
        return this.value.inspect();
    }
}


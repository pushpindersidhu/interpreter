export const ObjectTypes = {
    NULL: "NULL",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
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

export const ObjectTypes = {
    NULL: "NULL",
    INTEGER: "INTEGER",
};

export type ObjectType = (typeof ObjectTypes)[keyof typeof ObjectTypes];

export interface Object {
    type: ObjectType;
    inspect: () => string;
}

export class Null implements Object {
    type = ObjectTypes.NULL;

    inspect() {
        return "null";
    }
}

export class Integer implements Object {
    type = ObjectTypes.INTEGER;
    value: number;

    constructor(value: number) {
        this.value = value;
    }

    inspect() {
        return this.value.toString();
    }
}

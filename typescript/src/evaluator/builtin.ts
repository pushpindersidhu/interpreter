import {
    Object,
    ObjectTypes,
    Integer,
    Error,
    Array,
    String,
    Null,
} from "../object";

type BuiltInFn = (...args: Object[]) => Object;

function invalidArgumentsError(expected: number, got: number): Object {
    return new Error(
        `invalid number of arguments. expected ${expected}, got ${got}`,
    );
}

function typeError(fn: string, type: string): Object {
    return new Error(`type ${type} has no method ${fn}`);
}

export const Builtins: { [key: string]: BuiltInFn } = {
    len: (...args: Object[]): Object => {
        if (args.length !== 1) {
            return invalidArgumentsError(1, args.length);
        }

        if (args[0].type === ObjectTypes.STRING) {
            return new Integer((args[0] as String).value.length);
        }

        if (args[0].type === ObjectTypes.ARRAY) {
            return new Integer((args[0] as Array).elements.length);
        }

        return typeError("len", args[0].type);
    },

    first: (...args: Object[]): Object => {
        if (args.length !== 1) {
            return invalidArgumentsError(1, args.length);
        }

        if (args[0].type !== ObjectTypes.ARRAY) {
            return typeError("first", args[0].type);
        }

        const arr = args[0] as Array;
        if (arr.elements.length > 0) {
            return arr.elements[0];
        }

        return new Null();
    },

    last: (...args: Object[]): Object => {
        if (args.length !== 1) {
            return invalidArgumentsError(1, args.length);
        }

        if (args[0].type !== ObjectTypes.ARRAY) {
            return typeError("last", args[0].type);
        }

        const arr = args[0] as Array;
        if (arr.elements.length > 0) {
            return arr.elements[arr.elements.length - 1];
        }

        return new Null();
    },

    rest: (...args: Object[]): Object => {
        if (args.length !== 1) {
            return invalidArgumentsError(1, args.length);
        }

        if (args[0].type !== ObjectTypes.ARRAY) {
            return typeError("rest", args[0].type);
        }

        const arr = args[0] as Array;
        if (arr.elements.length > 0) {
            return new Array(arr.elements.slice(1));
        }

        return new Null();
    },

    push: (...args: Object[]): Object => {
        if (args.length !== 2) {
            return invalidArgumentsError(2, args.length);
        }

        if (args[0].type !== ObjectTypes.ARRAY) {
            return typeError("push", args[0].type);
        }

        const arr = args[0] as Array;
        const newElements = arr.elements.slice();
        newElements.push(args[1]);
        return new Array(newElements);
    },

    puts: (...args: Object[]): Object => {
        for (const arg of args) {
            console.log(arg.inspect());
        }
        return new Null();
    },
};

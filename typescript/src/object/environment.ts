import { Object } from "./object";

export class Environment {
    private store: { [key: string]: Object };
    private outer: Environment | null = null;

    constructor(outer: Environment | null = null) {
        this.store = {};
        this.outer = outer;
    }

    public get(name: string): Object | null {
        const obj = this.store[name];
        if (obj) {
            return obj;
        }

        if (this.outer) {
            return this.outer.get(name);
        }

        return null;
    }

    public set(name: string, value: Object): Object {
        this.store[name] = value;
        return value;
    }
}

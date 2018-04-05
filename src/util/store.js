// es5 implementation of both Map and Set

let idIndex = 0;

export default class Store {
    constructor() {
        this.store = {};
        this._keys = [];
    }
    keys(){
        return this._keys[Symbol.iterator]()
    }
    add(obj) {
        const id = `${new Date().getTime()}${idIndex}`;
        idIndex += 1;
        this._keys.push(id);
        this.store[id] = obj;
    }
    set(id, obj) {
        this._keys.push(id);
        this.store[id] = obj;
        return this;
    }
    get(id) {
        return this.store[id];
    }
    has(id) {
        return this._keys.indexOf(id) !== -1;
    }
    delete(id) {
        delete this.store[id];
        const index = this._keys.indexOf(id);
        if (index > -1) {
            this._keys.splice(index, 1);
        }
        return this;
    }
    values() {
        const elements = [];
        const l = this._keys.length;
        for (let i = 0; i < l; i += 1) {
            const element = this.store[this._keys[i]];
            elements.push(element);
        }
        return elements;
    }
    forEach(cb) {
        const l = this._keys.length;
        for (let i = 0; i < l; i += 1) {
            const element = this.store[this._keys[i]];
            cb(element);
        }
    }
    clear() {
        this._keys = [];
        this.store = {};
    }
}

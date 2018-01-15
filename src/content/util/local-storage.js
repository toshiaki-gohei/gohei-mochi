'use strict';

const isAvailable = Symbol();
const localStorage = Symbol();

export default class LocalStorage {
    constructor() {
        this[isAvailable] = false;
        this[localStorage] = null;

        this._init();
    }

    get isAvailable() { return this[isAvailable]; }

    _init() {
        if (typeof window === 'undefined') return;
        let storage = window.localStorage;
        if (storage == null) return;

        this[isAvailable] = true;
        this[localStorage] = storage;
    }

    get(key) {
        if (!this.isAvailable) return null;
        return this[localStorage].getItem(key);
    }

    set(key, value) {
        if (!this.isAvailable) return;
        this[localStorage].setItem(key, value);
    }

    delete(key) {
        if (!this.isAvailable) return;
        this[localStorage].removeItem(key);
    }

    clear() {
        if (!this.isAvailable) return;
        this[localStorage].clear();
    }
}

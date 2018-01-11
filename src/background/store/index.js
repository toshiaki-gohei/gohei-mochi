'use strict';
import EventEmitter from '~/common/event-emitter';
import tabsFuns, { create as createTabs } from './tabs';

const emitter = Symbol();
const tabs = Symbol();

const funsMap = {
    tabs: tabsFuns
};

export default class Store {
    constructor() {
        this[emitter] = new EventEmitter();
        this[tabs] = createTabs();
    }

    get emitter() { return this[emitter]; }
    get tabs() { return this[tabs]; }

    emit(...args) { this[emitter].emit(...args); }
    on(...args) { this[emitter].on(...args); }
    once(...args) { this[emitter].once(...args); }
    off(...args) { this[emitter].removeListener(...args); }

    add(type, ...opts) {
        let funs = funsMap[type];
        if (funs == null) throw new Error(`unknown type: ${type}`);
        if (funs.add == null) throw new Error(`function is not defined: ${type}.add`);

        return funs.add(this[type], ...opts);
    }

    set(type, ...opts) {
        let funs = funsMap[type];
        if (funs == null) throw new Error(`unknown type: ${type}`);
        if (funs.set == null) throw new Error(`function is not defined: ${type}.set`);

        let ret = funs.set(this[type], ...opts);
        this.emit(`change:${type}`, ret);
        return ret;
    }

    remove(type, ...opts) {
        let funs = funsMap[type];
        if (funs == null) throw new Error(`unknown type: ${type}`);
        if (funs.remove == null) throw new Error(`function is not defined: ${type}.remove`);

        return funs.remove(this[type], ...opts);
    }

    tab(tabId) { return this.tabs.get(tabId) || null; }
}

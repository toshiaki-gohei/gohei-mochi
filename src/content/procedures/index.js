'use strict';
import * as catalog from './catalog';
import * as delreq from './delreq';
import * as popup from './popup';
import * as preferences from './preferences';
import * as thread from './thread';
import * as worker from './worker';
import * as sync from './sync';

function defaultMap(store) {
    return {
        ...makeMap(store, 'catalog', catalog),
        ...makeMap(store, 'delreq', delreq),
        ...makeMap(store, 'popup', popup),
        ...makeMap(store, 'preferences', preferences),
        ...makeMap(store, 'thread', thread),
        ...makeMap(store, 'worker', worker),
        ...makeMap(store, 'sync', sync)
    };
}

export default function procedures(store, map) {
    map = map || defaultMap(store);

    function commit(procedure, ...args) {
        let fn = map[procedure];
        if (fn == null) throw new TypeError(`mapped procedure not found: ${procedure}`);

        if (/^sync/.test(procedure)) {
            return fn(...args);
        }

        return new Promise(resolve => {
            let ret = fn(...args);
            resolve(ret);
        });
    }

    return commit;
}

function makeMap(store, namespace, functions) {
    let ret = {};
    for (let [ name, fn ] of Object.entries(functions)) {
        ret[`${namespace}/${name}`] = (...args) => fn(store, ...args);
    }
    return ret;
}

export const internal = {
    defaultMap,
    makeMap
};

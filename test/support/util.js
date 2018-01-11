'use strict';

// It is incomplete, but this is enough.
export function deepCopy(state) {
    let ret = {};
    for (let prop in state) {
        let x = state[prop];
        switch (true) {
        case x === null:
        case Array.isArray(x):
        case x instanceof Date:
            ret[prop] = x;
            break;
        case typeof x === 'object':
            ret[prop] = deepCopy(x);
            break;
        default:
            ret[prop] = x;
        }
    }
    return ret;
}

export function pick(orig, ...props) {
    if (orig == null) return null;
    return props.reduce((obj, prop) => {
        obj[prop] = orig[prop];
        return obj;
    }, {});
}

export function pluckFromMap(map, ...props) {
    let ret = [];
    for (let [ , value ] of map) {
        ret.push(pick(value, ...props));
    }
    return ret;
}

export function externals(exports) {
    return Object.keys(exports).reduce((list, name) => {
        if (name === 'internal') return list;
        list.push(exports[name]);
        return list;
    }, []);
}

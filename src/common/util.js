'use strict';

export function F(obj) {
    if (process.env.NODE_ENV === 'production') return obj;
    return Object.freeze(obj);
}

// It is incomplete, but this is enough.
export function deepCopy(obj) {
    let ret = {};
    for (let prop in obj) {
        let x = obj[prop];
        switch (true) {
        case x === null:
            ret[prop] = x;
            break;
        case Array.isArray(x):
            ret[prop] = x.slice();
            break;
        case x instanceof Date:
            ret[prop] = new Date(x);
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

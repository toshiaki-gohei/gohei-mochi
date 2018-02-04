'use strict';

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

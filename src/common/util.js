'use strict';

export function F(obj) {
    if (process.env.NODE_ENV === 'production') return obj;
    return Object.freeze(obj);
}

'use strict';

const funs = [
    'l', 'ucount', 'setoebtn',
    'scrll', 'reszk'
];

function defineFunctions() {
    for (let fn of funs) {
        if (typeof window[fn] !== 'undefined') continue;
        window[fn] = function () {};
    }
}

defineFunctions();

'use strict';

export function sleep(msec) {
    return new Promise(resolve => {
        setTimeout(resolve, msec);
    });
}

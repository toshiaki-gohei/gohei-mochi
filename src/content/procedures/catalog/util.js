'use strict';

export function contains(url, threads) {
    for (let threadUrl of threads) {
        if (url === threadUrl) return true;
    }
    return false;
}

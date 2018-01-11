'use strict';

export function isFirefox() {
    return typeof browser !== 'undefined' && typeof chrome !== 'undefined';
}

export function isChrome() {
    return typeof browser === 'undefined' && typeof chrome !== 'undefined';
}

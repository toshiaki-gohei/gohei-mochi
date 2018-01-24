'use strict';

export function $(id) {
    return typeof id === 'string' ? document.getElementById(id) : null;
}

export function createElement(tagName, attrs = {}) {
    let $el = document.createElement(tagName);
    for (let name in attrs) {
        $el.setAttribute(name, attrs[name]);
    }
    return $el;
}

export function tagName($el) {
    if ($el == null) return null;
    if ($el.tagName == null) return null;
    return $el.tagName.toLowerCase();
}

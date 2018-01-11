'use strict';
import { isFirefox } from '~/common/browser';

export function sendMessage(...args) {
    if (isFirefox()) return chrome.runtime.sendMessage(...args);

    return new Promise(resolve => {
        chrome.runtime.sendMessage(...args, resolve);
    });
}

export function initializeBodyStyle($body) {
    // remove attributes of body reliably
    [ 'bgcolor', 'text', 'link', 'vlink', 'alink' ].forEach(attr => {
        $body.removeAttribute(attr);
    });

    $body.classList.add('gohei');
}

export function removeChildNodes($el) {
    let removed = [];
    if ($el == null) return removed;

    let ELEMENT_NODE = window.Node.ELEMENT_NODE;
    let $nodes = $el.childNodes;

    for (let i = $nodes.length - 1; i >= 0; --i) {
        let $node = $nodes[i];

        if (/^gohei-/.test($node.id)) continue;
        $node.parentNode.removeChild($node);

        if ($node.nodeType !== ELEMENT_NODE) continue;
        removed.unshift($node);
    }

    return removed;
}

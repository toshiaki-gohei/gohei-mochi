'use strict';

export function tagName($el) {
    if ($el == null) return null;
    if ($el.tagName == null) return null;
    return $el.tagName.toLowerCase();
}

export function parseTitle($body) {
    let $tit = $body.querySelector('#tit');
    if ($tit == null) return null;
    return $tit.textContent;
}

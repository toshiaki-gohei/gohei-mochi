'use strict';

export function parseTitle($body) {
    let $tit = $body.querySelector('#tit');
    if ($tit == null) return null;
    return $tit.textContent;
}
